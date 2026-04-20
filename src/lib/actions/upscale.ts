'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getTaskStatus } from '@/lib/ai'
import {
	convertToAdobeRgb,
	computePrintDpi,
} from '@/lib/image-processing'
import { checkUpscaleStatusSchema } from '@/validators/admin'
import { captureServerError } from '@/lib/observability'
import {
	triggerUpscaleInternal,
	DEFAULT_UPSCALE_FACTOR,
	type TriggerUpscaleData,
} from '@/lib/print-pipeline/trigger-upscale'
import type { ActionResult } from '@/types/actions'
import type { UpscaleStatus } from '@/types/supabase'
import type { KieTaskState } from '@/lib/ai'

export interface UpscaleStatusData {
	state: KieTaskState
	upscaleStatus: UpscaleStatus
	printImagePath: string | null
	printDpi: number | null
}

async function requireAdmin() {
	const supabase = await createClient()
	const { data: { user }, error } = await supabase.auth.getUser()
	if (error || !user) redirect('/login')
	if (user.app_metadata?.role !== 'admin') redirect('/')
	return { user, supabase }
}

function revalidateOrder(orderId: string) {
	revalidatePath('/admin/orders')
	revalidatePath(`/admin/orders/${orderId}`)
}

/**
 * Matches the prefix scheme used in `generateArtwork` / `checkGenerationStatus`
 * so print files live next to originals/generated in Storage. Guest orders
 * share a flat `guest/` folder (not keyed on session id) to keep paths stable.
 */
function getStoragePrefix(order: { user_id: string | null }): string {
	return order.user_id ?? 'guest'
}

/**
 * Admin-guarded wrapper around `triggerUpscaleInternal` for manual retries
 * from the admin order detail UI. All callers that are NOT the admin UI
 * (Stripe webhook, post-generation auto-trigger) should import the internal
 * helper directly from `@/lib/print-pipeline/trigger-upscale` — that module
 * is `import 'server-only'` and therefore never exposed via the Server
 * Action RPC layer.
 */
export async function triggerUpscale(
	orderId: string,
): Promise<ActionResult<TriggerUpscaleData>> {
	await requireAdmin()
	return triggerUpscaleInternal(orderId)
}

/**
 * Poll the Topaz upscale task and, when ready, convert the upscaled output
 * to the AdobeRGB print JPEG and persist it to Storage + the order row.
 *
 * Idempotent: if the order already has a `success` upscale status with a
 * `print_image_path`, we return that state without re-running side effects.
 * On `fail`, admin can trigger a fresh run via `triggerUpscale`.
 */
export async function checkUpscaleStatus(
	orderId: string,
): Promise<ActionResult<UpscaleStatusData>> {
	await requireAdmin()

	const parsed = checkUpscaleStatusSchema.safeParse({ orderId })
	if (!parsed.success) {
		return { success: false, error: 'errors.invalidInput' }
	}

	const adminDb = createAdminClient()

	const { data: order, error: orderError } = await adminDb
		.from('orders')
		.select(
			'id, user_id, upscale_task_id, upscale_status, print_image_path, print_dpi, format_id',
		)
		.eq('id', parsed.data.orderId)
		.single()

	if (orderError || !order) {
		return { success: false, error: 'errors.orderNotFound' }
	}

	// Short-circuit terminal states so we don't re-download the print file.
	if (order.upscale_status === 'success' && order.print_image_path) {
		return {
			success: true,
			data: {
				state: 'success',
				upscaleStatus: 'success',
				printImagePath: order.print_image_path,
				printDpi: order.print_dpi,
			},
		}
	}

	if (!order.upscale_task_id) {
		return { success: false, error: 'errors.generic' }
	}

	let status: Awaited<ReturnType<typeof getTaskStatus>>
	try {
		status = await getTaskStatus(order.upscale_task_id)
	} catch (err) {
		console.error('[checkUpscaleStatus] Kie getTaskStatus', err)
		await captureServerError(err, {
			action: 'checkUpscaleStatus',
			stage: 'poll',
			orderId: order.id,
			taskId: order.upscale_task_id,
			factor: DEFAULT_UPSCALE_FACTOR,
		})
		return { success: false, error: 'errors.generic' }
	}

	if (status.state === 'fail') {
		// Provider-side failure message is logged server-only and never returned
		// to the client, matching the pattern in `checkGenerationStatus`.
		console.error(
			`[checkUpscaleStatus] Kie task ${order.upscale_task_id} failed:`,
			status.failMsg,
		)
		await captureServerError(new Error('Topaz upscale failed'), {
			action: 'checkUpscaleStatus',
			stage: 'task_fail',
			orderId: order.id,
			taskId: order.upscale_task_id,
			factor: DEFAULT_UPSCALE_FACTOR,
			failCode: status.failCode ?? undefined,
		})

		await adminDb
			.from('orders')
			.update({
				upscale_status: 'fail' satisfies UpscaleStatus,
				upscale_cost_time_ms: status.costTime || null,
			})
			.eq('id', order.id)

		revalidateOrder(order.id)
		return {
			success: true,
			data: {
				state: 'fail',
				upscaleStatus: 'fail',
				printImagePath: null,
				printDpi: null,
			},
		}
	}

	if (status.state !== 'success' || !status.resultUrls?.length) {
		return {
			success: true,
			data: {
				state: status.state,
				upscaleStatus: order.upscale_status ?? 'processing',
				printImagePath: order.print_image_path,
				printDpi: order.print_dpi,
			},
		}
	}

	// Success: download upscaled result → convert to AdobeRGB → upload print.jpg
	const resultUrl = status.resultUrls[0]
	const storagePrefix = getStoragePrefix(order)
	const printPath = `${storagePrefix}/print/${order.id}.jpg`

	try {
		const res = await fetch(resultUrl)
		if (!res.ok) {
			throw new Error(`Topaz result fetch failed (${res.status})`)
		}
		const upscaledBuffer = Buffer.from(await res.arrayBuffer())

		const printFile = await convertToAdobeRgb(upscaledBuffer)

		const { error: uploadError } = await adminDb.storage
			.from('images')
			.upload(printPath, printFile.buffer, {
				contentType: 'image/jpeg',
				upsert: true,
			})

		if (uploadError) {
			throw uploadError
		}

		// Compute DPI against the selected print format (if any). We use the
		// longest side so orientation mismatches don't skew the result. Orders
		// without a format_id (pre-Fas 8 legacy) get null DPI, which the admin
		// UI will render as "unknown" rather than misleading 0.
		let printDpi: number | null = null
		if (order.format_id) {
			const { data: fmt } = await adminDb
				.from('print_formats')
				.select('width_cm, height_cm')
				.eq('id', order.format_id)
				.single()
			if (fmt) {
				const longestCm = Math.max(fmt.width_cm, fmt.height_cm)
				printDpi = computePrintDpi(
					printFile.width,
					printFile.height,
					longestCm,
				)
			}
		}

		const { error: updateError } = await adminDb
			.from('orders')
			.update({
				upscale_status: 'success' satisfies UpscaleStatus,
				upscale_cost_time_ms: status.costTime || null,
				print_image_path: printPath,
				print_dpi: printDpi,
			})
			.eq('id', order.id)

		if (updateError) {
			throw updateError
		}

		revalidateOrder(order.id)

		return {
			success: true,
			data: {
				state: 'success',
				upscaleStatus: 'success',
				printImagePath: printPath,
				printDpi,
			},
		}
	} catch (err) {
		console.error('[checkUpscaleStatus] process result', err)
		await captureServerError(err, {
			action: 'checkUpscaleStatus',
			stage: 'download_convert_upload',
			orderId: order.id,
			taskId: order.upscale_task_id,
			factor: DEFAULT_UPSCALE_FACTOR,
		})

		await adminDb
			.from('orders')
			.update({ upscale_status: 'fail' satisfies UpscaleStatus })
			.eq('id', order.id)

		revalidateOrder(order.id)
		return { success: false, error: 'errors.generic' }
	}
}

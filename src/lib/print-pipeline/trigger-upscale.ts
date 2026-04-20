import 'server-only'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { createUpscaleTask, type UpscaleFactor } from '@/lib/ai'
import { triggerUpscaleSchema } from '@/validators/admin'
import { captureServerError } from '@/lib/observability'
import type { ActionResult } from '@/types/actions'
import type { UpscaleStatus } from '@/types/supabase'

/**
 * Always 4x for now — keeps cost / quality modelling simple.
 * Future work (Fas 14 "smart upscale-factor" follow-up) may tune per-format
 * based on `requiredLongestPx`. Exported so other pipeline modules can tag
 * telemetry/events with the same source-of-truth value.
 */
export const DEFAULT_UPSCALE_FACTOR: UpscaleFactor = '4'

export interface TriggerUpscaleData {
	orderId: string
	taskId: string
}

/**
 * SECURITY: This module is deliberately NOT a `'use server'` file. Functions
 * here are callable only from other server-side code (Route Handlers, Server
 * Actions, `after()`-deferred work), never from the browser. The Next.js
 * Server Action RPC layer would auto-expose any exported async function from
 * a `'use server'` module — we avoid that here because this helper has no
 * caller-level authorization (by design).
 *
 * Callers must provide their own authorization:
 * - Stripe webhook: verified signature
 * - `checkGenerationStatus`: verified order ownership (user / guest session)
 * - Admin UI retry: wrapped in `requireAdmin()` via
 *   `src/lib/actions/upscale.ts#triggerUpscale`
 */

function revalidateOrder(orderId: string) {
	revalidatePath('/admin/orders')
	revalidatePath(`/admin/orders/${orderId}`)
}

/**
 * Kick off a Topaz upscale job for an order's existing `generated_image_path`.
 *
 * Preconditions:
 * - Order exists and has a non-null `generated_image_path`.
 * - Order is not already in `processing` or `success` for upscale (idempotent
 *   guard — admin can reset via `upscale_status = 'fail'` or `null`).
 *
 * Side effects:
 * - Writes `upscale_task_id` and `upscale_status = 'processing'` on the order.
 * - Revalidates admin orders path.
 */
export async function triggerUpscaleInternal(
	orderId: string,
): Promise<ActionResult<TriggerUpscaleData>> {
	const parsed = triggerUpscaleSchema.safeParse({ orderId })
	if (!parsed.success) {
		return { success: false, error: 'errors.invalidInput' }
	}

	const adminDb = createAdminClient()

	const { data: order, error: orderError } = await adminDb
		.from('orders')
		.select(
			'id, user_id, generated_image_path, upscale_status, upscale_task_id',
		)
		.eq('id', parsed.data.orderId)
		.single()

	if (orderError || !order) {
		return { success: false, error: 'errors.orderNotFound' }
	}

	if (!order.generated_image_path) {
		return { success: false, error: 'errors.artworkNotReady' }
	}

	if (
		order.upscale_status === 'processing' ||
		order.upscale_status === 'success'
	) {
		return {
			success: true,
			data: {
				orderId: order.id,
				taskId: order.upscale_task_id ?? '',
			},
		}
	}

	const { data: urlData } = adminDb.storage
		.from('images')
		.getPublicUrl(order.generated_image_path)

	if (!urlData?.publicUrl) {
		return { success: false, error: 'errors.generic' }
	}

	let taskId: string
	try {
		const result = await createUpscaleTask(
			urlData.publicUrl,
			DEFAULT_UPSCALE_FACTOR,
		)
		taskId = result.taskId
	} catch (err) {
		console.error('[triggerUpscaleInternal] Kie createUpscaleTask', err)
		await captureServerError(err, {
			action: 'triggerUpscaleInternal',
			stage: 'create_task',
			orderId: order.id,
			factor: DEFAULT_UPSCALE_FACTOR,
		})
		await adminDb
			.from('orders')
			.update({ upscale_status: 'fail' satisfies UpscaleStatus })
			.eq('id', order.id)
		revalidateOrder(order.id)
		return { success: false, error: 'errors.generic' }
	}

	const { error: updateError } = await adminDb
		.from('orders')
		.update({
			upscale_task_id: taskId,
			upscale_status: 'processing' satisfies UpscaleStatus,
		})
		.eq('id', order.id)

	if (updateError) {
		console.error('[triggerUpscaleInternal] order update', updateError)
		await captureServerError(updateError, {
			action: 'triggerUpscaleInternal',
			stage: 'order_update',
			orderId: order.id,
			taskId,
			factor: DEFAULT_UPSCALE_FACTOR,
		})
		return { success: false, error: 'errors.generic' }
	}

	revalidateOrder(order.id)
	return { success: true, data: { orderId: order.id, taskId } }
}

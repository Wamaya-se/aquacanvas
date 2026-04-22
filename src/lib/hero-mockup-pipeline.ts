import 'server-only'

import { createAdminClient } from '@/lib/supabase/admin'
import {
	createEnvironmentPreviewTask,
	getTaskStatus,
	uploadFileToKie,
} from '@/lib/ai'
import type { ActionResult } from '@/types/actions'
import type { PreviewStatus } from '@/types/supabase'
import { captureServerError } from '@/lib/observability'
import {
	HERO_MOCKUP_PATHS,
	resolveHeroMockupOrientation,
} from '@/lib/hero-mockup-scenes'

export interface HeroMockupStatus {
	status: PreviewStatus
	imageUrl: string | null
}

export interface HeroMockupOrderRow {
	id: string
	user_id: string | null
	guest_session_id: string | null
	status: string
	orientation: string | null
	generated_image_path: string | null
	generated_width_px: number | null
	generated_height_px: number | null
	hero_mockup_status: PreviewStatus
	hero_mockup_task_id: string | null
	hero_mockup_image_path: string | null
}

export const HERO_MOCKUP_ORDER_SELECT = [
	'id',
	'user_id',
	'guest_session_id',
	'status',
	'orientation',
	'generated_image_path',
	'generated_width_px',
	'generated_height_px',
	'hero_mockup_status',
	'hero_mockup_task_id',
	'hero_mockup_image_path',
].join(', ')

type HeroMockupFailStage =
	| 'master_fetch'
	| 'master_upload'
	| 'artwork_fetch'
	| 'artwork_upload'
	| 'task_create'
	| 'order_update'
	| 'poll'
	| 'download_upload'

function getErrorMessage(err: unknown): string {
	if (err instanceof Error) return err.message
	if (typeof err === 'string') return err
	try {
		return JSON.stringify(err)
	} catch {
		return 'Unknown error'
	}
}

/**
 * Derives the Storage prefix for an order row. Matches the convention used by
 * `generateArtwork` / `checkGenerationStatus` — user orders live under their
 * user id, guest orders share a flat `guest/` folder.
 */
export function getStoragePrefixForOrder(order: {
	user_id: string | null
}): string {
	return order.user_id ?? 'guest'
}

/**
 * Kicks off a hero-mockup Kie task for `order`. Skips when already in
 * progress or completed (idempotent). No authorization is performed here —
 * callers MUST gate on owner or admin before invoking.
 */
export async function triggerHeroMockup(
	order: HeroMockupOrderRow,
): Promise<ActionResult<HeroMockupStatus>> {
	const adminDb = createAdminClient()

	if (
		order.status !== 'generated'
		&& order.status !== 'paid'
		&& order.status !== 'shipped'
	) {
		return { success: false, error: 'errors.artworkNotReady' }
	}

	if (!order.generated_image_path) {
		return { success: false, error: 'errors.artworkNotReady' }
	}

	// Idempotency: skip if already in-flight or done. Callers can poll
	// instead of generating a second task.
	if (
		order.hero_mockup_status === 'processing'
		|| order.hero_mockup_status === 'success'
	) {
		const imageUrl = order.hero_mockup_image_path
			? adminDb.storage.from('images').getPublicUrl(order.hero_mockup_image_path).data.publicUrl
			: null
		return {
			success: true,
			data: { status: order.hero_mockup_status, imageUrl },
		}
	}

	const orientation = resolveHeroMockupOrientation(
		order.orientation,
		order.generated_width_px,
		order.generated_height_px,
	)
	if (!orientation) {
		return { success: false, error: 'errors.invalidInput' }
	}

	const masterPath = HERO_MOCKUP_PATHS[orientation]

	let stage: HeroMockupFailStage = 'master_fetch'
	try {
		const { data: masterData } = adminDb.storage
			.from('images')
			.getPublicUrl(masterPath)

		const masterRes = await fetch(masterData.publicUrl)
		if (!masterRes.ok) {
			throw new Error(
				`Fetch master failed (${masterRes.status}): ${masterPath}`,
			)
		}

		stage = 'master_upload'
		const masterBuffer = await masterRes.arrayBuffer()
		const masterKieUrl = await uploadFileToKie(
			masterBuffer,
			'image/jpeg',
			`hero-mockup-${orientation}.jpeg`,
		)

		stage = 'artwork_fetch'
		const { data: artworkData } = adminDb.storage
			.from('images')
			.getPublicUrl(order.generated_image_path)

		const artworkRes = await fetch(artworkData.publicUrl)
		if (!artworkRes.ok) {
			throw new Error(`Fetch artwork failed: ${artworkRes.status}`)
		}

		stage = 'artwork_upload'
		const artworkBuffer = await artworkRes.arrayBuffer()
		const artworkKieUrl = await uploadFileToKie(
			artworkBuffer,
			'image/png',
			'artwork.png',
		)

		stage = 'task_create'
		const { taskId } = await createEnvironmentPreviewTask(
			artworkKieUrl,
			masterKieUrl,
		)

		stage = 'order_update'
		const { error: updateError } = await adminDb
			.from('orders')
			.update({
				hero_mockup_status: 'processing' as PreviewStatus,
				hero_mockup_task_id: taskId,
				// Clear prior result (if any) so a retry after a fail can't
				// leak stale URLs through `pollHeroMockup`.
				hero_mockup_image_path: null,
				hero_mockup_ai_cost_time_ms: null,
			})
			.eq('id', order.id)

		if (updateError) {
			throw new Error(`Order update failed: ${updateError.message}`)
		}

		return {
			success: true,
			data: { status: 'processing', imageUrl: null },
		}
	} catch (err) {
		const failMsg = getErrorMessage(err)
		await captureServerError(err, {
			action: 'generateHeroMockup',
			orderId: order.id,
			stage,
		})

		await adminDb
			.from('orders')
			.update({
				hero_mockup_status: 'fail' as PreviewStatus,
			})
			.eq('id', order.id)

		console.error('[generateHeroMockup]', { stage, failMsg })
		return { success: false, error: 'errors.generationFailed' }
	}
}

/**
 * Polls Kie for the hero-mockup task bound to `order` and persists the
 * result. No authorization performed — callers must gate.
 */
export async function pollHeroMockup(
	order: HeroMockupOrderRow,
	storagePrefix: string,
): Promise<ActionResult<HeroMockupStatus>> {
	const adminDb = createAdminClient()

	if (order.hero_mockup_status === 'success') {
		const imageUrl = order.hero_mockup_image_path
			? adminDb.storage.from('images').getPublicUrl(order.hero_mockup_image_path).data.publicUrl
			: null
		return { success: true, data: { status: 'success', imageUrl } }
	}

	if (order.hero_mockup_status === 'fail') {
		return { success: true, data: { status: 'fail', imageUrl: null } }
	}

	if (order.hero_mockup_status !== 'processing' || !order.hero_mockup_task_id) {
		return {
			success: true,
			data: { status: order.hero_mockup_status, imageUrl: null },
		}
	}

	let stage: HeroMockupFailStage = 'poll'
	try {
		const taskStatus = await getTaskStatus(order.hero_mockup_task_id)

		if (taskStatus.state === 'success' && taskStatus.resultUrls?.length) {
			const resultUrl = taskStatus.resultUrls[0]
			const imageRes = await fetch(resultUrl)
			if (!imageRes.ok) {
				throw new Error(`Fetch hero mockup failed: ${imageRes.status}`)
			}

			stage = 'download_upload'
			const imageBlob = await imageRes.blob()
			const previewPath =
				`${storagePrefix}/hero-mockup-previews/${order.id}.png`

			const { error: uploadError } = await adminDb.storage
				.from('images')
				.upload(previewPath, imageBlob, {
					contentType: 'image/png',
					upsert: true,
				})

			if (uploadError) {
				throw new Error(`Upload failed: ${uploadError.message}`)
			}

			await adminDb
				.from('orders')
				.update({
					hero_mockup_status: 'success' as PreviewStatus,
					hero_mockup_image_path: previewPath,
					hero_mockup_ai_cost_time_ms: taskStatus.costTime ?? null,
				})
				.eq('id', order.id)

			const { data: { publicUrl } } = adminDb.storage
				.from('images')
				.getPublicUrl(previewPath)

			return {
				success: true,
				data: { status: 'success', imageUrl: publicUrl },
			}
		}

		if (taskStatus.state === 'fail') {
			await captureServerError(new Error('Kie hero mockup task failed'), {
				action: 'checkHeroMockupStatus',
				orderId: order.id,
				taskId: order.hero_mockup_task_id,
				failCode: taskStatus.failCode,
				stage: 'task_fail',
			})

			await adminDb
				.from('orders')
				.update({
					hero_mockup_status: 'fail' as PreviewStatus,
					hero_mockup_ai_cost_time_ms: taskStatus.costTime ?? null,
				})
				.eq('id', order.id)

			return { success: true, data: { status: 'fail', imageUrl: null } }
		}

		// Still queuing/generating.
		return { success: true, data: { status: 'processing', imageUrl: null } }
	} catch (err) {
		await captureServerError(err, {
			action: 'checkHeroMockupStatus',
			orderId: order.id,
			taskId: order.hero_mockup_task_id,
			stage,
		})
		console.error('[checkHeroMockupStatus]', err)
		// Keep status as processing so the client keeps polling — transient
		// network errors shouldn't surface as a hard fail.
		return { success: true, data: { status: 'processing', imageUrl: null } }
	}
}

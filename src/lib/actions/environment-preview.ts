'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import {
	createEnvironmentPreviewTask,
	getTaskStatus,
	uploadFileToKie,
} from '@/lib/ai'
import {
	generateEnvironmentPreviewsSchema,
	checkEnvironmentPreviewsSchema,
	guestSessionIdSchema,
} from '@/validators/order'
import type { ActionResult } from '@/types/actions'
import type { PreviewStatus } from '@/types/supabase'
import { getSceneName } from '@/lib/db-helpers'

export interface EnvironmentPreviewItem {
	id: string
	sceneId: string
	sceneName: string
	status: PreviewStatus
	imageUrl: string | null
}

export interface GenerateEnvironmentPreviewsData {
	previews: EnvironmentPreviewItem[]
}

export interface CheckEnvironmentPreviewsData {
	previews: EnvironmentPreviewItem[]
	allDone: boolean
}

async function verifyOrderOwnership(
	orderId: string,
	guestSessionId?: string,
): Promise<
	| { success: true; order: { id: string; user_id: string | null; guest_session_id: string | null; status: string; generated_image_path: string | null }; storagePrefix: string }
	| { success: false; error: string }
> {
	const supabase = await createClient()
	const { data: { user } } = await supabase.auth.getUser()
	const isGuest = !user

	let validGuestId: string | null = null
	if (isGuest) {
		const parsedGuestId = guestSessionIdSchema.safeParse(guestSessionId)
		if (!parsedGuestId.success) {
			return { success: false, error: 'errors.invalidInput' }
		}
		validGuestId = parsedGuestId.data
	}

	const adminDb = createAdminClient()

	const { data: order, error: orderError } = await adminDb
		.from('orders')
		.select('id, user_id, guest_session_id, status, generated_image_path')
		.eq('id', orderId)
		.single()

	if (orderError || !order) {
		return { success: false, error: 'errors.orderNotFound' }
	}

	if (user && order.user_id !== user.id) {
		return { success: false, error: 'errors.forbidden' }
	}
	if (isGuest && order.guest_session_id !== validGuestId) {
		return { success: false, error: 'errors.forbidden' }
	}

	const storagePrefix = user ? user.id : 'guest'
	return { success: true, order, storagePrefix }
}

type PreviewFailStage =
	| 'artwork_upload'
	| 'scene_fetch'
	| 'scene_upload'
	| 'task_create'
	| 'insert_record'

function getErrorMessage(err: unknown): string {
	if (err instanceof Error) return err.message
	if (typeof err === 'string') return err
	try {
		return JSON.stringify(err)
	} catch {
		return 'Unknown error'
	}
}

export async function generateEnvironmentPreviews(
	orderId: string,
	guestSessionId?: string,
): Promise<ActionResult<GenerateEnvironmentPreviewsData>> {
	const parsed = generateEnvironmentPreviewsSchema.safeParse({ orderId })
	if (!parsed.success) {
		return { success: false, error: 'errors.invalidInput' }
	}

	const ownership = await verifyOrderOwnership(parsed.data.orderId, guestSessionId)
	if (!ownership.success) {
		return { success: false, error: ownership.error }
	}

	const { order } = ownership

	if (order.status !== 'generated' && order.status !== 'paid' && order.status !== 'shipped') {
		return { success: false, error: 'errors.artworkNotReady' }
	}

	if (!order.generated_image_path) {
		return { success: false, error: 'errors.artworkNotReady' }
	}

	const adminDb = createAdminClient()

	// Check for existing previews. If any are still in-flight or succeeded,
	// block duplicate generation. If all are failed, clean them up so the
	// user can retry and the new failure reasons are captured on the order.
	const { data: existingPreviews } = await adminDb
		.from('environment_previews')
		.select('id, status')
		.eq('order_id', order.id)

	if (existingPreviews && existingPreviews.length > 0) {
		const hasNonFail = existingPreviews.some((p) => p.status !== 'fail')
		if (hasNonFail) {
			return { success: false, error: 'errors.previewsAlreadyGenerated' }
		}
		await adminDb
			.from('environment_previews')
			.delete()
			.eq('order_id', order.id)
			.eq('status', 'fail')
	}

	const { data: scenes, error: scenesError } = await adminDb
		.from('environment_scenes')
		.select('id, name, image_path')
		.eq('is_active', true)
		.order('sort_order', { ascending: true })

	if (scenesError || !scenes || scenes.length === 0) {
		return { success: false, error: 'errors.noScenesAvailable' }
	}

	async function insertFailRow(
		sceneId: string,
		sceneName: string,
		stage: PreviewFailStage,
		failMsg: string,
		failCode: string | null = null,
	): Promise<EnvironmentPreviewItem> {
		const metadata = {
			model: 'flux-2/flex-image-to-image',
			stage,
			fail_msg: failMsg,
			fail_code: failCode,
			failed_at: new Date().toISOString(),
		}

		const { data: failRow, error: insertError } = await adminDb
			.from('environment_previews')
			.insert({
				order_id: order.id,
				scene_id: sceneId,
				status: 'fail' as PreviewStatus,
				metadata,
			})
			.select('id')
			.single()

		if (insertError || !failRow) {
			console.error(
				'[generateEnvironmentPreviews] failed to persist fail row',
				{ sceneId, stage, failMsg, insertError },
			)
		}

		return {
			id: failRow?.id ?? `transient-${sceneId}`,
			sceneId,
			sceneName,
			status: 'fail',
			imageUrl: null,
		}
	}

	// Download the generated artwork from Storage and upload to Kie (once).
	// On failure, persist a fail row per scene so the admin order page
	// surfaces the actual cause instead of a silent retry screen.
	const { data: artworkData } = adminDb.storage
		.from('images')
		.getPublicUrl(order.generated_image_path)

	let artworkKieUrl: string
	try {
		const artworkRes = await fetch(artworkData.publicUrl)
		if (!artworkRes.ok) {
			throw new Error(`Fetch artwork failed: ${artworkRes.status}`)
		}
		const artworkBuffer = await artworkRes.arrayBuffer()
		artworkKieUrl = await uploadFileToKie(artworkBuffer, 'image/png', 'artwork.png')
	} catch (err) {
		const failMsg = getErrorMessage(err)
		console.error('[generateEnvironmentPreviews] artwork upload to Kie', err)

		const failPreviews = await Promise.all(
			scenes.map((scene) =>
				insertFailRow(scene.id, scene.name, 'artwork_upload', failMsg),
			),
		)

		return {
			success: true,
			data: { previews: failPreviews },
		}
	}

	// Create tasks for each scene independently. A failure in one scene
	// (e.g. missing storage file, Kie rejecting input) is persisted as a
	// fail row for that scene without aborting the others.
	const previews = await Promise.all(
		scenes.map(async (scene): Promise<EnvironmentPreviewItem> => {
			let stage: PreviewFailStage = 'scene_fetch'
			try {
				const { data: sceneData } = adminDb.storage
					.from('images')
					.getPublicUrl(scene.image_path)

				const sceneRes = await fetch(sceneData.publicUrl)
				if (!sceneRes.ok) {
					throw new Error(
						`Fetch scene failed (${sceneRes.status}): ${scene.image_path}`,
					)
				}

				stage = 'scene_upload'
				const sceneBuffer = await sceneRes.arrayBuffer()
				const sceneKieUrl = await uploadFileToKie(
					sceneBuffer,
					'image/jpeg',
					`scene-${scene.id}.jpeg`,
				)

				stage = 'task_create'
				const { taskId } = await createEnvironmentPreviewTask(
					artworkKieUrl,
					sceneKieUrl,
				)

				stage = 'insert_record'
				const { data: preview, error: insertError } = await adminDb
					.from('environment_previews')
					.insert({
						order_id: order.id,
						scene_id: scene.id,
						ai_task_id: taskId,
						status: 'processing' as PreviewStatus,
						metadata: {
							kie_task_id: taskId,
							model: 'flux-2/flex-image-to-image',
						},
					})
					.select('id')
					.single()

				if (insertError || !preview) {
					throw new Error(
						`Insert preview failed: ${insertError?.message ?? 'unknown'}`,
					)
				}

				return {
					id: preview.id,
					sceneId: scene.id,
					sceneName: scene.name,
					status: 'processing',
					imageUrl: null,
				}
			} catch (err) {
				console.error(
					'[generateEnvironmentPreviews] scene task failed',
					{ sceneId: scene.id, stage, err },
				)
				return insertFailRow(scene.id, scene.name, stage, getErrorMessage(err))
			}
		}),
	)

	return { success: true, data: { previews } }
}

export async function checkEnvironmentPreviewsStatus(
	orderId: string,
	guestSessionId?: string,
): Promise<ActionResult<CheckEnvironmentPreviewsData>> {
	const parsed = checkEnvironmentPreviewsSchema.safeParse({ orderId })
	if (!parsed.success) {
		return { success: false, error: 'errors.invalidInput' }
	}

	const ownership = await verifyOrderOwnership(parsed.data.orderId, guestSessionId)
	if (!ownership.success) {
		return { success: false, error: ownership.error }
	}

	const { order, storagePrefix } = ownership
	const adminDb = createAdminClient()

	const { data: previews, error: previewsError } = await adminDb
		.from('environment_previews')
		.select(`
			id,
			scene_id,
			image_path,
			ai_task_id,
			status,
			environment_scenes!inner ( name )
		`)
		.eq('order_id', order.id)

	if (previewsError || !previews) {
		return { success: false, error: 'errors.previewsNotFound' }
	}

	const results: EnvironmentPreviewItem[] = []

	for (const preview of previews) {
		const sceneName = getSceneName(preview.environment_scenes)

		if (preview.status === 'success' && preview.image_path) {
			const { data: { publicUrl } } = adminDb.storage
				.from('images')
				.getPublicUrl(preview.image_path)

			results.push({
				id: preview.id,
				sceneId: preview.scene_id,
				sceneName,
				status: 'success',
				imageUrl: publicUrl,
			})
			continue
		}

		if (preview.status === 'fail') {
			results.push({
				id: preview.id,
				sceneId: preview.scene_id,
				sceneName,
				status: 'fail',
				imageUrl: null,
			})
			continue
		}

		if (preview.status !== 'processing' || !preview.ai_task_id) {
			results.push({
				id: preview.id,
				sceneId: preview.scene_id,
				sceneName,
				status: preview.status,
				imageUrl: null,
			})
			continue
		}

		// Poll Kie for status
		try {
			const taskStatus = await getTaskStatus(preview.ai_task_id)

			if (taskStatus.state === 'success' && taskStatus.resultUrls?.length) {
				const resultUrl = taskStatus.resultUrls[0]
				const imageRes = await fetch(resultUrl)
				if (!imageRes.ok) throw new Error(`Fetch preview failed: ${imageRes.status}`)
				const imageBlob = await imageRes.blob()

				const previewPath = `${storagePrefix}/environment-previews/${order.id}/${preview.scene_id}.png`

				const { error: uploadError } = await adminDb.storage
					.from('images')
					.upload(previewPath, imageBlob, {
						contentType: 'image/png',
						upsert: true,
					})

				if (uploadError) {
					console.error('[checkEnvironmentPreviews] upload', uploadError)
					throw new Error('Upload failed')
				}

				await adminDb
					.from('environment_previews')
					.update({
						status: 'success' as PreviewStatus,
						image_path: previewPath,
						ai_cost_time_ms: taskStatus.costTime,
					})
					.eq('id', preview.id)

				const { data: { publicUrl } } = adminDb.storage
					.from('images')
					.getPublicUrl(previewPath)

				results.push({
					id: preview.id,
					sceneId: preview.scene_id,
					sceneName,
					status: 'success',
					imageUrl: publicUrl,
				})
			} else if (taskStatus.state === 'fail') {
				console.error('[checkEnvironmentPreviews] Kie task failed', {
					orderId: order.id,
					sceneName,
					taskId: preview.ai_task_id,
					failCode: taskStatus.failCode,
					failMsg: taskStatus.failMsg,
				})

				await adminDb
					.from('environment_previews')
					.update({
						status: 'fail' as PreviewStatus,
						ai_cost_time_ms: taskStatus.costTime,
						metadata: {
							kie_task_id: preview.ai_task_id,
							model: 'flux-2/flex-image-to-image',
							fail_code: taskStatus.failCode,
							fail_msg: taskStatus.failMsg,
							failed_at: new Date().toISOString(),
						},
					})
					.eq('id', preview.id)

				results.push({
					id: preview.id,
					sceneId: preview.scene_id,
					sceneName,
					status: 'fail',
					imageUrl: null,
				})
			} else {
				results.push({
					id: preview.id,
					sceneId: preview.scene_id,
					sceneName,
					status: 'processing',
					imageUrl: null,
				})
			}
		} catch (err) {
			console.error('[checkEnvironmentPreviews] poll error', err)
			results.push({
				id: preview.id,
				sceneId: preview.scene_id,
				sceneName,
				status: 'processing',
				imageUrl: null,
			})
		}
	}

	const allDone = results.every((r) => r.status === 'success' || r.status === 'fail')

	return { success: true, data: { previews: results, allDone } }
}

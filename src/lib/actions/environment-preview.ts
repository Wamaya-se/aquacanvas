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

	// Prevent duplicate generation: check if previews already exist
	const { data: existingPreviews } = await adminDb
		.from('environment_previews')
		.select('id')
		.eq('order_id', order.id)
		.limit(1)

	if (existingPreviews && existingPreviews.length > 0) {
		return { success: false, error: 'errors.previewsAlreadyGenerated' }
	}

	const { data: scenes, error: scenesError } = await adminDb
		.from('environment_scenes')
		.select('id, name, image_path')
		.eq('is_active', true)
		.order('sort_order', { ascending: true })

	if (scenesError || !scenes || scenes.length === 0) {
		return { success: false, error: 'errors.noScenesAvailable' }
	}

	// Download the generated artwork from Storage and upload to Kie (once)
	const { data: artworkData } = adminDb.storage
		.from('images')
		.getPublicUrl(order.generated_image_path)

	let artworkKieUrl: string
	try {
		const artworkRes = await fetch(artworkData.publicUrl)
		if (!artworkRes.ok) throw new Error(`Fetch artwork failed: ${artworkRes.status}`)
		const artworkBuffer = await artworkRes.arrayBuffer()
		artworkKieUrl = await uploadFileToKie(artworkBuffer, 'image/png', 'artwork.png')
	} catch (err) {
		console.error('[generateEnvironmentPreviews] artwork upload to Kie', err)
		return { success: false, error: 'errors.generationFailed' }
	}

	const previews: EnvironmentPreviewItem[] = []

	// Create tasks for each scene in parallel
	const taskPromises = scenes.map(async (scene) => {
		// Download scene image from Storage and upload to Kie
		const { data: sceneData } = adminDb.storage
			.from('images')
			.getPublicUrl(scene.image_path)

		const sceneRes = await fetch(sceneData.publicUrl)
		if (!sceneRes.ok) throw new Error(`Fetch scene failed: ${sceneRes.status}`)
		const sceneBuffer = await sceneRes.arrayBuffer()
		const sceneKieUrl = await uploadFileToKie(
			sceneBuffer,
			'image/jpeg',
			`scene-${scene.id}.jpeg`,
		)

		const { taskId } = await createEnvironmentPreviewTask(artworkKieUrl, sceneKieUrl)

		const { data: preview, error: insertError } = await adminDb
			.from('environment_previews')
			.insert({
				order_id: order.id,
				scene_id: scene.id,
				ai_task_id: taskId,
				status: 'processing' as PreviewStatus,
				metadata: { kie_task_id: taskId, model: 'flux-2/flex-image-to-image' },
			})
			.select('id')
			.single()

		if (insertError || !preview) {
			console.error('[generateEnvironmentPreviews] insert preview', insertError)
			throw new Error('Failed to insert preview record')
		}

		return {
			id: preview.id,
			sceneId: scene.id,
			sceneName: scene.name,
			status: 'processing' as PreviewStatus,
			imageUrl: null,
		}
	})

	try {
		const results = await Promise.all(taskPromises)
		previews.push(...results)
	} catch (err) {
		console.error('[generateEnvironmentPreviews] task creation failed', err)
		// Clean up any partial inserts
		await adminDb
			.from('environment_previews')
			.delete()
			.eq('order_id', order.id)

		return { success: false, error: 'errors.generationFailed' }
	}

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
		const sceneName = (preview.environment_scenes as unknown as { name: string })?.name ?? 'Room'

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
				await adminDb
					.from('environment_previews')
					.update({ status: 'fail' as PreviewStatus })
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

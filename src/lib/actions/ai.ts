'use server'

import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createImageTask, getTaskStatus, uploadFileToKie } from '@/lib/ai'
import { generateArtworkSchema, checkStatusSchema, validateFile } from '@/validators/order'
import { checkRateLimit } from '@/lib/rate-limit'
import type { ActionResult } from '@/types/actions'
import type { KieTaskState } from '@/lib/ai'

export interface GenerateArtworkData {
	orderId: string
	taskId: string
}

export interface GenerationStatusData {
	state: KieTaskState
	generatedImageUrl: string | null
	failMsg: string | null
}

async function getClientIp(): Promise<string> {
	const hdrs = await headers()
	return (
		hdrs.get('x-forwarded-for')?.split(',')[0]?.trim() ??
		hdrs.get('x-real-ip') ??
		'unknown'
	)
}

export async function generateArtwork(
	formData: FormData,
): Promise<ActionResult<GenerateArtworkData>> {
	const supabase = await createClient()
	const {
		data: { user },
	} = await supabase.auth.getUser()

	const isGuest = !user
	const guestSessionId = isGuest
		? (formData.get('guestSessionId') as string | null)
		: null

	if (isGuest && !guestSessionId) {
		return { success: false, error: 'errors.invalidInput' }
	}

	const rateLimitId = user?.id ?? (await getClientIp())
	const { allowed } = checkRateLimit(rateLimitId, isGuest)
	if (!allowed) {
		return { success: false, error: 'errors.rateLimited' }
	}

	const fileResult = validateFile(formData.get('photo'))
	if (!fileResult.valid) {
		return { success: false, error: fileResult.error }
	}
	const file = fileResult.file

	const parsed = generateArtworkSchema.safeParse({
		styleId: formData.get('styleId'),
	})
	if (!parsed.success) {
		return { success: false, error: 'errors.invalidInput' }
	}

	// Use admin client for DB operations (bypasses RLS for guests)
	const adminDb = createAdminClient()

	const { data: style, error: styleError } = await adminDb
		.from('styles')
		.select('id, prompt_template, is_active')
		.eq('id', parsed.data.styleId)
		.single()

	if (styleError || !style) {
		return { success: false, error: 'errors.styleNotFound' }
	}

	if (!style.is_active) {
		return { success: false, error: 'errors.styleInactive' }
	}

	const { data: order, error: orderError } = await adminDb
		.from('orders')
		.insert({
			...(user ? { user_id: user.id } : { guest_session_id: guestSessionId }),
			style_id: style.id,
			status: 'created',
		})
		.select('id')
		.single()

	if (orderError || !order) {
		console.error('[generateArtwork] order insert', orderError)
		return { success: false, error: 'errors.orderCreationFailed' }
	}

	const storagePrefix = user ? user.id : 'guest'
	const ext = file.type === 'image/jpeg' ? 'jpg' : file.type.split('/')[1]
	const storagePath = `${storagePrefix}/originals/${order.id}.${ext}`

	const { error: uploadError } = await adminDb.storage
		.from('images')
		.upload(storagePath, file, {
			contentType: file.type,
			upsert: false,
		})

	if (uploadError) {
		console.error('[generateArtwork] storage upload', uploadError)
		return { success: false, error: 'errors.uploadFailed' }
	}

	await adminDb
		.from('orders')
		.update({ original_image_path: storagePath })
		.eq('id', order.id)

	let taskId: string
	try {
		const fileBuffer = await file.arrayBuffer()
		const kieImageUrl = await uploadFileToKie(fileBuffer, file.type, file.name)
		const result = await createImageTask(kieImageUrl, style.prompt_template)
		taskId = result.taskId
	} catch (err) {
		console.error('[generateArtwork] Kie.ai upload/createTask', err)
		await adminDb
			.from('orders')
			.update({ status: 'created' })
			.eq('id', order.id)
		return { success: false, error: 'errors.generationFailed' }
	}

	await adminDb.from('generated_images').insert({
		order_id: order.id,
		image_path: '',
		metadata: { kie_task_id: taskId },
	})

	await adminDb
		.from('orders')
		.update({
			status: 'processing',
			ai_task_id: taskId,
			ai_model: 'google/nano-banana-edit',
		})
		.eq('id', order.id)

	return { success: true, data: { orderId: order.id, taskId } }
}

export async function checkGenerationStatus(
	taskId: string,
	orderId: string,
	guestSessionId?: string,
): Promise<ActionResult<GenerationStatusData>> {
	const supabase = await createClient()
	const {
		data: { user },
	} = await supabase.auth.getUser()

	const isGuest = !user

	if (isGuest && !guestSessionId) {
		return { success: false, error: 'errors.invalidInput' }
	}

	const parsed = checkStatusSchema.safeParse({ taskId, orderId })
	if (!parsed.success) {
		return { success: false, error: 'errors.invalidInput' }
	}

	const adminDb = createAdminClient()

	const { data: order, error: orderError } = await adminDb
		.from('orders')
		.select('id, user_id, guest_session_id, status')
		.eq('id', parsed.data.orderId)
		.single()

	if (orderError || !order) {
		return { success: false, error: 'errors.orderNotFound' }
	}

	// Verify ownership: auth user must match user_id, guest must match session
	if (user && order.user_id !== user.id) {
		return { success: false, error: 'errors.forbidden' }
	}
	if (isGuest && order.guest_session_id !== guestSessionId) {
		return { success: false, error: 'errors.forbidden' }
	}

	if (order.status === 'generated' || order.status === 'paid' || order.status === 'shipped') {
		const { data: genImage } = await adminDb
			.from('generated_images')
			.select('image_path')
			.eq('order_id', order.id)
			.limit(1)
			.single()

		const url = genImage?.image_path
			? adminDb.storage.from('images').getPublicUrl(genImage.image_path).data.publicUrl
			: null

		return {
			success: true,
			data: {
				state: 'success',
				generatedImageUrl: url,
				failMsg: null,
			},
		}
	}

	let status: Awaited<ReturnType<typeof getTaskStatus>>
	try {
		status = await getTaskStatus(parsed.data.taskId)
	} catch (err) {
		console.error('[checkGenerationStatus] Kie.ai getTask', err)
		return { success: false, error: 'errors.generationFailed' }
	}

	if (status.state === 'success' && status.resultUrls?.length) {
		const resultUrl = status.resultUrls[0]

		try {
			const imageRes = await fetch(resultUrl)
			if (!imageRes.ok) throw new Error(`Fetch failed: ${imageRes.status}`)
			const imageBlob = await imageRes.blob()

			const storagePrefix = user ? user.id : 'guest'
			const generatedPath = `${storagePrefix}/generated/${order.id}.png`

			const { error: uploadError } = await adminDb.storage
				.from('images')
				.upload(generatedPath, imageBlob, {
					contentType: 'image/png',
					upsert: true,
				})

			if (uploadError) {
				console.error('[checkGenerationStatus] upload generated', uploadError)
				return { success: false, error: 'errors.uploadFailed' }
			}

			await adminDb
				.from('orders')
				.update({
					status: 'generated',
					generated_image_path: generatedPath,
					ai_cost_time_ms: status.costTime,
				})
				.eq('id', order.id)

			await adminDb
				.from('generated_images')
				.update({ image_path: generatedPath })
				.eq('order_id', order.id)

			const {
				data: { publicUrl },
			} = adminDb.storage.from('images').getPublicUrl(generatedPath)

			return {
				success: true,
				data: {
					state: 'success',
					generatedImageUrl: publicUrl,
					failMsg: null,
				},
			}
		} catch (err) {
			console.error('[checkGenerationStatus] download+upload', err)
			return { success: false, error: 'errors.generationFailed' }
		}
	}

	if (status.state === 'fail') {
		await adminDb
			.from('orders')
			.update({ status: 'created' })
			.eq('id', order.id)

		return {
			success: true,
			data: {
				state: 'fail',
				generatedImageUrl: null,
				failMsg: status.failMsg,
			},
		}
	}

	return {
		success: true,
		data: {
			state: status.state,
			generatedImageUrl: null,
			failMsg: null,
		},
	}
}

'use server'

import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createImageTask, getTaskStatus, uploadFileToKie } from '@/lib/ai'
import { generateArtworkSchema, checkStatusSchema, guestSessionIdSchema, validateFile } from '@/validators/order'
import type { OrientationValue } from '@/validators/order'
import { checkRateLimit } from '@/lib/rate-limit'
import { getRateLimitBypassEnabled } from '@/lib/actions/admin-settings'
import { captureServerError } from '@/lib/observability'
import type { ActionResult } from '@/types/actions'
import type { KieTaskState, AspectRatio } from '@/lib/ai'

const ORIENTATION_TO_ASPECT_RATIO: Record<OrientationValue, AspectRatio> = {
	portrait: '3:4',
	landscape: '4:3',
	square: '1:1',
}

export interface GenerateArtworkData {
	orderId: string
	taskId: string
}

export interface GenerationStatusData {
	state: KieTaskState
	generatedImageUrl: string | null
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
	let guestSessionId: string | null = null

	if (isGuest) {
		const parsedGuestId = guestSessionIdSchema.safeParse(formData.get('guestSessionId'))
		if (!parsedGuestId.success) {
			return { success: false, error: 'errors.invalidInput' }
		}
		guestSessionId = parsedGuestId.data
	}

	const rateLimitId = user?.id ?? (await getClientIp())
	const rateLimitBypassed = await getRateLimitBypassEnabled()
	const rateLimit = await checkRateLimit(
		isGuest ? 'aiGuest' : 'aiAuth',
		rateLimitId,
		{ disabled: rateLimitBypassed },
	)
	if (!rateLimit.allowed) {
		const minutes = Math.ceil((rateLimit.retryAfterSeconds ?? 0) / 60)
		return {
			success: false,
			error: 'errors.rateLimited',
			meta: { minutes, maxRequests: rateLimit.maxRequests },
		}
	}

	const fileResult = validateFile(formData.get('photo'))
	if (!fileResult.valid) {
		return { success: false, error: fileResult.error }
	}
	const file = fileResult.file

	const parsed = generateArtworkSchema.safeParse({
		styleId: formData.get('styleId'),
		orientation: formData.get('orientation'),
	})
	if (!parsed.success) {
		return { success: false, error: 'errors.invalidInput' }
	}

	const { orientation } = parsed.data
	const imageSize = ORIENTATION_TO_ASPECT_RATIO[orientation]

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
			orientation,
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
		const result = await createImageTask(kieImageUrl, style.prompt_template, {
			imageSize: imageSize,
		})
		taskId = result.taskId
	} catch (err) {
		console.error('[generateArtwork] Kie.ai upload/createTask', err)
		await captureServerError(err, {
			action: 'generateArtwork',
			stage: 'kie_upload_create_task',
			orderId: order.id,
		})
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

	if (isGuest) {
		const parsedGuestId = guestSessionIdSchema.safeParse(guestSessionId)
		if (!parsedGuestId.success) {
			return { success: false, error: 'errors.invalidInput' }
		}
		guestSessionId = parsedGuestId.data
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
				},
			}
		} catch (err) {
			console.error('[checkGenerationStatus] download+upload', err)
			await captureServerError(err, {
				action: 'checkGenerationStatus',
				stage: 'download_and_upload',
				orderId: order.id,
				taskId: parsed.data.taskId,
			})
			return { success: false, error: 'errors.generationFailed' }
		}
	}

	if (status.state === 'fail') {
		// Log provider failure message server-side only — never return to client
		// to avoid leaking implementation details (provider name, internal codes).
		console.error(
			`[checkGenerationStatus] Kie.ai task ${parsed.data.taskId} failed:`,
			status.failMsg,
		)

		await adminDb
			.from('orders')
			.update({ status: 'created' })
			.eq('id', order.id)

		return {
			success: true,
			data: {
				state: 'fail',
				generatedImageUrl: null,
			},
		}
	}

	return {
		success: true,
		data: {
			state: status.state,
			generatedImageUrl: null,
		},
	}
}

'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sceneSchema } from '@/validators/scene'
import type { ActionResult } from '@/types/actions'

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_FILE_SIZE = 5 * 1024 * 1024

async function requireAdmin() {
	const supabase = await createClient()
	const { data: { user }, error } = await supabase.auth.getUser()
	if (error || !user) redirect('/login')
	if (user.app_metadata?.role !== 'admin') redirect('/')
	return { user, supabase }
}

function parseFormData(formData: FormData) {
	const raw = Object.fromEntries(formData)
	return sceneSchema.safeParse({
		name: raw.name,
		description: raw.description,
		isActive: raw.isActive === 'on' || raw.isActive === 'true',
		sortOrder: raw.sortOrder || 0,
	})
}

async function uploadSceneImage(
	file: File,
	sceneId: string,
): Promise<string> {
	const adminDb = createAdminClient()
	const ext = file.type === 'image/jpeg' ? 'jpeg' : file.type.split('/')[1]
	const storagePath = `environment-scenes/${sceneId}.${ext}`

	const { error } = await adminDb.storage
		.from('images')
		.upload(storagePath, file, {
			contentType: file.type,
			upsert: true,
		})

	if (error) {
		console.error('[uploadSceneImage]', error)
		throw new Error('Upload failed')
	}

	return storagePath
}

export async function createScene(
	formData: FormData,
): Promise<ActionResult<{ id: string }>> {
	await requireAdmin()

	const parsed = parseFormData(formData)
	if (!parsed.success) {
		return { success: false, error: 'errors.invalidInput' }
	}

	const file = formData.get('image') as File | null
	if (!file || file.size === 0) {
		return { success: false, error: 'errors.noFileUploaded' }
	}

	if (!ACCEPTED_TYPES.includes(file.type)) {
		return { success: false, error: 'errors.invalidFileType' }
	}

	if (file.size > MAX_FILE_SIZE) {
		return { success: false, error: 'errors.fileTooLarge' }
	}

	const adminDb = createAdminClient()
	const tempId = crypto.randomUUID()

	let imagePath: string
	try {
		imagePath = await uploadSceneImage(file, tempId)
	} catch {
		return { success: false, error: 'errors.uploadFailed' }
	}

	const { data, error } = await adminDb
		.from('environment_scenes')
		.insert({
			id: tempId,
			name: parsed.data.name,
			description: parsed.data.description || null,
			image_path: imagePath,
			is_active: parsed.data.isActive,
			sort_order: parsed.data.sortOrder,
		})
		.select('id')
		.single()

	if (error) {
		console.error('[createScene]', error)
		return { success: false, error: 'errors.generic' }
	}

	revalidatePath('/admin/scenes')
	return { success: true, data: { id: data.id } }
}

export async function updateScene(
	sceneId: string,
	formData: FormData,
): Promise<ActionResult> {
	await requireAdmin()

	const idParsed = z.string().uuid().safeParse(sceneId)
	if (!idParsed.success) {
		return { success: false, error: 'errors.invalidInput' }
	}

	const parsed = parseFormData(formData)
	if (!parsed.success) {
		return { success: false, error: 'errors.invalidInput' }
	}

	const adminDb = createAdminClient()

	let imagePath: string | undefined
	const file = formData.get('image') as File | null
	const imageRemoved = formData.get('image__removed') === 'true'

	if (file && file.size > 0) {
		if (!ACCEPTED_TYPES.includes(file.type)) {
			return { success: false, error: 'errors.invalidFileType' }
		}
		if (file.size > MAX_FILE_SIZE) {
			return { success: false, error: 'errors.fileTooLarge' }
		}

		try {
			imagePath = await uploadSceneImage(file, idParsed.data)
		} catch {
			return { success: false, error: 'errors.uploadFailed' }
		}
	} else if (imageRemoved) {
		return { success: false, error: 'errors.noFileUploaded' }
	}

	const { error } = await adminDb
		.from('environment_scenes')
		.update({
			name: parsed.data.name,
			description: parsed.data.description || null,
			is_active: parsed.data.isActive,
			sort_order: parsed.data.sortOrder,
			...(imagePath ? { image_path: imagePath } : {}),
		})
		.eq('id', idParsed.data)

	if (error) {
		console.error('[updateScene]', error)
		return { success: false, error: 'errors.generic' }
	}

	revalidatePath('/admin/scenes')
	return { success: true, data: undefined }
}

export async function deleteScene(
	sceneId: string,
): Promise<ActionResult> {
	await requireAdmin()

	const idParsed = z.string().uuid().safeParse(sceneId)
	if (!idParsed.success) {
		return { success: false, error: 'errors.invalidInput' }
	}

	const adminDb = createAdminClient()

	// Delete scene image from storage
	const { data: scene } = await adminDb
		.from('environment_scenes')
		.select('image_path')
		.eq('id', idParsed.data)
		.single()

	if (scene?.image_path) {
		await adminDb.storage.from('images').remove([scene.image_path])
	}

	const { error } = await adminDb
		.from('environment_scenes')
		.delete()
		.eq('id', idParsed.data)

	if (error) {
		console.error('[deleteScene]', error)
		return { success: false, error: 'errors.generic' }
	}

	revalidatePath('/admin/scenes')
	return { success: true, data: undefined }
}

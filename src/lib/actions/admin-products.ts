'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { productSchema, faqItemSchema } from '@/validators/product'
import type { ActionResult } from '@/types/actions'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_FILE_SIZE = 5 * 1024 * 1024

async function requireAdmin() {
	const supabase = await createClient()
	const { data: { user }, error } = await supabase.auth.getUser()
	if (error || !user) redirect('/login')
	if (user.app_metadata?.role !== 'admin') redirect('/')
	return { user, supabase }
}

function getExtension(mimeType: string): string {
	if (mimeType === 'image/jpeg') return 'jpg'
	if (mimeType === 'image/png') return 'png'
	return 'webp'
}

async function uploadImageField(
	supabase: Awaited<ReturnType<typeof createClient>>,
	formData: FormData,
	fieldName: string,
	productId: string,
	existingUrl: string | null,
): Promise<string | null | undefined> {
	const removed = formData.get(`${fieldName}__removed`)
	if (removed === 'true') {
		if (existingUrl) {
			await deleteStorageFile(supabase, existingUrl)
		}
		return null
	}

	const file = formData.get(fieldName)
	if (!(file instanceof File) || file.size === 0) {
		return undefined
	}

	if (!ALLOWED_TYPES.includes(file.type)) {
		throw new Error('errors.invalidFileType')
	}
	if (file.size > MAX_FILE_SIZE) {
		throw new Error('errors.fileTooLarge')
	}

	if (existingUrl) {
		await deleteStorageFile(supabase, existingUrl)
	}

	const ext = getExtension(file.type)
	const path = `products/${productId}/${fieldName}.${ext}`

	const { error: uploadError } = await supabase.storage
		.from('images')
		.upload(path, file, {
			contentType: file.type,
			upsert: true,
		})

	if (uploadError) {
		console.error(`[uploadImageField] ${fieldName}`, uploadError)
		throw new Error('errors.uploadFailed')
	}

	const { data: { publicUrl } } = supabase.storage
		.from('images')
		.getPublicUrl(path)

	return publicUrl
}

async function deleteStorageFile(
	supabase: Awaited<ReturnType<typeof createClient>>,
	publicUrl: string,
) {
	try {
		const url = new URL(publicUrl)
		const pathMatch = url.pathname.match(/\/storage\/v1\/object\/public\/images\/(.+)/)
		if (pathMatch?.[1]) {
			await supabase.storage.from('images').remove([pathMatch[1]])
		}
	} catch {
		// Non-critical — old file stays as orphan
	}
}

function parseFaqFromFormData(formData: FormData): { question: string; answer: string }[] {
	const faq: { question: string; answer: string }[] = []
	let i = 0
	while (formData.has(`faq_question_${i}`)) {
		const question = (formData.get(`faq_question_${i}`) as string)?.trim() ?? ''
		const answer = (formData.get(`faq_answer_${i}`) as string)?.trim() ?? ''
		if (question && answer) {
			const parsed = faqItemSchema.safeParse({ question, answer })
			if (parsed.success) {
				faq.push(parsed.data)
			}
		}
		i++
	}
	return faq
}

function parseProductForm(formData: FormData) {
	const raw = Object.fromEntries(formData)
	return productSchema.safeParse({
		name: raw.name,
		slug: raw.slug,
		headline: raw.headline,
		description: raw.description,
		body: raw.body,
		styleId: raw.styleId,
		priceCents: raw.priceCents || undefined,
		isActive: raw.isActive === 'on' || raw.isActive === 'true',
		sortOrder: raw.sortOrder || 0,
		seoTitle: raw.seoTitle,
		seoDescription: raw.seoDescription,
	})
}

export async function createProduct(
	formData: FormData,
): Promise<ActionResult<{ id: string }>> {
	const { supabase } = await requireAdmin()

	const parsed = parseProductForm(formData)
	if (!parsed.success) {
		return {
			success: false,
			error: 'errors.invalidInput',
		}
	}

	const faq = parseFaqFromFormData(formData)

	const { data, error } = await supabase
		.from('products')
		.insert({
			name: parsed.data.name,
			slug: parsed.data.slug,
			headline: parsed.data.headline,
			description: parsed.data.description || null,
			body: parsed.data.body || null,
			hero_image_url: null,
			example_before: null,
			example_after: null,
			style_id: parsed.data.styleId,
			price_cents: typeof parsed.data.priceCents === 'number' ? parsed.data.priceCents : null,
			is_active: parsed.data.isActive,
			sort_order: parsed.data.sortOrder,
			seo_title: parsed.data.seoTitle || null,
			seo_description: parsed.data.seoDescription || null,
			faq: faq.length > 0 ? faq : [],
		})
		.select('id')
		.single()

	if (error) {
		console.error('[createProduct]', error)
		if (error.code === '23505') {
			return { success: false, error: 'errors.slugTaken' }
		}
		return { success: false, error: 'errors.generic' }
	}

	try {
		const imageFields = ['heroImageUrl', 'exampleBefore', 'exampleAfter'] as const
		const dbColumns = ['hero_image_url', 'example_before', 'example_after'] as const
		const updates: Record<string, string | null> = {}

		for (let i = 0; i < imageFields.length; i++) {
			const result = await uploadImageField(supabase, formData, imageFields[i], data.id, null)
			if (result !== undefined) {
				updates[dbColumns[i]] = result
			}
		}

		if (Object.keys(updates).length > 0) {
			await supabase.from('products').update(updates).eq('id', data.id)
		}
	} catch (err) {
		console.error('[createProduct] image upload', err)
	}

	revalidatePath('/admin/products')
	revalidatePath('/p')
	return { success: true, data: { id: data.id } }
}

export async function updateProduct(
	productId: string,
	formData: FormData,
): Promise<ActionResult> {
	const { supabase } = await requireAdmin()

	const idParsed = z.string().uuid().safeParse(productId)
	if (!idParsed.success) {
		return { success: false, error: 'errors.invalidInput' }
	}

	const parsed = parseProductForm(formData)
	if (!parsed.success) {
		return { success: false, error: 'errors.invalidInput' }
	}

	const { data: existing } = await supabase
		.from('products')
		.select('hero_image_url, example_before, example_after')
		.eq('id', idParsed.data)
		.single()

	const imageFields = ['heroImageUrl', 'exampleBefore', 'exampleAfter'] as const
	const dbColumns = ['hero_image_url', 'example_before', 'example_after'] as const
	const existingUrls = [
		existing?.hero_image_url ?? null,
		existing?.example_before ?? null,
		existing?.example_after ?? null,
	]

	const imageUpdates: Record<string, string | null> = {}

	try {
		for (let i = 0; i < imageFields.length; i++) {
			const result = await uploadImageField(
				supabase, formData, imageFields[i], idParsed.data, existingUrls[i],
			)
			if (result !== undefined) {
				imageUpdates[dbColumns[i]] = result
			}
		}
	} catch (err) {
		console.error('[updateProduct] image upload', err)
		const message = err instanceof Error ? err.message : 'errors.uploadFailed'
		return { success: false, error: message }
	}

	const faq = parseFaqFromFormData(formData)

	const { error } = await supabase
		.from('products')
		.update({
			name: parsed.data.name,
			slug: parsed.data.slug,
			headline: parsed.data.headline,
			description: parsed.data.description || null,
			body: parsed.data.body || null,
			style_id: parsed.data.styleId,
			price_cents: typeof parsed.data.priceCents === 'number' ? parsed.data.priceCents : null,
			is_active: parsed.data.isActive,
			sort_order: parsed.data.sortOrder,
			seo_title: parsed.data.seoTitle || null,
			seo_description: parsed.data.seoDescription || null,
			faq: faq.length > 0 ? faq : [],
			...imageUpdates,
		})
		.eq('id', idParsed.data)

	if (error) {
		console.error('[updateProduct]', error)
		if (error.code === '23505') {
			return { success: false, error: 'errors.slugTaken' }
		}
		return { success: false, error: 'errors.generic' }
	}

	revalidatePath('/admin/products')
	revalidatePath(`/p/${parsed.data.slug}`)
	return { success: true, data: undefined }
}

export async function deleteProduct(
	productId: string,
): Promise<ActionResult> {
	const { supabase } = await requireAdmin()

	const idParsed = z.string().uuid().safeParse(productId)
	if (!idParsed.success) {
		return { success: false, error: 'errors.invalidInput' }
	}

	const { data: existing } = await supabase
		.from('products')
		.select('hero_image_url, example_before, example_after')
		.eq('id', idParsed.data)
		.single()

	if (existing) {
		const urls = [existing.hero_image_url, existing.example_before, existing.example_after]
		for (const url of urls) {
			if (url) await deleteStorageFile(supabase, url)
		}
	}

	const { error } = await supabase
		.from('products')
		.delete()
		.eq('id', idParsed.data)

	if (error) {
		console.error('[deleteProduct]', error)
		return { success: false, error: 'errors.generic' }
	}

	revalidatePath('/admin/products')
	revalidatePath('/p')
	return { success: true, data: undefined }
}

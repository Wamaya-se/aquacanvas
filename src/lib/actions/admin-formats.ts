'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { formatSchema } from '@/validators/format'
import type { ActionResult } from '@/types/actions'

async function requireAdmin() {
	const supabase = await createClient()
	const { data: { user }, error } = await supabase.auth.getUser()
	if (error || !user) redirect('/login')
	if (user.app_metadata?.role !== 'admin') redirect('/')
	return { user, supabase }
}

function parseFormData(formData: FormData) {
	const raw = Object.fromEntries(formData)
	return formatSchema.safeParse({
		name: raw.name,
		slug: raw.slug,
		description: raw.description,
		formatType: raw.formatType || 'canvas',
		widthCm: raw.widthCm,
		heightCm: raw.heightCm,
		priceCents: raw.priceCents,
		orientation: raw.orientation || 'portrait',
		isActive: raw.isActive === 'on' || raw.isActive === 'true',
		sortOrder: raw.sortOrder || 0,
	})
}

export async function createFormat(
	formData: FormData,
): Promise<ActionResult<{ id: string }>> {
	const { supabase } = await requireAdmin()

	const parsed = parseFormData(formData)
	if (!parsed.success) {
		return { success: false, error: 'errors.invalidInput' }
	}

	const { data, error } = await supabase
		.from('print_formats')
		.insert({
			name: parsed.data.name,
			slug: parsed.data.slug,
			description: parsed.data.description || null,
			format_type: parsed.data.formatType,
			width_cm: parsed.data.widthCm,
			height_cm: parsed.data.heightCm,
			price_cents: parsed.data.priceCents * 100,
			orientation: parsed.data.orientation,
			is_active: parsed.data.isActive,
			sort_order: parsed.data.sortOrder,
		})
		.select('id')
		.single()

	if (error) {
		console.error('[createFormat]', error)
		if (error.code === '23505') {
			return { success: false, error: 'errors.slugTaken' }
		}
		return { success: false, error: 'errors.generic' }
	}

	revalidatePath('/admin/formats')
	revalidatePath('/create')
	return { success: true, data: { id: data.id } }
}

export async function updateFormat(
	formatId: string,
	formData: FormData,
): Promise<ActionResult> {
	const { supabase } = await requireAdmin()

	const idParsed = z.string().uuid().safeParse(formatId)
	if (!idParsed.success) {
		return { success: false, error: 'errors.invalidInput' }
	}

	const parsed = parseFormData(formData)
	if (!parsed.success) {
		return { success: false, error: 'errors.invalidInput' }
	}

	const { error } = await supabase
		.from('print_formats')
		.update({
			name: parsed.data.name,
			slug: parsed.data.slug,
			description: parsed.data.description || null,
			format_type: parsed.data.formatType,
			width_cm: parsed.data.widthCm,
			height_cm: parsed.data.heightCm,
			price_cents: parsed.data.priceCents * 100,
			orientation: parsed.data.orientation,
			is_active: parsed.data.isActive,
			sort_order: parsed.data.sortOrder,
		})
		.eq('id', idParsed.data)

	if (error) {
		console.error('[updateFormat]', error)
		if (error.code === '23505') {
			return { success: false, error: 'errors.slugTaken' }
		}
		return { success: false, error: 'errors.generic' }
	}

	revalidatePath('/admin/formats')
	revalidatePath('/create')
	return { success: true, data: undefined }
}

export async function deleteFormat(
	formatId: string,
): Promise<ActionResult> {
	const { supabase } = await requireAdmin()

	const idParsed = z.string().uuid().safeParse(formatId)
	if (!idParsed.success) {
		return { success: false, error: 'errors.invalidInput' }
	}

	const { error } = await supabase
		.from('print_formats')
		.delete()
		.eq('id', idParsed.data)

	if (error) {
		console.error('[deleteFormat]', error)
		return { success: false, error: 'errors.generic' }
	}

	revalidatePath('/admin/formats')
	revalidatePath('/create')
	return { success: true, data: undefined }
}

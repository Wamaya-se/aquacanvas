'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { styleSchema } from '@/validators/style'
import type { ActionResult } from '@/types/actions'
import { zodIssuesToFieldErrors } from '@/lib/form-errors'

async function requireAdmin() {
	const supabase = await createClient()
	const { data: { user }, error } = await supabase.auth.getUser()
	if (error || !user) redirect('/login')
	if (user.app_metadata?.role !== 'admin') redirect('/')
	return { user, supabase }
}

export async function updateStyle(
	styleId: string,
	formData: FormData,
): Promise<ActionResult> {
	const { supabase } = await requireAdmin()

	const idParsed = z.string().uuid().safeParse(styleId)
	if (!idParsed.success) {
		return { success: false, error: 'errors.invalidInput' }
	}

	const raw = Object.fromEntries(formData)
	const parsed = styleSchema.safeParse({
		name: raw.name,
		slug: raw.slug,
		description: raw.description,
		promptTemplate: raw.promptTemplate,
		modelId: raw.modelId,
		priceCents: raw.priceCents,
		isActive: raw.isActive === 'on' || raw.isActive === 'true',
		sortOrder: raw.sortOrder || 0,
	})

	if (!parsed.success) {
		return {
			success: false,
			error: 'errors.invalidInput',
			fieldErrors: zodIssuesToFieldErrors(parsed.error),
		}
	}

	const { error } = await supabase
		.from('styles')
		.update({
			name: parsed.data.name,
			slug: parsed.data.slug,
			description: parsed.data.description || null,
			prompt_template: parsed.data.promptTemplate,
			model_id: parsed.data.modelId,
			price_cents: parsed.data.priceCents * 100,
			is_active: parsed.data.isActive,
			sort_order: parsed.data.sortOrder,
		})
		.eq('id', idParsed.data)

	if (error) {
		console.error('[updateStyle]', error)
		return { success: false, error: 'errors.generic' }
	}

	revalidatePath('/admin/styles')
	revalidatePath('/create')
	return { success: true, data: undefined }
}

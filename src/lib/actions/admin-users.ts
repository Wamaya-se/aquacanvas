'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import {
	createUserSchema,
	updateUserSchema,
	resetPasswordSchema,
} from '@/validators/user'
import type { ActionResult } from '@/types/actions'
import { zodIssuesToFieldErrors } from '@/lib/form-errors'
import { z } from 'zod'

async function requireAdmin() {
	const supabase = await createClient()
	const { data: { user }, error } = await supabase.auth.getUser()
	if (error || !user) redirect('/login')
	if (user.app_metadata?.role !== 'admin') redirect('/')
	return { user, supabase }
}

export async function createUser(
	formData: FormData,
): Promise<ActionResult<{ id: string }>> {
	await requireAdmin()

	const raw = Object.fromEntries(formData)
	const parsed = createUserSchema.safeParse({
		email: raw.email,
		password: raw.password,
		displayName: raw.displayName,
		role: raw.role,
	})

	if (!parsed.success) {
		return {
			success: false,
			error: 'errors.invalidInput',
			fieldErrors: zodIssuesToFieldErrors(parsed.error),
		}
	}

	const admin = createAdminClient()

	const { data: authData, error: authError } = await admin.auth.admin.createUser({
		email: parsed.data.email,
		password: parsed.data.password,
		email_confirm: true,
		user_metadata: {
			display_name: parsed.data.displayName || undefined,
		},
		app_metadata: {
			role: parsed.data.role,
		},
	})

	if (authError) {
		console.error('[createUser]', authError.message)
		if (authError.message.toLowerCase().includes('already been registered')) {
			return {
				success: false,
				error: 'errors.emailTaken',
				fieldErrors: { email: 'errors.emailTaken' },
			}
		}
		return { success: false, error: 'errors.userCreationFailed' }
	}

	if (parsed.data.role !== 'customer') {
		await admin
			.from('profiles')
			.update({ role: parsed.data.role })
			.eq('id', authData.user.id)
	}

	revalidatePath('/admin/users')
	return { success: true, data: { id: authData.user.id } }
}

export async function updateUser(
	formData: FormData,
): Promise<ActionResult> {
	const { supabase } = await requireAdmin()

	const raw = Object.fromEntries(formData)
	const parsed = updateUserSchema.safeParse({
		id: raw.id,
		email: raw.email,
		displayName: raw.displayName,
		role: raw.role,
	})

	if (!parsed.success) {
		return {
			success: false,
			error: 'errors.invalidInput',
			fieldErrors: zodIssuesToFieldErrors(parsed.error),
		}
	}

	const { error: profileError } = await supabase
		.from('profiles')
		.update({
			display_name: parsed.data.displayName || null,
			email: parsed.data.email,
			role: parsed.data.role,
		})
		.eq('id', parsed.data.id)

	if (profileError) {
		console.error('[updateUser] profile', profileError)
		return { success: false, error: 'errors.generic' }
	}

	const admin = createAdminClient()
	const { error: authError } = await admin.auth.admin.updateUserById(
		parsed.data.id,
		{
			email: parsed.data.email,
			app_metadata: { role: parsed.data.role },
			user_metadata: { display_name: parsed.data.displayName || undefined },
		},
	)

	if (authError) {
		console.error('[updateUser] auth', authError.message)
		if (authError.message.toLowerCase().includes('already been registered')) {
			return {
				success: false,
				error: 'errors.emailTaken',
				fieldErrors: { email: 'errors.emailTaken' },
			}
		}
		return { success: false, error: 'errors.generic' }
	}

	revalidatePath('/admin/users')
	return { success: true, data: undefined }
}

export async function resetUserPassword(
	formData: FormData,
): Promise<ActionResult> {
	await requireAdmin()

	const raw = Object.fromEntries(formData)
	const parsed = resetPasswordSchema.safeParse({
		id: raw.id,
		password: raw.password,
	})

	if (!parsed.success) {
		return {
			success: false,
			error: 'errors.invalidInput',
			fieldErrors: zodIssuesToFieldErrors(parsed.error),
		}
	}

	const admin = createAdminClient()
	const { error } = await admin.auth.admin.updateUserById(
		parsed.data.id,
		{ password: parsed.data.password },
	)

	if (error) {
		console.error('[resetUserPassword]', error.message)
		return { success: false, error: 'errors.generic' }
	}

	return { success: true, data: undefined }
}

export async function deleteUser(
	userId: string,
): Promise<ActionResult> {
	const { user } = await requireAdmin()

	const idParsed = z.string().uuid().safeParse(userId)
	if (!idParsed.success) {
		return { success: false, error: 'errors.invalidInput' }
	}

	if (idParsed.data === user.id) {
		return { success: false, error: 'errors.cannotDeleteSelf' }
	}

	const admin = createAdminClient()
	const { error } = await admin.auth.admin.deleteUser(idParsed.data)

	if (error) {
		console.error('[deleteUser]', error.message)
		return { success: false, error: 'errors.generic' }
	}

	revalidatePath('/admin/users')
	return { success: true, data: undefined }
}

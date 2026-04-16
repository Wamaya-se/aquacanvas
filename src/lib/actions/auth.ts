'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { loginSchema, registerSchema } from '@/validators/auth'
import type { ActionResult } from '@/types/actions'
import { getSiteUrl } from '@/lib/env'
import { isSafePath } from '@/lib/safe-redirect'

export async function login(
	formData: FormData,
): Promise<ActionResult> {
	const raw = Object.fromEntries(formData)
	const parsed = loginSchema.safeParse(raw)

	if (!parsed.success) {
		const firstIssue = parsed.error.issues[0]
		const field = firstIssue?.path[0] as string | undefined

		if (field === 'email') {
			return { success: false, error: 'errors.invalidEmail' }
		}
		if (field === 'password') {
			return { success: false, error: 'errors.passwordTooShort' }
		}
		return { success: false, error: 'errors.invalidInput' }
	}

	const supabase = await createClient()

	const { error } = await supabase.auth.signInWithPassword({
		email: parsed.data.email,
		password: parsed.data.password,
	})

	if (error) {
		console.error('[login]', error.message)
		return { success: false, error: 'errors.invalidCredentials' }
	}

	revalidatePath('/', 'layout')

	if (isSafePath(raw.redirect)) {
		redirect(raw.redirect)
	}

	redirect('/admin')
}

export async function register(
	formData: FormData,
): Promise<ActionResult> {
	const raw = Object.fromEntries(formData)
	const parsed = registerSchema.safeParse(raw)

	if (!parsed.success) {
		const firstIssue = parsed.error.issues[0]
		const field = firstIssue?.path[0] as string | undefined

		if (field === 'email') {
			return { success: false, error: 'errors.invalidEmail' }
		}
		if (field === 'password') {
			return { success: false, error: 'errors.passwordTooShort' }
		}
		if (field === 'confirmPassword') {
			return { success: false, error: 'errors.passwordMismatch' }
		}
		return { success: false, error: 'errors.invalidInput' }
	}

	const supabase = await createClient()

	const { error } = await supabase.auth.signUp({
		email: parsed.data.email,
		password: parsed.data.password,
		options: {
			emailRedirectTo: `${getSiteUrl()}/auth/callback`,
		},
	})

	if (error) {
		console.error('[register]', error.message)
		if (error.message.toLowerCase().includes('already registered')) {
			return { success: false, error: 'errors.emailTaken' }
		}
		return { success: false, error: 'errors.registrationFailed' }
	}

	revalidatePath('/', 'layout')
	redirect('/admin')
}

export async function logout(): Promise<void> {
	const supabase = await createClient()
	await supabase.auth.signOut()
	revalidatePath('/', 'layout')
	redirect('/')
}

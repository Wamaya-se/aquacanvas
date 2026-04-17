'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { loginSchema, registerSchema } from '@/validators/auth'
import type { ActionResult } from '@/types/actions'
import { getSiteUrl } from '@/lib/env'
import { isSafePath } from '@/lib/safe-redirect'
import { zodIssuesToFieldErrors } from '@/lib/form-errors'
import { checkRateLimit } from '@/lib/rate-limit'

async function getClientIp(): Promise<string> {
	const hdrs = await headers()
	return (
		hdrs.get('x-forwarded-for')?.split(',')[0]?.trim() ??
		hdrs.get('x-real-ip') ??
		'unknown'
	)
}

export async function login(
	formData: FormData,
): Promise<ActionResult> {
	const raw = Object.fromEntries(formData)
	const parsed = loginSchema.safeParse(raw)

	if (!parsed.success) {
		const fieldErrors = zodIssuesToFieldErrors(parsed.error)
		const firstKey = Object.values(fieldErrors)[0] ?? 'errors.invalidInput'
		return { success: false, error: firstKey, fieldErrors }
	}

	const identifier = `${parsed.data.email}:${await getClientIp()}`
	const rl = await checkRateLimit('login', identifier)
	if (!rl.allowed) {
		const minutes = Math.max(1, Math.ceil((rl.retryAfterSeconds ?? 0) / 60))
		return {
			success: false,
			error: 'errors.rateLimitedRequests',
			meta: { minutes, maxRequests: rl.maxRequests },
		}
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
		const fieldErrors = zodIssuesToFieldErrors(parsed.error)
		const firstKey = Object.values(fieldErrors)[0] ?? 'errors.invalidInput'
		return { success: false, error: firstKey, fieldErrors }
	}

	const rl = await checkRateLimit('register', await getClientIp())
	if (!rl.allowed) {
		const minutes = Math.max(1, Math.ceil((rl.retryAfterSeconds ?? 0) / 60))
		return {
			success: false,
			error: 'errors.rateLimitedRequests',
			meta: { minutes, maxRequests: rl.maxRequests },
		}
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
			return {
				success: false,
				error: 'errors.emailTaken',
				fieldErrors: { email: 'errors.emailTaken' },
			}
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

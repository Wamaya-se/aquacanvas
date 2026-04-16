'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { ActionResult } from '@/types/actions'

const TEST_MODE_COOKIE = 'aquacanvas-test-mode'
const RATE_LIMIT_BYPASS_COOKIE = 'aquacanvas-rate-limit-bypass'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30 // 30 days

const COOKIE_OPTIONS = {
	httpOnly: true,
	secure: process.env.NODE_ENV === 'production',
	sameSite: 'lax' as const,
	maxAge: COOKIE_MAX_AGE,
	path: '/',
}

async function isAdmin(): Promise<boolean> {
	const supabase = await createClient()
	const { data: { user }, error } = await supabase.auth.getUser()
	if (error || !user) return false
	return user.app_metadata?.role === 'admin'
}

async function requireAdmin() {
	const supabase = await createClient()
	const { data: { user }, error } = await supabase.auth.getUser()
	if (error || !user) redirect('/login')
	if (user.app_metadata?.role !== 'admin') redirect('/')
	return { user, supabase }
}

export async function toggleTestMode(
	enabled: boolean,
): Promise<ActionResult> {
	await requireAdmin()

	const cookieStore = await cookies()

	if (enabled) {
		cookieStore.set(TEST_MODE_COOKIE, 'true', COOKIE_OPTIONS)
	} else {
		cookieStore.delete(TEST_MODE_COOKIE)
	}

	return { success: true, data: undefined }
}

export async function getTestModeEnabled(): Promise<boolean> {
	if (!(await isAdmin())) return false
	const cookieStore = await cookies()
	return cookieStore.get(TEST_MODE_COOKIE)?.value === 'true'
}

export async function toggleRateLimitBypass(
	enabled: boolean,
): Promise<ActionResult> {
	await requireAdmin()

	const cookieStore = await cookies()

	if (enabled) {
		cookieStore.set(RATE_LIMIT_BYPASS_COOKIE, 'true', COOKIE_OPTIONS)
	} else {
		cookieStore.delete(RATE_LIMIT_BYPASS_COOKIE)
	}

	return { success: true, data: undefined }
}

export async function getRateLimitBypassEnabled(): Promise<boolean> {
	if (!(await isAdmin())) return false
	const cookieStore = await cookies()
	return cookieStore.get(RATE_LIMIT_BYPASS_COOKIE)?.value === 'true'
}

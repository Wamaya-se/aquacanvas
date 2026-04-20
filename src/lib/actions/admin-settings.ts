'use server'

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import {
	DEFAULT_UPSCALE_TRIGGER,
	upscaleTriggerSchema,
	type UpscaleTrigger,
} from '@/validators/admin'
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

const UPSCALE_TRIGGER_KEY = 'upscale_trigger'

/**
 * Read the current upscale trigger policy from `app_settings`.
 *
 * Runs with the admin/service-role client because this is called from both
 * authenticated admin UI and from the Stripe webhook / AI status check
 * (which have no user session). The `app_settings` table has public-read
 * RLS, but using the admin client avoids any accidental session coupling.
 *
 * Returns the default (`post_checkout`) on any read/parse failure so the
 * pipeline never stalls on a misconfigured or corrupted setting.
 */
export async function getUpscaleTrigger(): Promise<UpscaleTrigger> {
	try {
		const adminDb = createAdminClient()
		const { data, error } = await adminDb
			.from('app_settings')
			.select('value')
			.eq('key', UPSCALE_TRIGGER_KEY)
			.maybeSingle()

		if (error || !data) return DEFAULT_UPSCALE_TRIGGER

		const parsed = upscaleTriggerSchema.safeParse(data.value)
		return parsed.success ? parsed.data : DEFAULT_UPSCALE_TRIGGER
	} catch (err) {
		console.error('[getUpscaleTrigger]', err)
		return DEFAULT_UPSCALE_TRIGGER
	}
}

/**
 * Update the upscale trigger policy.
 *
 * Admin-only. Performs an upsert so the row is created on first use if the
 * migration seed somehow never ran in an environment.
 */
export async function setUpscaleTrigger(
	value: UpscaleTrigger,
): Promise<ActionResult> {
	await requireAdmin()

	const parsed = upscaleTriggerSchema.safeParse(value)
	if (!parsed.success) {
		return { success: false, error: 'errors.invalidInput' }
	}

	const adminDb = createAdminClient()
	const { error } = await adminDb
		.from('app_settings')
		.upsert(
			{ key: UPSCALE_TRIGGER_KEY, value: parsed.data },
			{ onConflict: 'key' },
		)

	if (error) {
		console.error('[setUpscaleTrigger]', error)
		return { success: false, error: 'errors.generic' }
	}

	revalidatePath('/admin/settings')
	return { success: true, data: undefined }
}

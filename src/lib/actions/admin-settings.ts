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

export interface UpscaleMetrics {
	success: number
	fail: number
	processing: number
	pending: number
	avgCostTimeMs: number | null
	avgPrintDpi: number | null
	total: number
	/**
	 * Success rate as a 0..1 fraction of terminal states (success + fail).
	 * `null` when no terminal rows exist yet (avoids showing "0%" on an
	 * empty window, which would misleadingly imply a regression).
	 */
	successRate: number | null
	windowDays: number
}

/**
 * Aggregate upscale-pipeline health for the last N days (default 30).
 *
 * Used by the admin settings page (30-day window) and the admin dashboard
 * Pipeline Health widget (7-day window). Runs server-side with the admin
 * client — RLS would allow the authenticated admin to read this anyway,
 * but using service-role keeps the query safe to call from settings pages
 * where we already use admin-only helpers.
 *
 * Success rate is computed against terminal states only (success / (success+fail))
 * so still-running jobs don't skew the number downward. Returns zeros (and
 * null averages / null rate) when there are no rows in the window.
 */
export async function getUpscaleMetrics(
	options: { days?: number } = {},
): Promise<UpscaleMetrics> {
	await requireAdmin()

	const windowDays = options.days ?? 30
	const adminDb = createAdminClient()
	const since = new Date(Date.now() - windowDays * 24 * 60 * 60 * 1000).toISOString()

	const { data, error } = await adminDb
		.from('orders')
		.select('upscale_status, upscale_cost_time_ms, print_dpi')
		.gte('created_at', since)
		.not('upscale_status', 'is', null)

	if (error || !data) {
		return {
			success: 0,
			fail: 0,
			processing: 0,
			pending: 0,
			avgCostTimeMs: null,
			avgPrintDpi: null,
			total: 0,
			successRate: null,
			windowDays,
		}
	}

	let success = 0
	let fail = 0
	let processing = 0
	let pending = 0
	let costSum = 0
	let costN = 0
	let dpiSum = 0
	let dpiN = 0

	for (const row of data) {
		switch (row.upscale_status) {
			case 'success':
				success++
				break
			case 'fail':
				fail++
				break
			case 'processing':
				processing++
				break
			case 'pending':
				pending++
				break
		}

		if (row.upscale_cost_time_ms != null) {
			costSum += row.upscale_cost_time_ms
			costN++
		}
		if (row.print_dpi != null) {
			dpiSum += row.print_dpi
			dpiN++
		}
	}

	const terminal = success + fail

	return {
		success,
		fail,
		processing,
		pending,
		avgCostTimeMs: costN > 0 ? Math.round(costSum / costN) : null,
		avgPrintDpi: dpiN > 0 ? Math.round(dpiSum / dpiN) : null,
		total: data.length,
		successRate: terminal > 0 ? success / terminal : null,
		windowDays,
	}
}

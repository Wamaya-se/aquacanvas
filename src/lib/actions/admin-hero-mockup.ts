'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import {
	generateHeroMockupSchema,
	checkHeroMockupSchema,
} from '@/validators/order'
import type { ActionResult } from '@/types/actions'
import {
	HERO_MOCKUP_ORDER_SELECT,
	type HeroMockupOrderRow,
	type HeroMockupStatus,
	getStoragePrefixForOrder,
	triggerHeroMockup,
	pollHeroMockup,
} from '@/lib/hero-mockup-pipeline'
import type { PreviewStatus } from '@/types/supabase'

async function requireAdmin() {
	const supabase = await createClient()
	const { data: { user }, error } = await supabase.auth.getUser()
	if (error || !user) redirect('/login')
	if (user.app_metadata?.role !== 'admin') redirect('/')
	return { user }
}

function revalidateOrder(orderId: string) {
	revalidatePath('/admin/orders')
	revalidatePath(`/admin/orders/${orderId}`)
}

/**
 * Admin-only wrapper that fires (or retries) a hero-mockup generation for
 * any order. Bypasses the user/guest owner check but still enforces that
 * only `admin`-role users can call in. Also clears a prior terminal state
 * so the underlying `triggerHeroMockup` idempotency guard doesn't
 * short-circuit on `success`.
 */
export async function adminTriggerHeroMockup(
	orderId: string,
): Promise<ActionResult<HeroMockupStatus>> {
	await requireAdmin()

	const parsed = generateHeroMockupSchema.safeParse({ orderId })
	if (!parsed.success) {
		return { success: false, error: 'errors.invalidInput' }
	}

	const adminDb = createAdminClient()

	const { data: order, error: orderError } = await adminDb
		.from('orders')
		.select(HERO_MOCKUP_ORDER_SELECT)
		.eq('id', parsed.data.orderId)
		.single<HeroMockupOrderRow>()

	if (orderError || !order) {
		return { success: false, error: 'errors.orderNotFound' }
	}

	// Admin retry semantics: force-reset a terminal state back to `pending`
	// so the pipeline actually runs again. `processing` is untouched so
	// concurrent polls don't collide mid-run.
	if (order.hero_mockup_status === 'success' || order.hero_mockup_status === 'fail') {
		await adminDb
			.from('orders')
			.update({
				hero_mockup_status: 'pending' as PreviewStatus,
				hero_mockup_image_path: null,
				hero_mockup_task_id: null,
				hero_mockup_ai_cost_time_ms: null,
			})
			.eq('id', order.id)

		order.hero_mockup_status = 'pending'
		order.hero_mockup_image_path = null
		order.hero_mockup_task_id = null
	}

	const result = await triggerHeroMockup(order)
	revalidateOrder(order.id)
	return result
}

/**
 * Admin-only poll for a hero-mockup task. Uses the same pipeline as the
 * customer-facing `checkHeroMockupStatus` but skips owner verification.
 */
export async function adminCheckHeroMockupStatus(
	orderId: string,
): Promise<ActionResult<HeroMockupStatus>> {
	await requireAdmin()

	const parsed = checkHeroMockupSchema.safeParse({ orderId })
	if (!parsed.success) {
		return { success: false, error: 'errors.invalidInput' }
	}

	const adminDb = createAdminClient()

	const { data: order, error: orderError } = await adminDb
		.from('orders')
		.select(HERO_MOCKUP_ORDER_SELECT)
		.eq('id', parsed.data.orderId)
		.single<HeroMockupOrderRow>()

	if (orderError || !order) {
		return { success: false, error: 'errors.orderNotFound' }
	}

	const result = await pollHeroMockup(order, getStoragePrefixForOrder(order))
	revalidateOrder(order.id)
	return result
}

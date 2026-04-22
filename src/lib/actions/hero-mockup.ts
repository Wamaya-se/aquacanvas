'use server'

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
	triggerHeroMockup,
	pollHeroMockup,
} from '@/lib/hero-mockup-pipeline'
import {
	getOrderAuthContext,
	verifyOrderAccess,
} from './_order-ownership'

export type { HeroMockupStatus } from '@/lib/hero-mockup-pipeline'

export async function generateHeroMockup(
	orderId: string,
	guestSessionId?: string,
): Promise<ActionResult<HeroMockupStatus>> {
	const parsed = generateHeroMockupSchema.safeParse({ orderId })
	if (!parsed.success) {
		return { success: false, error: 'errors.invalidInput' }
	}

	const ctx = await getOrderAuthContext(guestSessionId)
	if (!ctx.success) {
		return { success: false, error: ctx.error }
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

	const access = verifyOrderAccess(order, ctx.data)
	if (!access.success) {
		return { success: false, error: access.error }
	}

	return triggerHeroMockup(order)
}

export async function checkHeroMockupStatus(
	orderId: string,
	guestSessionId?: string,
): Promise<ActionResult<HeroMockupStatus>> {
	const parsed = checkHeroMockupSchema.safeParse({ orderId })
	if (!parsed.success) {
		return { success: false, error: 'errors.invalidInput' }
	}

	const ctx = await getOrderAuthContext(guestSessionId)
	if (!ctx.success) {
		return { success: false, error: ctx.error }
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

	const access = verifyOrderAccess(order, ctx.data)
	if (!access.success) {
		return { success: false, error: access.error }
	}

	return pollHeroMockup(order, ctx.data.storagePrefix)
}

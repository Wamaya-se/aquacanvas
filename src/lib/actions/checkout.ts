'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getStripe } from '@/lib/stripe'
import { getSiteUrl } from '@/lib/env'
import { checkoutSchema } from '@/validators/order'
import type { ActionResult } from '@/types/actions'

interface CheckoutSessionData {
	url: string
}

interface SimulatePurchaseData {
	orderId: string
}

async function verifyOrderOwnership(
	orderId: string,
	guestSessionId?: string,
) {
	const supabase = await createClient()
	const {
		data: { user },
	} = await supabase.auth.getUser()

	const isGuest = !user

	if (isGuest && !guestSessionId) {
		return { error: 'errors.invalidInput' as const, order: null, user: null }
	}

	const adminDb = createAdminClient()

	const { data: order, error: orderError } = await adminDb
		.from('orders')
		.select('id, user_id, guest_session_id, status, style_id')
		.eq('id', orderId)
		.single()

	if (orderError || !order) {
		return { error: 'errors.orderNotFound' as const, order: null, user: null }
	}

	if (user && order.user_id !== user.id) {
		return { error: 'errors.forbidden' as const, order: null, user: null }
	}

	if (isGuest && order.guest_session_id !== guestSessionId) {
		return { error: 'errors.forbidden' as const, order: null, user: null }
	}

	if (order.status !== 'generated') {
		return { error: 'errors.orderNotGenerated' as const, order: null, user: null }
	}

	return { error: null, order, user }
}

async function fetchFormat(adminDb: ReturnType<typeof createAdminClient>, formatId: string) {
	const idParsed = z.string().uuid().safeParse(formatId)
	if (!idParsed.success) return null

	const { data } = await adminDb
		.from('print_formats')
		.select('id, name, price_cents, is_active')
		.eq('id', idParsed.data)
		.single()

	return data?.is_active ? data : null
}

export async function createCheckoutSession(
	orderId: string,
	guestSessionId?: string,
	discountCode?: string,
	formatId?: string,
): Promise<ActionResult<CheckoutSessionData>> {
	const parsed = checkoutSchema.safeParse({ orderId, formatId })
	if (!parsed.success) {
		return { success: false, error: 'errors.invalidInput' }
	}

	if (!formatId) {
		return { success: false, error: 'errors.formatRequired' }
	}

	const { error, order, user } = await verifyOrderOwnership(
		parsed.data.orderId,
		guestSessionId,
	)
	if (error || !order) {
		return { success: false, error: error ?? 'errors.orderNotFound' }
	}

	const adminDb = createAdminClient()

	const [styleResult, format] = await Promise.all([
		adminDb
			.from('styles')
			.select('name, price_cents')
			.eq('id', order.style_id)
			.single(),
		fetchFormat(adminDb, formatId),
	])

	if (styleResult.error || !styleResult.data) {
		return { success: false, error: 'errors.styleNotFound' }
	}
	const style = styleResult.data

	if (!format) {
		return { success: false, error: 'errors.formatNotFound' }
	}

	const totalPriceCents = style.price_cents + format.price_cents

	let discountCodeId: string | null = null
	let stripePromoId: string | null = null

	if (discountCode?.trim()) {
		const { data: discount } = await adminDb
			.from('discount_codes')
			.select('id, stripe_promo_id, is_active, max_uses, current_uses, expires_at')
			.eq('code', discountCode.trim().toUpperCase())
			.single()

		if (!discount || !discount.is_active || !discount.stripe_promo_id) {
			return { success: false, error: 'errors.invalidDiscountCode' }
		}

		if (discount.max_uses && discount.current_uses >= discount.max_uses) {
			return { success: false, error: 'errors.invalidDiscountCode' }
		}

		if (discount.expires_at && new Date(discount.expires_at) < new Date()) {
			return { success: false, error: 'errors.invalidDiscountCode' }
		}

		discountCodeId = discount.id
		stripePromoId = discount.stripe_promo_id
	}

	const siteUrl = getSiteUrl()
	const stripe = getStripe()

	try {
		const session = await stripe.checkout.sessions.create({
			mode: 'payment',
			line_items: [
				{
					price_data: {
						currency: 'sek',
						product_data: {
							name: `Aquacanvas — ${style.name}`,
							description: `AI-generated artwork · ${format.name}`,
						},
						unit_amount: totalPriceCents,
					},
					quantity: 1,
				},
			],
			...(stripePromoId ? { discounts: [{ promotion_code: stripePromoId }] } : {}),
			metadata: {
				orderId: order.id,
				formatId: format.id,
				...(discountCodeId ? { discountCodeId } : {}),
				...(user ? { userId: user.id } : { guestSessionId: order.guest_session_id ?? '' }),
			},
			...(user ? { customer_email: user.email ?? undefined } : {}),
			success_url: `${siteUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
			cancel_url: `${siteUrl}/checkout/cancel?order_id=${order.id}`,
		})

		if (!session.url) {
			return { success: false, error: 'errors.checkoutFailed' }
		}

		await adminDb
			.from('orders')
			.update({
				format_id: format.id,
				...(discountCodeId ? { discount_code_id: discountCodeId } : {}),
			})
			.eq('id', order.id)

		return { success: true, data: { url: session.url } }
	} catch (err) {
		console.error('[createCheckoutSession] Stripe error', err)
		return { success: false, error: 'errors.checkoutFailed' }
	}
}

export async function simulatePurchase(
	orderId: string,
	guestSessionId?: string,
	formatId?: string,
): Promise<ActionResult<SimulatePurchaseData>> {
	if (process.env.NODE_ENV === 'production') {
		return { success: false, error: 'errors.simulateNotAllowed' }
	}

	const parsed = checkoutSchema.safeParse({ orderId, formatId })
	if (!parsed.success) {
		return { success: false, error: 'errors.invalidInput' }
	}

	if (!formatId) {
		return { success: false, error: 'errors.formatRequired' }
	}

	const { error, order } = await verifyOrderOwnership(
		parsed.data.orderId,
		guestSessionId,
	)
	if (error || !order) {
		return { success: false, error: error ?? 'errors.orderNotFound' }
	}

	const adminDb = createAdminClient()

	const [styleResult, format] = await Promise.all([
		adminDb
			.from('styles')
			.select('price_cents')
			.eq('id', order.style_id)
			.single(),
		fetchFormat(adminDb, formatId),
	])

	const stylePriceCents = styleResult.data?.price_cents ?? 34900
	const formatPriceCents = format?.price_cents ?? 0
	const totalPriceCents = stylePriceCents + formatPriceCents

	const { error: updateError } = await adminDb
		.from('orders')
		.update({
			status: 'paid',
			price_cents: totalPriceCents,
			format_id: format?.id ?? null,
			stripe_session_id: `sim_dev_${Date.now()}`,
		})
		.eq('id', order.id)

	if (updateError) {
		console.error('[simulatePurchase] update error', updateError)
		return { success: false, error: 'errors.paymentFailed' }
	}

	return { success: true, data: { orderId: order.id } }
}

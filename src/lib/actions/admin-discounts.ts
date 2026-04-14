'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { getStripe } from '@/lib/stripe'
import { createDiscountSchema } from '@/validators/discount'
import type { ActionResult } from '@/types/actions'

async function requireAdmin() {
	const supabase = await createClient()
	const { data: { user }, error } = await supabase.auth.getUser()
	if (error || !user) redirect('/login')
	if (user.app_metadata?.role !== 'admin') redirect('/')
	return { user, supabase }
}

export async function createDiscountCode(
	formData: FormData,
): Promise<ActionResult<{ id: string }>> {
	const { supabase } = await requireAdmin()

	const raw = Object.fromEntries(formData)
	const parsed = createDiscountSchema.safeParse({
		code: raw.code,
		discountType: raw.discountType,
		discountPercent: raw.discountPercent || undefined,
		discountAmountSek: raw.discountAmountSek || undefined,
		maxUses: raw.maxUses || undefined,
		expiresAt: raw.expiresAt || undefined,
	})

	if (!parsed.success) {
		return { success: false, error: 'errors.invalidInput' }
	}

	const stripe = getStripe()
	const isPercent = parsed.data.discountType === 'percent'

	try {
		const coupon = await stripe.coupons.create({
			...(isPercent
				? { percent_off: parsed.data.discountPercent }
				: { amount_off: parsed.data.discountAmountSek! * 100, currency: 'sek' }),
			duration: 'once',
			name: parsed.data.code,
		})

		const promo = await stripe.promotionCodes.create({
			coupon: coupon.id,
			code: parsed.data.code,
			...(parsed.data.maxUses ? { max_redemptions: parsed.data.maxUses } : {}),
			...(parsed.data.expiresAt ? { expires_at: Math.floor(new Date(parsed.data.expiresAt).getTime() / 1000) } : {}),
		})

		const { data, error } = await supabase
			.from('discount_codes')
			.insert({
				code: parsed.data.code,
				stripe_coupon_id: coupon.id,
				stripe_promo_id: promo.id,
				discount_percent: isPercent ? parsed.data.discountPercent! : null,
				discount_amount_cents: !isPercent ? parsed.data.discountAmountSek! * 100 : null,
				max_uses: typeof parsed.data.maxUses === 'number' ? parsed.data.maxUses : null,
				is_active: true,
				expires_at: parsed.data.expiresAt || null,
			})
			.select('id')
			.single()

		if (error) {
			console.error('[createDiscountCode] DB insert', error)
			if (error.code === '23505') {
				return { success: false, error: 'errors.discountCodeTaken' }
			}
			return { success: false, error: 'errors.generic' }
		}

		revalidatePath('/admin/discounts')
		return { success: true, data: { id: data.id } }
	} catch (err) {
		console.error('[createDiscountCode] Stripe error', err)
		return { success: false, error: 'errors.generic' }
	}
}

export async function toggleDiscountCode(
	discountId: string,
	isActive: boolean,
): Promise<ActionResult> {
	const { supabase } = await requireAdmin()

	const idParsed = z.string().uuid().safeParse(discountId)
	if (!idParsed.success) {
		return { success: false, error: 'errors.invalidInput' }
	}

	const { data: discount } = await supabase
		.from('discount_codes')
		.select('stripe_promo_id')
		.eq('id', idParsed.data)
		.single()

	if (discount?.stripe_promo_id) {
		try {
			const stripe = getStripe()
			await stripe.promotionCodes.update(discount.stripe_promo_id, {
				active: isActive,
			})
		} catch (err) {
			console.error('[toggleDiscountCode] Stripe update', err)
		}
	}

	const { error } = await supabase
		.from('discount_codes')
		.update({ is_active: isActive })
		.eq('id', idParsed.data)

	if (error) {
		console.error('[toggleDiscountCode]', error)
		return { success: false, error: 'errors.generic' }
	}

	revalidatePath('/admin/discounts')
	return { success: true, data: undefined }
}

export async function deleteDiscountCode(
	discountId: string,
): Promise<ActionResult> {
	const { supabase } = await requireAdmin()

	const idParsed = z.string().uuid().safeParse(discountId)
	if (!idParsed.success) {
		return { success: false, error: 'errors.invalidInput' }
	}

	const { data: discount } = await supabase
		.from('discount_codes')
		.select('stripe_coupon_id')
		.eq('id', idParsed.data)
		.single()

	if (discount?.stripe_coupon_id) {
		try {
			const stripe = getStripe()
			await stripe.coupons.del(discount.stripe_coupon_id)
		} catch (err) {
			console.error('[deleteDiscountCode] Stripe delete', err)
		}
	}

	const { error } = await supabase
		.from('discount_codes')
		.delete()
		.eq('id', idParsed.data)

	if (error) {
		console.error('[deleteDiscountCode]', error)
		return { success: false, error: 'errors.generic' }
	}

	revalidatePath('/admin/discounts')
	return { success: true, data: undefined }
}

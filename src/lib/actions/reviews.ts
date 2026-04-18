'use server'

import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import {
	moderateReviewSchema,
	submitReviewSchema,
} from '@/validators/review'
import type { ActionResult } from '@/types/actions'
import { zodIssuesToFieldErrors } from '@/lib/form-errors'
import { checkRateLimit } from '@/lib/rate-limit'
import { unwrapSingleRelation } from '@/lib/db-helpers'

async function requireAdmin() {
	const supabase = await createClient()
	const { data: { user }, error } = await supabase.auth.getUser()
	if (error || !user) redirect('/login')
	if (user.app_metadata?.role !== 'admin') redirect('/')
	return { user, supabase }
}

async function getClientIp(): Promise<string> {
	const hdrs = await headers()
	return (
		hdrs.get('x-forwarded-for')?.split(',')[0]?.trim() ??
		hdrs.get('x-real-ip') ??
		'unknown'
	)
}

export async function submitReview(
	formData: FormData,
): Promise<ActionResult> {
	const parsed = submitReviewSchema.safeParse({
		productId: formData.get('productId'),
		orderId: formData.get('orderId') || undefined,
		customerName: formData.get('customerName'),
		customerEmail: formData.get('customerEmail'),
		rating: formData.get('rating'),
		title: formData.get('title') || undefined,
		body: formData.get('body'),
		locale: formData.get('locale') || 'sv',
	})

	if (!parsed.success) {
		return {
			success: false,
			error: 'errors.invalidInput',
			fieldErrors: zodIssuesToFieldErrors(parsed.error),
		}
	}

	const ip = await getClientIp()
	const rlKey = `${ip}:${parsed.data.customerEmail}`
	const rl = await checkRateLimit('reviewSubmit', rlKey)
	if (!rl.allowed) {
		const minutes = Math.max(1, Math.ceil((rl.retryAfterSeconds ?? 0) / 60))
		return {
			success: false,
			error: 'errors.rateLimitedRequests',
			meta: { minutes, maxRequests: rl.maxRequests },
		}
	}

	const supabase = await createClient()
	const { error } = await supabase.from('product_reviews').insert({
		product_id: parsed.data.productId,
		order_id: parsed.data.orderId ?? null,
		customer_name: parsed.data.customerName,
		customer_email: parsed.data.customerEmail,
		rating: parsed.data.rating,
		title: parsed.data.title ?? null,
		body: parsed.data.body,
		locale: parsed.data.locale,
		status: 'pending',
	})

	if (error) {
		console.error('[submitReview]', error)
		return { success: false, error: 'errors.generic' }
	}

	revalidatePath('/admin/reviews')
	return { success: true, data: undefined }
}

export async function moderateReview(
	reviewId: string,
	action: 'approve' | 'reject' | 'delete',
): Promise<ActionResult> {
	await requireAdmin()

	const parsed = moderateReviewSchema.safeParse({ reviewId, action })
	if (!parsed.success) {
		return { success: false, error: 'errors.invalidInput' }
	}

	const adminDb = createAdminClient()

	const { data: review, error: loadErr } = await adminDb
		.from('product_reviews')
		.select('id, product_id, products(slug)')
		.eq('id', parsed.data.reviewId)
		.single()

	if (loadErr || !review) {
		return { success: false, error: 'errors.notFound' }
	}

	if (parsed.data.action === 'delete') {
		const { error } = await adminDb
			.from('product_reviews')
			.delete()
			.eq('id', parsed.data.reviewId)
		if (error) {
			console.error('[moderateReview:delete]', error)
			return { success: false, error: 'errors.generic' }
		}
	} else {
		const nextStatus =
			parsed.data.action === 'approve' ? 'approved' : 'rejected'
		const { error } = await adminDb
			.from('product_reviews')
			.update({ status: nextStatus })
			.eq('id', parsed.data.reviewId)
		if (error) {
			console.error('[moderateReview:update]', error)
			return { success: false, error: 'errors.generic' }
		}
	}

	revalidatePath('/admin/reviews')

	// Revalidate public product page so aggregateRating + list update.
	const product = unwrapSingleRelation(review.products)
	if (product?.slug) {
		revalidatePath(`/p/${product.slug}`)
		revalidatePath(`/en/p/${product.slug}`)
	}

	return { success: true, data: undefined }
}

/** Public helper: aggregate rating + count for approved reviews on a product. */
export async function getPublicReviewStats(
	productId: string,
): Promise<{ count: number; average: number } | null> {
	const idParsed = z.string().uuid().safeParse(productId)
	if (!idParsed.success) return null

	const supabase = await createClient()
	const { data, error } = await supabase
		.from('product_reviews')
		.select('rating')
		.eq('product_id', idParsed.data)
		.eq('status', 'approved')

	if (error || !data || data.length === 0) {
		return { count: 0, average: 0 }
	}

	const total = data.reduce((sum, r) => sum + r.rating, 0)
	return { count: data.length, average: total / data.length }
}

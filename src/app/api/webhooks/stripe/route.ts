import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getStripe } from '@/lib/stripe'
import { getStripeWebhookSecret } from '@/lib/env'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendOrderConfirmation, sendAdminOrderNotification } from '@/lib/email/send'

export async function POST(request: Request) {
	const body = await request.text()
	const signature = request.headers.get('stripe-signature')

	if (!signature) {
		return NextResponse.json(
			{ error: 'Missing stripe-signature header' },
			{ status: 400 },
		)
	}

	const stripe = getStripe()
	let event

	try {
		event = stripe.webhooks.constructEvent(
			body,
			signature,
			getStripeWebhookSecret(),
		)
	} catch (err) {
		console.error('[stripe-webhook] Signature verification failed', err)
		return NextResponse.json(
			{ error: 'Webhook signature verification failed' },
			{ status: 400 },
		)
	}

	if (event.type === 'checkout.session.completed') {
		const session = event.data.object
		const rawOrderId = session.metadata?.orderId
		const orderIdResult = z.string().uuid().safeParse(rawOrderId)

		if (!orderIdResult.success) {
			console.error('[stripe-webhook] Invalid or missing orderId in session metadata')
			return NextResponse.json(
				{ error: 'Invalid orderId in metadata' },
				{ status: 400 },
			)
		}

		const orderId = orderIdResult.data

		const customerEmail = session.customer_details?.email ?? null
		const adminDb = createAdminClient()

		// Idempotency: skip if this event was already processed. Stripe retries
		// failed deliveries and may send the same event multiple times.
		const { data: idempotencyRow, error: idempotencyError } = await adminDb
			.from('processed_stripe_events')
			.insert({ event_id: event.id, event_type: event.type })
			.select('event_id')
			.maybeSingle()

		if (idempotencyError && idempotencyError.code !== '23505') {
			console.error('[stripe-webhook] idempotency insert failed', idempotencyError)
			// Fail open: return 500 so Stripe retries; safer than silent skip.
			return NextResponse.json(
				{ error: 'Idempotency check failed' },
				{ status: 500 },
			)
		}

		if (!idempotencyRow) {
			console.log(`[stripe-webhook] event ${event.id} already processed, skipping`)
			return NextResponse.json({ received: true, duplicate: true })
		}

		const formatId = session.metadata?.formatId
		const formatIdResult = formatId ? z.string().uuid().safeParse(formatId) : null

		const { error: updateError } = await adminDb
			.from('orders')
			.update({
				status: 'paid',
				price_cents: session.amount_total,
				stripe_session_id: session.id,
				customer_email: customerEmail,
				...(formatIdResult?.success ? { format_id: formatIdResult.data } : {}),
			})
			.eq('id', orderId)

		if (updateError) {
			console.error('[stripe-webhook] Order update failed', updateError)
			return NextResponse.json(
				{ error: 'Failed to update order' },
				{ status: 500 },
			)
		}

		console.log(`[stripe-webhook] Order ${orderId} marked as paid`)

		const { data: order } = await adminDb
			.from('orders')
			.select('id, price_cents, generated_image_path, format_id, styles(name), print_formats(name)')
			.eq('id', orderId)
			.single()

		if (order) {
			const styleName = (order.styles as { name: string } | null)?.name ?? 'Artwork'
			const formatName = (order.print_formats as { name: string } | null)?.name ?? null
			const generatedImageUrl = order.generated_image_path
				? adminDb.storage.from('images').getPublicUrl(order.generated_image_path).data.publicUrl
				: null

			const emailData = {
				orderId: order.id,
				customerEmail,
				styleName,
				formatName,
				priceCents: order.price_cents ?? 0,
				generatedImageUrl,
			}

			await Promise.allSettled([
				sendOrderConfirmation(emailData),
				sendAdminOrderNotification(emailData),
			])
		}

		const discountCodeId = session.metadata?.discountCodeId
		if (discountCodeId) {
			const dcIdResult = z.string().uuid().safeParse(discountCodeId)
			if (dcIdResult.success) {
				await adminDb.rpc('increment_discount_uses', {
					discount_id: dcIdResult.data,
				})
			}
		}
	}

	return NextResponse.json({ received: true })
}

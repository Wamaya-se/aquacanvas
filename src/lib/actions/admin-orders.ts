'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import type { ActionResult } from '@/types/actions'
import type { OrderStatus } from '@/types/supabase'

const ORDER_STATUSES: OrderStatus[] = ['created', 'processing', 'generated', 'paid', 'shipped']

const updateStatusSchema = z.object({
	orderId: z.string().uuid(),
	status: z.enum(['created', 'processing', 'generated', 'paid', 'shipped']),
})

async function requireAdmin() {
	const supabase = await createClient()
	const { data: { user }, error } = await supabase.auth.getUser()
	if (error || !user) redirect('/login')
	if (user.app_metadata?.role !== 'admin') redirect('/')
	return { user, supabase }
}

export async function updateOrderStatus(
	orderId: string,
	status: string,
): Promise<ActionResult> {
	const { supabase } = await requireAdmin()

	const parsed = updateStatusSchema.safeParse({ orderId, status })
	if (!parsed.success) {
		return { success: false, error: 'errors.invalidInput' }
	}

	const { error } = await supabase
		.from('orders')
		.update({ status: parsed.data.status })
		.eq('id', parsed.data.orderId)

	if (error) {
		console.error('[updateOrderStatus]', error)
		return { success: false, error: 'errors.generic' }
	}

	if (parsed.data.status === 'shipped') {
		try {
			const { data: order } = await supabase
				.from('orders')
				.select('id, customer_email, price_cents, styles(name)')
				.eq('id', parsed.data.orderId)
				.single()

			if (order?.customer_email) {
				const { sendOrderShippedEmail } = await import('@/lib/email/send')
				const styleName = (order.styles as { name: string } | null)?.name ?? 'Artwork'
				await sendOrderShippedEmail({
					orderId: order.id,
					customerEmail: order.customer_email,
					styleName,
					priceCents: order.price_cents ?? 0,
				})
			}
		} catch (err) {
			console.error('[updateOrderStatus] shipped email failed', err)
		}
	}

	revalidatePath('/admin/orders')
	revalidatePath(`/admin/orders/${orderId}`)
	return { success: true, data: undefined }
}

function escapeCsvField(value: string): string {
	if (value.includes(',') || value.includes('"') || value.includes('\n')) {
		return `"${value.replace(/"/g, '""')}"`
	}
	return value
}

export async function exportOrdersCsv(
	status?: string,
): Promise<ActionResult<{ csv: string; filename: string }>> {
	const { supabase } = await requireAdmin()

	let query = supabase
		.from('orders')
		.select('id, status, price_cents, customer_email, stripe_session_id, created_at, styles(name), products(name)')
		.order('created_at', { ascending: false })

	if (status && status !== 'all' && ORDER_STATUSES.includes(status as OrderStatus)) {
		query = query.eq('status', status as OrderStatus)
	}

	const { data: orders, error } = await query

	if (error) {
		console.error('[exportOrdersCsv]', error)
		return { success: false, error: 'errors.generic' }
	}

	const headers = ['Order ID', 'Date', 'Status', 'Customer Email', 'Style', 'Product', 'Price (SEK)', 'Stripe Session ID']
	const rows = (orders ?? []).map((order) => [
		order.id,
		new Date(order.created_at).toISOString().slice(0, 19).replace('T', ' '),
		order.status,
		order.customer_email ?? '',
		(order.styles as { name: string } | null)?.name ?? '',
		(order.products as { name: string } | null)?.name ?? '',
		order.price_cents ? (order.price_cents / 100).toFixed(2) : '',
		order.stripe_session_id ?? '',
	])

	const csv = [
		headers.map(escapeCsvField).join(','),
		...rows.map((row) => row.map(escapeCsvField).join(',')),
	].join('\n')

	const datePart = new Date().toISOString().slice(0, 10)
	const filename = `aquacanvas-orders-${status && status !== 'all' ? status + '-' : ''}${datePart}.csv`

	return { success: true, data: { csv, filename } }
}

export { ORDER_STATUSES }

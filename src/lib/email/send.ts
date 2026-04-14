import { getResend } from '@/lib/email'
import { getAdminEmail, getSiteUrl } from '@/lib/env'
import { OrderConfirmationEmail } from './templates/order-confirmation'
import { AdminOrderNotificationEmail } from './templates/admin-order-notification'
import { OrderShippedEmail } from './templates/order-shipped'

interface OrderEmailData {
	orderId: string
	customerEmail: string | null
	styleName: string
	formatName?: string | null
	priceCents: number
	generatedImageUrl?: string | null
}

export async function sendOrderConfirmation(data: OrderEmailData) {
	if (!data.customerEmail) return

	try {
		const resend = getResend()
		const siteUrl = getSiteUrl()

		await resend.emails.send({
			from: 'Aquacanvas <noreply@aquacanvas.com>',
			to: data.customerEmail,
			subject: `Order Confirmed — #${data.orderId.slice(0, 8)}`,
			react: OrderConfirmationEmail({
				orderNumber: data.orderId.slice(0, 8),
				styleName: data.styleName,
				formatName: data.formatName ?? undefined,
				price: (data.priceCents / 100).toFixed(0),
				generatedImageUrl: data.generatedImageUrl,
				siteUrl,
			}),
		})
	} catch (err) {
		console.error('[sendOrderConfirmation] Failed', err)
	}
}

export async function sendOrderShippedEmail(data: Pick<OrderEmailData, 'orderId' | 'customerEmail' | 'styleName' | 'priceCents'>) {
	if (!data.customerEmail) return

	try {
		const resend = getResend()
		const siteUrl = getSiteUrl()

		await resend.emails.send({
			from: 'Aquacanvas <noreply@aquacanvas.com>',
			to: data.customerEmail,
			subject: `Your Order Has Shipped — #${data.orderId.slice(0, 8)}`,
			react: OrderShippedEmail({
				orderNumber: data.orderId.slice(0, 8),
				styleName: data.styleName,
				price: (data.priceCents / 100).toFixed(0),
				siteUrl,
			}),
		})
	} catch (err) {
		console.error('[sendOrderShippedEmail] Failed', err)
	}
}

export async function sendAdminOrderNotification(data: OrderEmailData) {
	try {
		const resend = getResend()
		const siteUrl = getSiteUrl()
		const adminEmail = getAdminEmail()

		await resend.emails.send({
			from: 'Aquacanvas <noreply@aquacanvas.com>',
			to: adminEmail,
			subject: `New Order — #${data.orderId.slice(0, 8)}`,
			react: AdminOrderNotificationEmail({
				orderNumber: data.orderId.slice(0, 8),
				customerEmail: data.customerEmail,
				styleName: data.styleName,
				formatName: data.formatName ?? undefined,
				price: (data.priceCents / 100).toFixed(0),
				adminUrl: `${siteUrl}/admin/orders/${data.orderId}`,
			}),
		})
	} catch (err) {
		console.error('[sendAdminOrderNotification] Failed', err)
	}
}

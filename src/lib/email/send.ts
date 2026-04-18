import { getTranslations } from 'next-intl/server'
import { getResend } from '@/lib/email'
import { getAdminEmail, getSiteUrl } from '@/lib/env'
import { OrderConfirmationEmail } from './templates/order-confirmation'
import { AdminOrderNotificationEmail } from './templates/admin-order-notification'
import { OrderShippedEmail } from './templates/order-shipped'

type EmailLocale = 'sv' | 'en'

function normalizeLocale(locale: string | null | undefined): EmailLocale {
	return locale === 'en' ? 'en' : 'sv'
}

interface OrderEmailData {
	orderId: string
	customerEmail: string | null
	styleName: string
	formatName?: string | null
	priceCents: number
	generatedImageUrl?: string | null
	locale?: string | null
}

function formatPrice(priceCents: number) {
	return (priceCents / 100).toFixed(0)
}

export async function sendOrderConfirmation(data: OrderEmailData) {
	if (!data.customerEmail) return

	try {
		const resend = getResend()
		const siteUrl = getSiteUrl()
		const locale = normalizeLocale(data.locale)
		const t = await getTranslations({ locale, namespace: 'emails.orderConfirmation' })

		const orderNumber = data.orderId.slice(0, 8)
		const priceLabel = t('priceSEK', { amount: formatPrice(data.priceCents) })

		await resend.emails.send({
			from: 'Aquacanvas <noreply@aquacanvas.com>',
			to: data.customerEmail,
			subject: t('subject', { orderNumber }),
			react: OrderConfirmationEmail({
				locale,
				strings: {
					preview: t('preview', { orderNumber }),
					heading: t('heading'),
					intro: t('intro'),
					labelOrderNumber: t('labelOrderNumber'),
					labelStyle: t('labelStyle'),
					labelFormat: t('labelFormat'),
					labelTotal: t('labelTotal'),
					altArtwork: t('altArtwork'),
					footerQuestions: t('footerQuestions'),
					orderNumberValue: t('orderNumberValue', { orderNumber }),
					priceLabel,
				},
				styleName: data.styleName,
				formatName: data.formatName ?? undefined,
				generatedImageUrl: data.generatedImageUrl,
				siteUrl,
			}),
		})
	} catch (err) {
		console.error('[sendOrderConfirmation] Failed', err)
	}
}

export async function sendOrderShippedEmail(
	data: Pick<
		OrderEmailData,
		'orderId' | 'customerEmail' | 'styleName' | 'priceCents' | 'locale'
	>,
) {
	if (!data.customerEmail) return

	try {
		const resend = getResend()
		const siteUrl = getSiteUrl()
		const locale = normalizeLocale(data.locale)
		const t = await getTranslations({ locale, namespace: 'emails.orderShipped' })

		const orderNumber = data.orderId.slice(0, 8)
		const priceLabel = t('priceSEK', { amount: formatPrice(data.priceCents) })

		await resend.emails.send({
			from: 'Aquacanvas <noreply@aquacanvas.com>',
			to: data.customerEmail,
			subject: t('subject', { orderNumber }),
			react: OrderShippedEmail({
				locale,
				strings: {
					preview: t('preview', { orderNumber }),
					heading: t('heading'),
					intro: t('intro'),
					labelOrderNumber: t('labelOrderNumber'),
					labelStyle: t('labelStyle'),
					labelTotal: t('labelTotal'),
					footerQuestions: t('footerQuestions'),
					orderNumberValue: t('orderNumberValue', { orderNumber }),
					priceLabel,
				},
				styleName: data.styleName,
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
		const locale = normalizeLocale(data.locale)
		const t = await getTranslations({
			locale,
			namespace: 'emails.adminOrderNotification',
		})

		const orderNumber = data.orderId.slice(0, 8)
		const priceLabel = t('priceSEK', { amount: formatPrice(data.priceCents) })

		await resend.emails.send({
			from: 'Aquacanvas <noreply@aquacanvas.com>',
			to: adminEmail,
			subject: t('subject', { orderNumber }),
			react: AdminOrderNotificationEmail({
				locale,
				strings: {
					preview: t('preview', { orderNumber }),
					heading: t('heading'),
					intro: t('intro'),
					labelOrderNumber: t('labelOrderNumber'),
					labelCustomer: t('labelCustomer'),
					labelStyle: t('labelStyle'),
					labelFormat: t('labelFormat'),
					labelAmount: t('labelAmount'),
					guestLabel: t('guestLabel'),
					ctaViewOrder: t('ctaViewOrder'),
					footer: t('footer'),
					orderNumberValue: t('orderNumberValue', { orderNumber }),
					priceLabel,
				},
				customerEmail: data.customerEmail,
				styleName: data.styleName,
				formatName: data.formatName ?? undefined,
				adminUrl: `${siteUrl}/admin/orders/${data.orderId}`,
			}),
		})
	} catch (err) {
		console.error('[sendAdminOrderNotification] Failed', err)
	}
}

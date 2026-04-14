import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { createAdminClient } from '@/lib/supabase/admin'
import { getStripe } from '@/lib/stripe'

export async function generateMetadata(): Promise<Metadata> {
	const t = await getTranslations('checkout.meta')

	return {
		title: t('successTitle'),
		description: t('successDescription'),
	}
}

interface SuccessPageProps {
	searchParams: Promise<{ session_id?: string; order_id?: string }>
}

async function getOrderBySessionId(sessionId: string) {
	const stripe = getStripe()
	const session = await stripe.checkout.sessions.retrieve(sessionId)
	const orderId = session.metadata?.orderId
	if (!orderId) return null

	const adminDb = createAdminClient()
	const { data } = await adminDb
		.from('orders')
		.select('id, status, price_cents, style_id, generated_image_path, styles(name)')
		.eq('id', orderId)
		.single()

	return data
}

async function getOrderById(orderId: string) {
	const adminDb = createAdminClient()
	const { data } = await adminDb
		.from('orders')
		.select('id, status, price_cents, style_id, generated_image_path, styles(name)')
		.eq('id', orderId)
		.single()

	return data
}

export default async function CheckoutSuccessPage({
	searchParams,
}: SuccessPageProps) {
	const t = await getTranslations('checkout')
	const params = await searchParams

	let order: Awaited<ReturnType<typeof getOrderBySessionId>> = null

	if (params.session_id) {
		try {
			order = await getOrderBySessionId(params.session_id)
		} catch {
			// Stripe session lookup failed — fall through
		}
	} else if (params.order_id) {
		const uuidResult = z.string().uuid().safeParse(params.order_id)
		if (uuidResult.success) {
			order = await getOrderById(uuidResult.data)
		}
	}

	if (!order || (order.status !== 'paid' && order.status !== 'shipped')) {
		notFound()
	}

	const adminDb = createAdminClient()
	const generatedImageUrl = order.generated_image_path
		? adminDb.storage
				.from('images')
				.getPublicUrl(order.generated_image_path).data.publicUrl
		: null

	const styleName =
		(order.styles as { name: string } | null)?.name ?? 'Artwork'
	const priceFormatted = order.price_cents
		? `${(order.price_cents / 100).toFixed(0)} SEK`
		: null

	return (
		<div className="mx-auto flex max-w-2xl flex-col items-center px-6 py-16 lg:py-24">
			<div className="mb-6 flex size-16 items-center justify-center rounded-full bg-success/10">
				<CheckCircle2
					className="size-8 text-success"
					aria-hidden="true"
				/>
			</div>

			<h1 className="mb-3 text-center font-heading text-3xl font-bold tracking-[-0.03em] text-foreground sm:text-4xl">
				{t('successTitle')}
			</h1>

			<p className="mb-8 text-center font-sans text-base leading-[1.7] text-muted-foreground">
				{t('successMessage')}
			</p>

			<div className="mb-8 w-full overflow-hidden rounded-xl bg-surface-container-high p-6">
				<p className="mb-1 font-sans text-xs font-medium text-muted-foreground">
					{t('orderConfirmation')}
				</p>
				<p className="mb-4 font-heading text-sm font-semibold tracking-[-0.03em] text-foreground">
					{t('orderNumber', { id: order.id.slice(0, 8) })}
				</p>

				{generatedImageUrl && (
					<div className="relative mb-4 overflow-hidden rounded-lg">
						<Image
							src={generatedImageUrl}
							alt={styleName}
							width={600}
							height={600}
							unoptimized
							className="h-auto w-full object-cover"
						/>
					</div>
				)}

				<div className="flex items-center justify-between">
					<p className="font-sans text-sm text-muted-foreground">
						{t('artworkStyle', { style: styleName })}
					</p>
					{priceFormatted && (
						<p className="font-heading text-lg font-semibold tracking-[-0.03em] text-foreground">
							{priceFormatted}
						</p>
					)}
				</div>
			</div>

			<div className="flex w-full flex-col gap-3 sm:flex-row">
				<Button
					variant="brand"
					size="lg"
					className="flex-1"
					asChild
				>
					<Link href="/create">
						{t('createAnother')}
					</Link>
				</Button>
				<Button
					variant="secondary"
					size="lg"
					className="flex-1"
					asChild
				>
					<Link href="/">
						{t('backToHome')}
					</Link>
				</Button>
			</div>
		</div>
	)
}

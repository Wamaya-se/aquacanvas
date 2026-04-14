import type { Metadata } from 'next'
import Link from 'next/link'
import { XCircle } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { Button } from '@/components/ui/button'

export async function generateMetadata(): Promise<Metadata> {
	const t = await getTranslations('checkout.meta')

	return {
		title: t('cancelTitle'),
		description: t('cancelDescription'),
	}
}

export default async function CheckoutCancelPage() {
	const t = await getTranslations('checkout')

	return (
		<div className="mx-auto flex max-w-2xl flex-col items-center px-6 py-16 lg:py-24">
			<div className="mb-6 flex size-16 items-center justify-center rounded-full bg-destructive/10">
				<XCircle
					className="size-8 text-destructive"
					aria-hidden="true"
				/>
			</div>

			<h1 className="mb-3 text-center font-heading text-3xl font-bold tracking-[-0.03em] text-foreground sm:text-4xl">
				{t('cancelTitle')}
			</h1>

			<p className="mb-8 text-center font-sans text-base leading-[1.7] text-muted-foreground">
				{t('cancelMessage')}
			</p>

			<div className="flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
				<Button
					variant="brand"
					size="lg"
					asChild
				>
					<Link href="/create">
						{t('tryAgainPayment')}
					</Link>
				</Button>
				<Button
					variant="secondary"
					size="lg"
					asChild
				>
					<Link href="/">
						{t('createAnother')}
					</Link>
				</Button>
			</div>
		</div>
	)
}

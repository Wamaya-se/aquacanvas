import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { Mail, Clock } from 'lucide-react'
import { ContactForm } from '@/components/shared/contact-form'
import { getSiteUrl } from '@/lib/env'
import { buildMetadata } from '@/lib/metadata'

export async function generateMetadata(): Promise<Metadata> {
	const t = await getTranslations('contact')
	return buildMetadata({
		title: t('meta.title'),
		description: t('meta.description'),
		path: '/contact',
	})
}

export default async function ContactPage() {
	const t = await getTranslations('contact')
	const tBreadcrumbs = await getTranslations('breadcrumbs')

	const siteUrl = getSiteUrl()
	const breadcrumbJsonLd = {
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: [
			{
				'@type': 'ListItem',
				position: 1,
				name: tBreadcrumbs('home'),
				item: siteUrl,
			},
			{
				'@type': 'ListItem',
				position: 2,
				name: tBreadcrumbs('contact'),
				item: `${siteUrl}/contact`,
			},
		],
	}

	return (
		<>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
			/>

			{/* Hero */}
			<section className="bg-gradient-to-b from-hero-gradient-start via-hero-gradient-mid to-hero-gradient-end px-6 py-20 lg:py-28">
				<div className="mx-auto max-w-3xl text-center">
					<h1 className="font-heading text-4xl font-bold tracking-[-0.03em] text-foreground sm:text-5xl">
						{t('title')}
					</h1>
					<p className="mt-6 font-sans text-lg leading-[1.7] text-muted-foreground sm:text-xl">
						{t('subtitle')}
					</p>
				</div>
			</section>

			{/* Content */}
			<section className="bg-surface-container-low px-6 py-20 lg:py-24">
				<div className="mx-auto grid max-w-5xl grid-cols-1 gap-16 lg:grid-cols-5">
					{/* Form */}
					<div className="lg:col-span-3">
						<h2 className="mb-8 font-heading text-2xl font-bold tracking-[-0.03em] text-foreground">
							{t('formHeading')}
						</h2>
						<ContactForm />
					</div>

					{/* Info sidebar */}
					<div className="lg:col-span-2">
						<h2 className="mb-8 font-heading text-2xl font-bold tracking-[-0.03em] text-foreground">
							{t('infoHeading')}
						</h2>

						<div className="space-y-8">
							<div className="flex gap-4">
								<div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-surface-container-high">
									<Mail className="size-5 text-brand" aria-hidden="true" />
								</div>
								<div>
									<h3 className="font-heading text-sm font-semibold tracking-[-0.03em] text-foreground">
										{t('emailTitle')}
									</h3>
									<p className="mt-1 font-sans text-sm text-muted-foreground">
										{t('emailValue')}
									</p>
								</div>
							</div>

							<div className="flex gap-4">
								<div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-surface-container-high">
									<Clock className="size-5 text-brand" aria-hidden="true" />
								</div>
								<div>
									<h3 className="font-heading text-sm font-semibold tracking-[-0.03em] text-foreground">
										{t('responseTitle')}
									</h3>
									<p className="mt-1 font-sans text-sm text-muted-foreground">
										{t('responseValue')}
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>
		</>
	)
}

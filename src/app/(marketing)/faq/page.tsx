import type { Metadata } from 'next'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { Button } from '@/components/ui/button'
import { getSiteUrl } from '@/lib/env'
import { buildMetadata } from '@/lib/metadata'

export async function generateMetadata(): Promise<Metadata> {
	const t = await getTranslations('faq')
	return buildMetadata({
		title: t('meta.title'),
		description: t('meta.description'),
		path: '/faq',
	})
}

interface FaqItem {
	question: string
	answer: string
}

interface FaqSection {
	heading: string
	items: FaqItem[]
}

export default async function FaqPage() {
	const t = await getTranslations('faq')
	const tBreadcrumbs = await getTranslations('breadcrumbs')

	const sections: FaqSection[] = [
		{
			heading: t('generalHeading'),
			items: [
				{ question: t('q1'), answer: t('a1') },
				{ question: t('q2'), answer: t('a2') },
				{ question: t('q3'), answer: t('a3') },
			],
		},
		{
			heading: t('ordersHeading'),
			items: [
				{ question: t('q4'), answer: t('a4') },
				{ question: t('q5'), answer: t('a5') },
				{ question: t('q6'), answer: t('a6') },
			],
		},
		{
			heading: t('stylesHeading'),
			items: [
				{ question: t('q7'), answer: t('a7') },
				{ question: t('q8'), answer: t('a8') },
			],
		},
		{
			heading: t('privacyHeading'),
			items: [
				{ question: t('q9'), answer: t('a9') },
				{ question: t('q10'), answer: t('a10') },
			],
		},
	]

	const allFaqItems = sections.flatMap((s) => s.items)

	const faqJsonLd = {
		'@context': 'https://schema.org',
		'@type': 'FAQPage',
		mainEntity: allFaqItems.map((item) => ({
			'@type': 'Question',
			name: item.question,
			acceptedAnswer: {
				'@type': 'Answer',
				text: item.answer,
			},
		})),
	}

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
				name: tBreadcrumbs('faq'),
				item: `${siteUrl}/faq`,
			},
		],
	}

	return (
		<>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
			/>
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

			{/* FAQ Sections */}
			<section className="bg-surface-container-low px-6 py-20 lg:py-24">
				<div className="mx-auto max-w-2xl space-y-16">
					{sections.map((section) => (
						<div key={section.heading}>
							<h2 className="mb-6 font-heading text-xl font-bold tracking-[-0.03em] text-foreground sm:text-2xl">
								{section.heading}
							</h2>
							<div className="space-y-3">
								{section.items.map((item) => (
									<details
										key={item.question}
										className="group rounded-xl bg-surface-container p-0"
									>
										<summary className="flex cursor-pointer list-none items-center justify-between px-6 py-5 font-sans text-sm font-medium text-foreground [&::-webkit-details-marker]:hidden">
											{item.question}
											<span
												className="ml-4 shrink-0 text-muted-foreground motion-safe:transition-transform motion-safe:duration-200 group-open:rotate-45"
												aria-hidden="true"
											>
												+
											</span>
										</summary>
										<div className="px-6 pb-5 font-sans text-sm leading-[1.7] text-muted-foreground">
											{item.answer}
										</div>
									</details>
								))}
							</div>
						</div>
					))}
				</div>
			</section>

			{/* CTA */}
			<section className="bg-surface px-6 py-20 lg:py-24">
				<div className="mx-auto max-w-2xl text-center">
					<h2 className="font-heading text-2xl font-bold tracking-[-0.03em] text-foreground sm:text-3xl">
						{t('ctaHeading')}
					</h2>
					<p className="mt-4 font-sans text-base leading-[1.7] text-muted-foreground">
						{t('ctaText')}
					</p>
					<div className="mt-8">
						<Button variant="brand" size="lg" asChild>
							<Link href="/contact">{t('ctaButton')}</Link>
						</Button>
					</div>
				</div>
			</section>
		</>
	)
}

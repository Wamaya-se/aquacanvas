import type { Metadata } from 'next'
import { Link } from '@/i18n/navigation'
import { getTranslations } from 'next-intl/server'
import { Gem, Heart, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getSiteUrl } from '@/lib/env'
import { buildMetadata } from '@/lib/metadata'

export async function generateMetadata(): Promise<Metadata> {
	const t = await getTranslations('about')
	return buildMetadata({
		title: t('meta.title'),
		description: t('meta.description'),
		path: '/about',
	})
}

export default async function AboutPage() {
	const t = await getTranslations('about')
	const tBreadcrumbs = await getTranslations('breadcrumbs')

	const values = [
		{
			icon: Gem,
			title: t('value1Title'),
			text: t('value1Text'),
		},
		{
			icon: Heart,
			title: t('value2Title'),
			text: t('value2Text'),
		},
		{
			icon: ShieldCheck,
			title: t('value3Title'),
			text: t('value3Text'),
		},
	]

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
				name: tBreadcrumbs('about'),
				item: `${siteUrl}/about`,
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

			{/* Mission */}
			<section className="bg-surface-container-low px-6 py-20 lg:py-24">
				<div className="mx-auto max-w-2xl">
					<h2 className="font-heading text-2xl font-bold tracking-[-0.03em] text-foreground sm:text-3xl">
						{t('missionHeading')}
					</h2>
					<p className="mt-6 font-sans text-base leading-[1.7] text-muted-foreground">
						{t('missionText')}
					</p>
				</div>
			</section>

			{/* How We Do It */}
			<section className="bg-surface px-6 py-20 lg:py-24">
				<div className="mx-auto max-w-2xl">
					<h2 className="font-heading text-2xl font-bold tracking-[-0.03em] text-foreground sm:text-3xl">
						{t('howHeading')}
					</h2>
					<p className="mt-6 font-sans text-base leading-[1.7] text-muted-foreground">
						{t('howText')}
					</p>
				</div>
			</section>

			{/* Values */}
			<section className="bg-surface-container-low px-6 py-20 lg:py-24">
				<div className="mx-auto max-w-5xl">
					<h2 className="text-center font-heading text-2xl font-bold tracking-[-0.03em] text-foreground sm:text-3xl">
						{t('valuesHeading')}
					</h2>

					<div className="mt-16 grid grid-cols-1 gap-10 md:grid-cols-3">
						{values.map((v) => (
							<div key={v.title} className="flex flex-col items-center gap-4 text-center">
								<div className="flex size-14 items-center justify-center rounded-xl bg-surface-container-high">
									<v.icon className="size-6 text-brand" aria-hidden="true" />
								</div>
								<h3 className="font-heading text-lg font-semibold tracking-[-0.03em] text-foreground">
									{v.title}
								</h3>
								<p className="font-sans text-sm leading-[1.7] text-muted-foreground">
									{v.text}
								</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* CTA */}
			<section className="bg-surface px-6 py-20 lg:py-24">
				<div className="mx-auto max-w-2xl text-center">
					<h2 className="font-heading text-2xl font-bold tracking-[-0.03em] text-foreground sm:text-3xl">
						{t('ctaHeading')}
					</h2>
					<div className="mt-8">
						<Button variant="brand" size="lg" asChild>
							<Link href="/create">{t('ctaButton')}</Link>
						</Button>
					</div>
				</div>
			</section>
		</>
	)
}

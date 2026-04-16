import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { Button } from '@/components/ui/button'
import { BeforeAfterSlider } from '@/components/shared/before-after-slider'
import { getSiteUrl } from '@/lib/env'

export async function generateMetadata(): Promise<Metadata> {
	const t = await getTranslations('gallery')

	return {
		title: t('meta.title'),
		description: t('meta.description'),
		openGraph: {
			title: t('meta.title'),
			description: t('meta.description'),
			type: 'website',
			siteName: 'Aquacanvas',
		},
	}
}

interface GalleryItem {
	title: string
	description: string
	beforeSrc: string
	afterSrc: string
	color: string
}

export default async function GalleryPage() {
	const t = await getTranslations('gallery')
	const tHero = await getTranslations('hero')
	const tAlt = await getTranslations('alt')
	const tBreadcrumbs = await getTranslations('breadcrumbs')

	const examples: GalleryItem[] = [
		{
			title: t('example1Title'),
			description: t('example1Desc'),
			beforeSrc: '/images/hero-before.jpg',
			afterSrc: '/images/hero-after.png',
			color: '1a1e2a/5eb5c4',
		},
		{
			title: t('example2Title'),
			description: t('example2Desc'),
			beforeSrc: 'https://placehold.co/800x450/1a1e2a/8a8fa0?text=Original+Dog',
			afterSrc: 'https://placehold.co/800x450/1a1e2a/5eb5c4?text=Watercolor+Dog',
			color: '1a1e2a/5eb5c4',
		},
		{
			title: t('example3Title'),
			description: t('example3Desc'),
			beforeSrc: 'https://placehold.co/800x450/1a1e2a/8a8fa0?text=Original+Lake',
			afterSrc: 'https://placehold.co/800x450/1a1e2a/5eb5c4?text=Watercolor+Lake',
			color: '1a1e2a/5eb5c4',
		},
		{
			title: t('example4Title'),
			description: t('example4Desc'),
			beforeSrc: 'https://placehold.co/800x450/1a1e2a/8a8fa0?text=Original+City',
			afterSrc: 'https://placehold.co/800x450/1a1e2a/5eb5c4?text=Watercolor+City',
			color: '222736/5eb5c4',
		},
		{
			title: t('example5Title'),
			description: t('example5Desc'),
			beforeSrc: 'https://placehold.co/800x450/1a1e2a/8a8fa0?text=Original+Flowers',
			afterSrc: 'https://placehold.co/800x450/1a1e2a/5eb5c4?text=Watercolor+Flowers',
			color: '222736/5eb5c4',
		},
		{
			title: t('example6Title'),
			description: t('example6Desc'),
			beforeSrc: 'https://placehold.co/800x450/1a1e2a/8a8fa0?text=Original+Sunset',
			afterSrc: 'https://placehold.co/800x450/1a1e2a/5eb5c4?text=Watercolor+Sunset',
			color: '222736/5eb5c4',
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
				name: tBreadcrumbs('gallery'),
				item: `${siteUrl}/gallery`,
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

			{/* Featured — full-width slider */}
			<section className="bg-surface-container-low px-6 py-16 lg:py-24">
				<div className="mx-auto max-w-4xl">
					<BeforeAfterSlider
						beforeSrc={examples[0].beforeSrc}
						afterSrc={examples[0].afterSrc}
						beforeAlt={tAlt('galleryOriginal', { title: examples[0].title })}
						afterAlt={tAlt('galleryArtwork', { title: examples[0].title })}
						beforeLabel={tHero('beforeLabel')}
						afterLabel={tHero('afterLabel')}
						sliderAriaLabel={t('sliderAriaLabel')}
					/>
					<div className="mt-4 text-center">
						<p className="font-heading text-base font-semibold tracking-[-0.03em] text-foreground">
							{examples[0].title}
						</p>
						<p className="font-sans text-sm text-muted-foreground">
							{examples[0].description}
						</p>
					</div>
				</div>
			</section>

			{/* Grid — side-by-side examples */}
			<section className="bg-surface px-6 py-16 lg:py-24">
				<div className="mx-auto max-w-6xl">
					<div className="grid grid-cols-1 gap-10 md:grid-cols-2">
						{examples.slice(1).map((item) => (
							<div key={item.title}>
								<div className="grid grid-cols-2 gap-3">
									<div className="relative aspect-[16/9] overflow-hidden rounded-xl bg-surface-dim" style={{ boxShadow: '0 8px 40px oklch(0.2 0.02 260 / 0.06)' }}>
										<Image
											src={item.beforeSrc}
											alt={tAlt('galleryOriginal', { title: item.title })}
											fill
											sizes="(max-width: 768px) 50vw, 25vw"
											className="object-cover"
											unoptimized
										/>
										<span className="absolute bottom-2 left-2 rounded-md bg-surface/70 px-2 py-0.5 font-sans text-[10px] font-medium text-foreground backdrop-blur-sm">
											{t('beforeLabel')}
										</span>
									</div>
									<div className="relative aspect-[16/9] overflow-hidden rounded-xl bg-surface-dim" style={{ boxShadow: '0 8px 40px oklch(0.2 0.02 260 / 0.06)' }}>
										<Image
											src={item.afterSrc}
											alt={tAlt('galleryArtwork', { title: item.title })}
											fill
											sizes="(max-width: 768px) 50vw, 25vw"
											className="object-cover"
											unoptimized
										/>
										<span className="absolute bottom-2 left-2 rounded-md bg-surface/70 px-2 py-0.5 font-sans text-[10px] font-medium text-foreground backdrop-blur-sm">
											{t('afterLabel')}
										</span>
									</div>
								</div>
								<div className="mt-3">
									<p className="font-heading text-sm font-semibold tracking-[-0.03em] text-foreground">
										{item.title}
									</p>
									<p className="font-sans text-xs text-muted-foreground">
										{item.description}
									</p>
								</div>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* CTA */}
			<section className="bg-surface-container-low px-6 py-20 lg:py-24">
				<div className="mx-auto max-w-2xl text-center">
					<h2 className="font-heading text-2xl font-bold tracking-[-0.03em] text-foreground sm:text-3xl">
						{t('ctaHeading')}
					</h2>
					<p className="mt-4 font-sans text-base leading-[1.7] text-muted-foreground">
						{t('ctaText')}
					</p>
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

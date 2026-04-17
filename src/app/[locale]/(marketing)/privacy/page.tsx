import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { getSiteUrl } from '@/lib/env'
import { buildMetadata } from '@/lib/metadata'

export async function generateMetadata(): Promise<Metadata> {
	const t = await getTranslations('privacy')
	return buildMetadata({
		title: t('meta.title'),
		description: t('meta.description'),
		path: '/privacy',
	})
}

interface Section {
	heading: string
	paragraphs: string[]
	bullets?: string[]
}

export default async function PrivacyPage() {
	const t = await getTranslations('privacy')
	const siteUrl = getSiteUrl()

	const sections: Section[] = [
		{
			heading: t('introHeading'),
			paragraphs: [t('introP1'), t('introP2')],
		},
		{
			heading: t('dataWeCollectHeading'),
			paragraphs: [t('dataWeCollectIntro')],
			bullets: [
				t('dataBullet1'),
				t('dataBullet2'),
				t('dataBullet3'),
				t('dataBullet4'),
			],
		},
		{
			heading: t('legalBasisHeading'),
			paragraphs: [t('legalBasisP1')],
		},
		{
			heading: t('retentionHeading'),
			paragraphs: [t('retentionP1'), t('retentionP2')],
		},
		{
			heading: t('processorsHeading'),
			paragraphs: [t('processorsIntro')],
			bullets: [
				t('processor1'),
				t('processor2'),
				t('processor3'),
				t('processor4'),
				t('processor5'),
			],
		},
		{
			heading: t('rightsHeading'),
			paragraphs: [t('rightsIntro')],
			bullets: [
				t('right1'),
				t('right2'),
				t('right3'),
				t('right4'),
				t('right5'),
				t('right6'),
			],
		},
		{
			heading: t('deletionHeading'),
			paragraphs: [t('deletionP1'), t('deletionP2')],
		},
		{
			heading: t('securityHeading'),
			paragraphs: [t('securityP1')],
		},
		{
			heading: t('changesHeading'),
			paragraphs: [t('changesP1')],
		},
		{
			heading: t('contactHeading'),
			paragraphs: [t('contactP1')],
		},
	]

	const webPageJsonLd = {
		'@context': 'https://schema.org',
		'@type': 'WebPage',
		name: t('meta.title'),
		description: t('meta.description'),
		url: `${siteUrl}/privacy`,
	}

	const breadcrumbJsonLd = {
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: [
			{
				'@type': 'ListItem',
				position: 1,
				name: 'Home',
				item: siteUrl,
			},
			{
				'@type': 'ListItem',
				position: 2,
				name: t('meta.title'),
				item: `${siteUrl}/privacy`,
			},
		],
	}

	return (
		<>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }}
			/>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
			/>

			<section className="bg-gradient-to-b from-hero-gradient-start via-hero-gradient-mid to-hero-gradient-end px-6 py-20 lg:py-24">
				<div className="mx-auto max-w-3xl text-center">
					<h1 className="font-heading text-4xl font-bold tracking-[-0.03em] text-foreground sm:text-5xl">
						{t('title')}
					</h1>
					<p className="mt-4 font-sans text-sm text-muted-foreground">
						{t('lastUpdated')}
					</p>
					<p className="mt-6 font-sans text-lg leading-[1.7] text-muted-foreground sm:text-xl">
						{t('subtitle')}
					</p>
				</div>
			</section>

			<section className="bg-surface px-6 py-16 lg:py-20">
				<div className="mx-auto flex max-w-3xl flex-col gap-12">
					{sections.map((section) => (
						<div key={section.heading} className="flex flex-col gap-4">
							<h2 className="font-heading text-2xl font-bold tracking-[-0.03em] text-foreground sm:text-3xl">
								{section.heading}
							</h2>
							{section.paragraphs.map((paragraph, index) => (
								<p
									key={index}
									className="font-sans text-base leading-[1.7] text-muted-foreground"
								>
									{paragraph}
								</p>
							))}
							{section.bullets && (
								<ul className="flex flex-col gap-2 pl-5 font-sans text-base leading-[1.7] text-muted-foreground [list-style:disc]">
									{section.bullets.map((bullet, index) => (
										<li key={index}>{bullet}</li>
									))}
								</ul>
							)}
						</div>
					))}
				</div>
			</section>
		</>
	)
}

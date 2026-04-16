import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { getSiteUrl } from '@/lib/env'

export async function generateMetadata(): Promise<Metadata> {
	const t = await getTranslations('cookies')

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

interface CookieRow {
	name: string
	purpose: string
	duration: string
	category: string
}

export default async function CookiesPage() {
	const t = await getTranslations('cookies')
	const siteUrl = getSiteUrl()

	const cookies: CookieRow[] = [
		{
			name: 'sb-access-token',
			purpose: t('cookieSupabaseAccessPurpose'),
			duration: t('durationSession'),
			category: t('categoryEssential'),
		},
		{
			name: 'sb-refresh-token',
			purpose: t('cookieSupabaseRefreshPurpose'),
			duration: t('duration7Days'),
			category: t('categoryEssential'),
		},
		{
			name: 'theme',
			purpose: t('cookieThemePurpose'),
			duration: t('duration1Year'),
			category: t('categoryFunctional'),
		},
		{
			name: 'aquacanvas-test-mode',
			purpose: t('cookieTestModePurpose'),
			duration: t('duration30Days'),
			category: t('categoryAdmin'),
		},
		{
			name: 'aquacanvas-rate-limit-bypass',
			purpose: t('cookieRateLimitPurpose'),
			duration: t('duration30Days'),
			category: t('categoryAdmin'),
		},
	]

	const webPageJsonLd = {
		'@context': 'https://schema.org',
		'@type': 'WebPage',
		name: t('meta.title'),
		description: t('meta.description'),
		url: `${siteUrl}/cookies`,
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
				item: `${siteUrl}/cookies`,
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
					<div className="flex flex-col gap-4">
						<h2 className="font-heading text-2xl font-bold tracking-[-0.03em] text-foreground sm:text-3xl">
							{t('whatHeading')}
						</h2>
						<p className="font-sans text-base leading-[1.7] text-muted-foreground">
							{t('whatP1')}
						</p>
					</div>

					<div className="flex flex-col gap-4">
						<h2 className="font-heading text-2xl font-bold tracking-[-0.03em] text-foreground sm:text-3xl">
							{t('whyNoBannerHeading')}
						</h2>
						<p className="font-sans text-base leading-[1.7] text-muted-foreground">
							{t('whyNoBannerP1')}
						</p>
						<p className="font-sans text-base leading-[1.7] text-muted-foreground">
							{t('whyNoBannerP2')}
						</p>
					</div>

					<div className="flex flex-col gap-4">
						<h2 className="font-heading text-2xl font-bold tracking-[-0.03em] text-foreground sm:text-3xl">
							{t('cookiesWeSetHeading')}
						</h2>
						<p className="font-sans text-base leading-[1.7] text-muted-foreground">
							{t('cookiesWeSetIntro')}
						</p>
						<div className="overflow-x-auto rounded-xl border border-border">
							<table className="w-full text-left font-sans text-sm">
								<thead className="bg-surface-container-low">
									<tr>
										<th className="px-4 py-3 font-semibold text-foreground">
											{t('tableName')}
										</th>
										<th className="px-4 py-3 font-semibold text-foreground">
											{t('tablePurpose')}
										</th>
										<th className="px-4 py-3 font-semibold text-foreground">
											{t('tableDuration')}
										</th>
										<th className="px-4 py-3 font-semibold text-foreground">
											{t('tableCategory')}
										</th>
									</tr>
								</thead>
								<tbody>
									{cookies.map((cookie) => (
										<tr
											key={cookie.name}
											className="border-t border-border text-muted-foreground"
										>
											<td className="px-4 py-3 font-mono text-xs text-foreground">
												{cookie.name}
											</td>
											<td className="px-4 py-3 leading-[1.6]">{cookie.purpose}</td>
											<td className="px-4 py-3 whitespace-nowrap">
												{cookie.duration}
											</td>
											<td className="px-4 py-3 whitespace-nowrap">
												{cookie.category}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>

					<div className="flex flex-col gap-4">
						<h2 className="font-heading text-2xl font-bold tracking-[-0.03em] text-foreground sm:text-3xl">
							{t('thirdPartyHeading')}
						</h2>
						<p className="font-sans text-base leading-[1.7] text-muted-foreground">
							{t('thirdPartyP1')}
						</p>
					</div>

					<div className="flex flex-col gap-4">
						<h2 className="font-heading text-2xl font-bold tracking-[-0.03em] text-foreground sm:text-3xl">
							{t('manageHeading')}
						</h2>
						<p className="font-sans text-base leading-[1.7] text-muted-foreground">
							{t('manageP1')}
						</p>
						<p className="font-sans text-base leading-[1.7] text-muted-foreground">
							{t('manageP2')}
						</p>
					</div>

					<div className="flex flex-col gap-4">
						<h2 className="font-heading text-2xl font-bold tracking-[-0.03em] text-foreground sm:text-3xl">
							{t('changesHeading')}
						</h2>
						<p className="font-sans text-base leading-[1.7] text-muted-foreground">
							{t('changesP1')}
						</p>
					</div>

					<div className="flex flex-col gap-4">
						<h2 className="font-heading text-2xl font-bold tracking-[-0.03em] text-foreground sm:text-3xl">
							{t('contactHeading')}
						</h2>
						<p className="font-sans text-base leading-[1.7] text-muted-foreground">
							{t('contactP1')}
						</p>
					</div>
				</div>
			</section>
		</>
	)
}

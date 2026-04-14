import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { Upload, Palette, Sparkles, Star, ImageIcon, Users, Layers } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { BeforeAfterSlider } from '@/components/shared/before-after-slider'

export async function generateMetadata(): Promise<Metadata> {
	const t = await getTranslations('metadata')

	return {
		title: {
			absolute: t('homeTitle'),
		},
		description: t('homeDescription'),
		openGraph: {
			title: t('homeTitle'),
			description: t('homeDescription'),
			type: 'website',
			siteName: 'Aquacanvas',
		},
	}
}

export default async function HomePage() {
	const tHero = await getTranslations('hero')
	const tHow = await getTranslations('howItWorks')
	const tStyles = await getTranslations('styles')
	const tShowcase = await getTranslations('styleShowcase')
	const tCta = await getTranslations('cta')
	const tShop = await getTranslations('shop')
	const tProof = await getTranslations('socialProof')
	const tTest = await getTranslations('testimonials')
	const tFaq = await getTranslations('landingFaq')

	const steps = [
		{
			icon: Upload,
			title: tHow('step1Title'),
			description: tHow('step1Description'),
		},
		{
			icon: Palette,
			title: tHow('step2Title'),
			description: tHow('step2Description'),
		},
		{
			icon: Sparkles,
			title: tHow('step3Title'),
			description: tHow('step3Description'),
		},
	]

	const styles = [
		{
			name: tStyles('watercolor'),
			desc: tStyles('watercolorDesc'),
			slug: 'watercolor',
			active: true,
		},
		{
			name: tStyles('oilPainting'),
			desc: tStyles('oilPaintingDesc'),
			slug: 'oil-painting',
			active: false,
		},
		{
			name: tStyles('charcoalSketch'),
			desc: tStyles('charcoalSketchDesc'),
			slug: 'charcoal-sketch',
			active: false,
		},
		{
			name: tStyles('anime'),
			desc: tStyles('animeDesc'),
			slug: 'anime',
			active: false,
		},
		{
			name: tStyles('impressionism'),
			desc: tStyles('impressionismDesc'),
			slug: 'impressionism',
			active: false,
		},
	]

	const stats = [
		{ icon: ImageIcon, value: tProof('artworksCount'), label: tProof('artworksCreated') },
		{ icon: Users, value: tProof('customersCount'), label: tProof('happyCustomers') },
		{ icon: Layers, value: tProof('stylesCount'), label: tProof('artStyles') },
	]

	const testimonials = [
		{
			name: tTest('t1Name'),
			role: tTest('t1Role'),
			text: tTest('t1Text'),
			initials: 'EL',
		},
		{
			name: tTest('t2Name'),
			role: tTest('t2Role'),
			text: tTest('t2Text'),
			initials: 'MK',
		},
		{
			name: tTest('t3Name'),
			role: tTest('t3Role'),
			text: tTest('t3Text'),
			initials: 'SR',
		},
	]

	const faqItems = [
		{ question: tFaq('q1'), answer: tFaq('a1') },
		{ question: tFaq('q2'), answer: tFaq('a2') },
		{ question: tFaq('q3'), answer: tFaq('a3') },
		{ question: tFaq('q4'), answer: tFaq('a4') },
	]

	return (
		<>
			{/* ── Hero ── */}
			<section className="bg-gradient-to-b from-hero-gradient-start via-hero-gradient-mid to-hero-gradient-end px-6 py-16 lg:py-24">
				<div className="mx-auto max-w-6xl">
					<div className="flex flex-col items-center gap-12 md:flex-row md:items-center md:gap-12 lg:gap-16">
						<div className="flex max-w-xl flex-col items-center text-center md:shrink-0 md:basis-[360px] md:items-start md:text-left lg:basis-[440px]">
							<h1 className="font-heading text-4xl font-bold tracking-[-0.03em] text-foreground sm:text-5xl lg:text-6xl">
								{tHero('title')}
							</h1>
							<p className="mt-6 font-sans text-lg leading-[1.7] text-muted-foreground sm:text-xl">
								{tHero('subtitle')}
							</p>
							<div className="mt-10 flex flex-wrap items-center gap-4">
								<Button variant="brand" size="lg" asChild>
									<Link href="/create">{tHero('cta')}</Link>
								</Button>
								<Button variant="ghost" size="lg" asChild>
									<Link href="#styles">{tHero('secondaryCta')}</Link>
								</Button>
							</div>
						</div>

						<div className="w-full md:flex-1">
							<BeforeAfterSlider
								beforeSrc="/images/hero-before.jpg"
								afterSrc="/images/hero-after.png"
								beforeAlt="Original photo of a cabin in the snow"
								afterAlt="AI-generated watercolor artwork of the cabin on a canvas print"
								beforeLabel={tHero('beforeLabel')}
								afterLabel={tHero('afterLabel')}
								sliderAriaLabel={tHero('sliderAriaLabel')}
							/>
						</div>
					</div>
				</div>
			</section>

			{/* ── Social Proof Stats ── */}
			<section className="bg-surface-container px-6 py-12">
				<div className="mx-auto grid max-w-4xl grid-cols-1 gap-8 sm:grid-cols-3">
					{stats.map((stat) => (
						<div key={stat.label} className="flex flex-col items-center gap-2 text-center">
							<div className="flex size-10 items-center justify-center rounded-lg bg-surface-container-high">
								<stat.icon className="size-5 text-brand" aria-hidden="true" />
							</div>
							<span className="font-heading text-2xl font-bold tracking-[-0.03em] text-foreground sm:text-3xl">
								{stat.value}
							</span>
							<span className="font-sans text-sm text-muted-foreground">
								{stat.label}
							</span>
						</div>
					))}
				</div>
			</section>

			{/* ── How It Works ── */}
			<section className="bg-surface-container-low px-6 py-24">
				<div className="mx-auto max-w-5xl">
					<h2 className="text-center font-heading text-3xl font-bold tracking-[-0.03em] text-foreground sm:text-4xl">
						{tHow('heading')}
					</h2>

					<div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
						{steps.map((step, i) => (
							<div
								key={i}
								className="flex flex-col items-center gap-4 text-center"
							>
								<div className="flex size-14 items-center justify-center rounded-xl bg-surface-container-high">
									<step.icon className="size-6 text-brand" aria-hidden="true" />
								</div>
								<span className="font-sans text-xs font-medium uppercase tracking-widest text-muted-foreground">
									{tHow('stepLabel', { number: i + 1 })}
								</span>
								<h3 className="font-heading text-lg font-semibold tracking-[-0.03em] text-foreground">
									{step.title}
								</h3>
								<p className="font-sans text-sm leading-[1.7] text-muted-foreground">
									{step.description}
								</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* ── Style Showcase ── */}
			<section id="styles" className="bg-surface px-6 py-24">
				<div className="mx-auto max-w-6xl">
					<div className="text-center">
						<h2 className="font-heading text-3xl font-bold tracking-[-0.03em] text-foreground sm:text-4xl">
							{tShowcase('heading')}
						</h2>
						<p className="mt-4 font-sans text-lg leading-[1.7] text-muted-foreground">
							{tShowcase('subtext')}
						</p>
					</div>

					<div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
						{styles.map((style) => (
							<Card key={style.slug} className="group overflow-hidden">
								<div className="relative aspect-[4/3] overflow-hidden">
									<Image
										src={`https://placehold.co/400x300/${style.active ? '1a1e2a/5eb5c4' : '222736/8a8fa0'}?text=${encodeURIComponent(style.name)}`}
										alt={style.name}
										width={400}
										height={300}
										unoptimized
										className="h-full w-full object-cover motion-safe:transition-transform motion-safe:group-hover:scale-[1.03]"
									/>
									{!style.active && (
										<div className="absolute inset-0 flex items-center justify-center bg-surface/60">
											<span className="rounded-lg bg-surface-container-highest px-3 py-1 font-sans text-xs font-medium text-muted-foreground">
												{tShop('comingSoon')}
											</span>
										</div>
									)}
								</div>
								<CardContent className="pt-4">
									<h3 className="font-heading text-base font-semibold tracking-[-0.03em] text-foreground">
										{style.name}
									</h3>
									<p className="mt-1 font-sans text-sm leading-[1.7] text-muted-foreground">
										{style.desc}
									</p>
								</CardContent>
							</Card>
						))}
					</div>
				</div>
			</section>

			{/* ── Testimonials ── */}
			<section className="bg-surface-container-low px-6 py-24">
				<div className="mx-auto max-w-5xl">
					<div className="text-center">
						<h2 className="font-heading text-3xl font-bold tracking-[-0.03em] text-foreground sm:text-4xl">
							{tTest('heading')}
						</h2>
						<p className="mt-4 font-sans text-lg leading-[1.7] text-muted-foreground">
							{tTest('subtext')}
						</p>
					</div>

					<div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-3">
						{testimonials.map((t) => (
							<Card key={t.name} className="flex flex-col justify-between">
								<CardContent className="pt-0">
									<div className="mb-4 flex gap-0.5" aria-label="5 out of 5 stars">
										{Array.from({ length: 5 }).map((_, i) => (
											<Star
												key={i}
												className="size-4 fill-brand text-brand"
												aria-hidden="true"
											/>
										))}
									</div>
									<p className="font-sans text-sm leading-[1.7] text-muted-foreground">
										&ldquo;{t.text}&rdquo;
									</p>
								</CardContent>
								<CardContent className="pt-0">
									<div className="flex items-center gap-3">
										<Avatar size="lg">
											<AvatarFallback className="bg-surface-container-highest font-heading text-xs font-semibold text-brand">
												{t.initials}
											</AvatarFallback>
										</Avatar>
										<div>
											<p className="font-heading text-sm font-semibold tracking-[-0.03em] text-foreground">
												{t.name}
											</p>
											<p className="font-sans text-xs text-muted-foreground">
												{t.role}
											</p>
										</div>
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				</div>
			</section>

			{/* ── Landing FAQ ── */}
			<section className="bg-surface px-6 py-24">
				<div className="mx-auto max-w-2xl">
					<h2 className="mb-10 text-center font-heading text-3xl font-bold tracking-[-0.03em] text-foreground sm:text-4xl">
						{tFaq('heading')}
					</h2>
					<div className="space-y-3">
						{faqItems.map((item) => (
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
					<div className="mt-8 text-center">
						<Button variant="ghost" asChild>
							<Link href="/faq">{tFaq('viewAllFaq')}</Link>
						</Button>
					</div>
				</div>
			</section>

			{/* ── Final CTA ── */}
			<section className="bg-surface-container-low px-6 py-24">
				<div className="mx-auto max-w-2xl text-center">
					<h2 className="font-heading text-3xl font-bold tracking-[-0.03em] text-foreground sm:text-4xl">
						{tCta('heading')}
					</h2>
					<p className="mt-4 font-sans text-lg leading-[1.7] text-muted-foreground">
						{tCta('subtext')}
					</p>
					<div className="mt-10">
						<Button variant="brand" size="lg" asChild>
							<Link href="/create">{tCta('button')}</Link>
						</Button>
					</div>
				</div>
			</section>

			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{
					__html: JSON.stringify({
						'@context': 'https://schema.org',
						'@type': 'Organization',
						name: 'Aquacanvas',
						url: 'https://aquacanvas.com',
						description: tHero('subtitle'),
						contactPoint: {
							'@type': 'ContactPoint',
							contactType: 'customer support',
							email: 'hello@aquacanvas.com',
						},
					}),
				}}
			/>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{
					__html: JSON.stringify({
						'@context': 'https://schema.org',
						'@type': 'WebApplication',
						name: 'Aquacanvas',
						description: tHero('subtitle'),
						applicationCategory: 'DesignApplication',
						offers: {
							'@type': 'Offer',
							price: '0',
							priceCurrency: 'SEK',
						},
						provider: {
							'@type': 'Organization',
							name: 'Aquacanvas',
						},
					}),
				}}
			/>
		</>
	)
}

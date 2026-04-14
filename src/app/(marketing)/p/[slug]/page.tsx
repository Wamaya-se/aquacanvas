import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { BeforeAfterSlider } from '@/components/shared/before-after-slider'
import { CreateFlow } from '@/components/shop/create-flow'
import type { StyleOption } from '@/components/shop/style-picker'
import type { FormatOption } from '@/components/shop/format-picker'

interface ProductPageProps {
	params: Promise<{ slug: string }>
}

async function getProduct(slug: string) {
	const supabase = await createClient()
	const { data, error } = await supabase
		.from('products')
		.select('*, styles(id, name, slug, description, thumbnail_url, is_active, price_cents)')
		.eq('slug', slug)
		.eq('is_active', true)
		.single()

	if (error || !data) return null
	return data
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
	const { slug } = await params
	const product = await getProduct(slug)
	const t = await getTranslations('productPage')

	if (!product) {
		const tErrors = await getTranslations('errors')
		return { title: tErrors('notFound') }
	}

	const title = product.seo_title || t('defaultMetaTitle', { name: product.name })
	const description = product.seo_description || t('defaultMetaDescription', { name: product.name.toLowerCase() })

	return {
		title,
		description,
		openGraph: {
			title,
			description,
			...(product.hero_image_url ? { images: [{ url: product.hero_image_url }] } : {}),
		},
	}
}

export default async function ProductPage({ params }: ProductPageProps) {
	const { slug } = await params
	const product = await getProduct(slug)
	const t = await getTranslations('productPage')
	const tHero = await getTranslations('hero')

	if (!product) notFound()

	const style = product.styles as {
		id: string
		name: string
		slug: string
		description: string | null
		thumbnail_url: string | null
		is_active: boolean
		price_cents: number
	} | null
	const price = product.price_cents ?? style?.price_cents ?? 34900
	const priceFormatted = (price / 100).toFixed(0)

	const styles: StyleOption[] = style ? [{
		id: style.id,
		slug: style.slug,
		name: style.name,
		description: style.description,
		thumbnailUrl: style.thumbnail_url,
		isActive: style.is_active,
		priceCents: style.price_cents,
	}] : []

	const supabaseFormats = await createClient()
	const { data: dbFormats } = await supabaseFormats
		.from('print_formats')
		.select('id, name, slug, description, format_type, width_cm, height_cm, price_cents')
		.eq('is_active', true)
		.order('sort_order', { ascending: true })

	const formats: FormatOption[] = (dbFormats ?? []).map((f) => ({
		id: f.id,
		name: f.name,
		slug: f.slug,
		description: f.description,
		formatType: f.format_type,
		widthCm: f.width_cm,
		heightCm: f.height_cm,
		priceCents: f.price_cents,
	}))

	const faq = (product.faq ?? []) as { question: string; answer: string }[]

	const breadcrumbJsonLd = {
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: [
			{
				'@type': 'ListItem',
				position: 1,
				name: 'Home',
				item: 'https://aquacanvas.com',
			},
			{
				'@type': 'ListItem',
				position: 2,
				name: product.name,
				item: `https://aquacanvas.com/p/${slug}`,
			},
		],
	}

	const jsonLd = {
		'@context': 'https://schema.org',
		'@type': 'Product',
		name: product.headline,
		description: product.description ?? product.headline,
		image: product.hero_image_url ?? undefined,
		offers: {
			'@type': 'Offer',
			price: (price / 100).toFixed(2),
			priceCurrency: 'SEK',
			availability: 'https://schema.org/InStock',
		},
	}

	const faqJsonLd = faq.length > 0 ? {
		'@context': 'https://schema.org',
		'@type': 'FAQPage',
		mainEntity: faq.map((item) => ({
			'@type': 'Question',
			name: item.question,
			acceptedAnswer: {
				'@type': 'Answer',
				text: item.answer,
			},
		})),
	} : null

	return (
		<>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
			/>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
			/>
			{faqJsonLd && (
				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
				/>
			)}

			<section className="relative overflow-hidden bg-gradient-to-b from-hero-gradient-start via-hero-gradient-mid to-hero-gradient-end px-6 py-20 lg:py-32">
				<div className="mx-auto max-w-5xl text-center">
					<h1 className="mb-6 font-heading text-4xl font-bold tracking-[-0.03em] text-foreground sm:text-5xl lg:text-6xl">
						{product.headline}
					</h1>

					{product.description && (
						<p className="mx-auto mb-8 max-w-2xl font-sans text-base leading-[1.7] text-muted-foreground sm:text-lg">
							{product.description}
						</p>
					)}

					<p className="font-sans text-sm text-muted-foreground">
						{t('startFrom', { price: priceFormatted })}
					</p>

					{style && (
						<p className="mt-2 font-sans text-xs text-muted-foreground">
							{t('poweredBy', { style: style.name })}
						</p>
					)}

					{product.hero_image_url && (
						<div className="relative mx-auto mt-12 aspect-[16/9] max-w-3xl overflow-hidden rounded-xl" style={{ boxShadow: '0 8px 40px oklch(0.2 0.02 260 / 0.06)' }}>
							<Image
								src={product.hero_image_url}
								alt={product.name}
								fill
								sizes="(max-width: 768px) 100vw, 768px"
								className="object-cover"
								unoptimized
								priority
							/>
						</div>
					)}
				</div>
			</section>

			{product.example_before && product.example_after && (
				<section className="bg-surface-container-low px-6 py-16 lg:py-24">
					<div className="mx-auto max-w-3xl">
						<BeforeAfterSlider
							beforeSrc={product.example_before}
							afterSrc={product.example_after}
							beforeAlt={`${product.name} — original photo`}
							afterAlt={`${product.name} — AI-generated artwork`}
							beforeLabel={tHero('beforeLabel')}
							afterLabel={tHero('afterLabel')}
							sliderAriaLabel={tHero('sliderAriaLabel')}
						/>
					</div>
				</section>
			)}

			{product.body && (
				<section className="bg-surface px-6 py-16 lg:py-24">
					<div className="prose prose-invert mx-auto max-w-2xl font-sans text-base leading-[1.7] text-muted-foreground">
						{product.body.split('\n\n').map((paragraph, i) => (
							<p key={i}>{paragraph}</p>
						))}
					</div>
				</section>
			)}

			{faq.length > 0 && (
				<section className="bg-surface-container-low px-6 py-16 lg:py-24">
					<div className="mx-auto max-w-2xl">
						<h2 className="mb-10 text-center font-heading text-2xl font-bold tracking-[-0.03em] text-foreground sm:text-3xl">
							{t('faqHeading')}
						</h2>
						<div className="space-y-4">
							{faq.map((item, i) => (
								<details
									key={i}
									className="group rounded-xl bg-surface-container p-0"
								>
									<summary className="flex cursor-pointer list-none items-center justify-between px-6 py-5 font-sans text-sm font-medium text-foreground [&::-webkit-details-marker]:hidden">
										{item.question}
										<span className="ml-4 shrink-0 text-muted-foreground motion-safe:transition-transform motion-safe:duration-200 group-open:rotate-45" aria-hidden="true">
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
				</section>
			)}

			{style && (
				<section className="bg-surface px-6 py-16 lg:py-24">
					<div className="mx-auto max-w-3xl">
						<h2 className="mb-3 text-center font-heading text-2xl font-bold tracking-[-0.03em] text-foreground sm:text-3xl">
							{t('createSection')}
						</h2>
						<p className="mb-10 text-center font-sans text-base leading-[1.7] text-muted-foreground">
							{t('createDescription')}
						</p>
						<CreateFlow styles={styles} formats={formats} lockedStyleId={style.id} />
					</div>
				</section>
			)}
		</>
	)
}

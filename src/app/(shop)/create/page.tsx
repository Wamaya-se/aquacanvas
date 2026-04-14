import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { CreateFlow } from '@/components/shop/create-flow'
import type { StyleOption } from '@/components/shop/style-picker'
import type { FormatOption } from '@/components/shop/format-picker'

export async function generateMetadata(): Promise<Metadata> {
	const t = await getTranslations('shop.meta')

	return {
		title: t('title'),
		description: t('description'),
		openGraph: {
			title: t('title'),
			description: t('description'),
			type: 'website',
			siteName: 'Aquacanvas',
		},
	}
}

export default async function CreatePage() {
	const t = await getTranslations('shop')
	const supabase = await createClient()

	const [{ data: dbStyles }, { data: dbFormats }] = await Promise.all([
		supabase
			.from('styles')
			.select('id, name, slug, description, thumbnail_url, is_active, price_cents')
			.order('sort_order', { ascending: true }),
		supabase
			.from('print_formats')
			.select('id, name, slug, description, format_type, width_cm, height_cm, price_cents')
			.eq('is_active', true)
			.order('sort_order', { ascending: true }),
	])

	const styles: StyleOption[] = (dbStyles ?? []).map((s) => ({
		id: s.id,
		slug: s.slug,
		name: s.name,
		description: s.description,
		thumbnailUrl: s.thumbnail_url,
		isActive: s.is_active,
		priceCents: s.price_cents,
	}))

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

	return (
		<div className="mx-auto max-w-5xl px-6 py-12 lg:py-16">
			<h1 className="mb-10 font-heading text-3xl font-bold tracking-[-0.03em] text-foreground sm:text-4xl">
				{t('createHeading')}
			</h1>
			<CreateFlow styles={styles} formats={formats} />
		</div>
	)
}

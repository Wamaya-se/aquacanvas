import type { MetadataRoute } from 'next'
import { createAdminClient } from '@/lib/supabase/admin'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const baseUrl =
		process.env.NEXT_PUBLIC_SITE_URL ?? 'https://aquacanvas.com'

	const adminDb = createAdminClient()
	const { data: products } = await adminDb
		.from('products')
		.select('slug, updated_at')
		.eq('is_active', true)

	const staticRoutes: MetadataRoute.Sitemap = [
		{
			url: baseUrl,
			lastModified: new Date(),
			changeFrequency: 'weekly',
			priority: 1,
		},
		{
			url: `${baseUrl}/create`,
			lastModified: new Date(),
			changeFrequency: 'monthly',
			priority: 0.8,
		},
		{
			url: `${baseUrl}/gallery`,
			lastModified: new Date(),
			changeFrequency: 'weekly',
			priority: 0.7,
		},
		{
			url: `${baseUrl}/about`,
			lastModified: new Date(),
			changeFrequency: 'monthly',
			priority: 0.6,
		},
		{
			url: `${baseUrl}/faq`,
			lastModified: new Date(),
			changeFrequency: 'monthly',
			priority: 0.6,
		},
		{
			url: `${baseUrl}/contact`,
			lastModified: new Date(),
			changeFrequency: 'monthly',
			priority: 0.5,
		},
	]

	const productRoutes: MetadataRoute.Sitemap = (products ?? []).map((p) => ({
		url: `${baseUrl}/p/${p.slug}`,
		lastModified: new Date(p.updated_at),
		changeFrequency: 'weekly' as const,
		priority: 0.9,
	}))

	return [...staticRoutes, ...productRoutes]
}

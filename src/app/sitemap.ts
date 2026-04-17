import type { MetadataRoute } from 'next'
import { createAdminClient } from '@/lib/supabase/admin'
import { getSiteUrl } from '@/lib/env'
import { routing } from '@/i18n/routing'

function localizedUrl(baseUrl: string, locale: string, path: string) {
	const normalized = path.startsWith('/') ? path : `/${path}`
	if (locale === routing.defaultLocale) {
		return normalized === '/' ? baseUrl : `${baseUrl}${normalized}`
	}
	if (normalized === '/') return `${baseUrl}/${locale}`
	return `${baseUrl}/${locale}${normalized}`
}

function entry(
	baseUrl: string,
	path: string,
	lastModified: Date,
	changeFrequency: 'yearly' | 'monthly' | 'weekly' | 'daily',
	priority: number,
): MetadataRoute.Sitemap[number] {
	const languages: Record<string, string> = {}
	for (const locale of routing.locales) {
		languages[locale] = localizedUrl(baseUrl, locale, path)
	}

	return {
		url: localizedUrl(baseUrl, routing.defaultLocale, path),
		lastModified,
		changeFrequency,
		priority,
		alternates: { languages },
	}
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const baseUrl = getSiteUrl()
	const now = new Date()

	const adminDb = createAdminClient()
	const { data: products } = await adminDb
		.from('products')
		.select('slug, updated_at')
		.eq('is_active', true)

	const staticRoutes: MetadataRoute.Sitemap = [
		entry(baseUrl, '/', now, 'weekly', 1),
		entry(baseUrl, '/create', now, 'monthly', 0.8),
		entry(baseUrl, '/gallery', now, 'weekly', 0.7),
		entry(baseUrl, '/about', now, 'monthly', 0.6),
		entry(baseUrl, '/faq', now, 'monthly', 0.6),
		entry(baseUrl, '/contact', now, 'monthly', 0.5),
		entry(baseUrl, '/privacy', now, 'yearly', 0.3),
		entry(baseUrl, '/terms', now, 'yearly', 0.3),
		entry(baseUrl, '/cookies', now, 'yearly', 0.3),
	]

	const productRoutes: MetadataRoute.Sitemap = (products ?? []).map((p) =>
		entry(baseUrl, `/p/${p.slug}`, new Date(p.updated_at), 'weekly', 0.9),
	)

	return [...staticRoutes, ...productRoutes]
}

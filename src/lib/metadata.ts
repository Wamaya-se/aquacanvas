import type { Metadata } from 'next'
import { getLocale } from 'next-intl/server'
import { routing } from '@/i18n/routing'

export interface BuildMetadataOptions {
	title: string
	description: string
	/**
	 * Path without any locale prefix. hreflang alternates are built
	 * automatically from the routing config.
	 */
	path: string
	/**
	 * Locale this page is rendered in. Used to set the canonical URL's
	 * locale prefix. If omitted, defaults to the project's default locale.
	 */
	locale?: string
	/**
	 * Explicit image URLs. When omitted, Next.js automatically picks up the
	 * nearest `opengraph-image.tsx` from the route tree (handled by the
	 * framework — don't repeat it here).
	 */
	images?: string[]
	absoluteTitle?: boolean
	noIndex?: boolean
	ogType?: 'website' | 'article'
}

function localePath(locale: string, path: string) {
	const normalized = path.startsWith('/') ? path : `/${path}`
	if (locale === routing.defaultLocale) {
		// `localePrefix: 'as-needed'` — default locale has no prefix.
		return normalized === '/' ? '/' : normalized
	}
	if (normalized === '/') return `/${locale}`
	return `/${locale}${normalized}`
}

export async function buildMetadata({
	title,
	description,
	path,
	locale,
	images,
	absoluteTitle,
	noIndex,
	ogType = 'website',
}: BuildMetadataOptions): Promise<Metadata> {
	const titleField = absoluteTitle ? { absolute: title } : title
	const explicitImages = images && images.length > 0 ? images : undefined
	const activeLocale = locale ?? (await getLocale())

	const languages: Record<string, string> = {}
	for (const loc of routing.locales) {
		languages[loc] = localePath(loc, path)
	}
	languages['x-default'] = localePath(routing.defaultLocale, path)

	const canonical = localePath(activeLocale, path)

	return {
		title: titleField,
		description,
		alternates: {
			canonical,
			languages,
		},
		openGraph: {
			title,
			description,
			type: ogType,
			siteName: 'Aquacanvas',
			url: canonical,
			locale: activeLocale,
			alternateLocale: routing.locales.filter((l) => l !== activeLocale),
			...(explicitImages
				? { images: explicitImages.map((url) => ({ url })) }
				: {}),
		},
		twitter: {
			card: 'summary_large_image',
			title,
			description,
			...(explicitImages ? { images: explicitImages } : {}),
		},
		...(noIndex
			? { robots: { index: false, follow: false } }
			: {}),
	}
}

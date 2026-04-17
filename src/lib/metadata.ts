import type { Metadata } from 'next'

export interface BuildMetadataOptions {
	title: string
	description: string
	path: string
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

export function buildMetadata({
	title,
	description,
	path,
	images,
	absoluteTitle,
	noIndex,
	ogType = 'website',
}: BuildMetadataOptions): Metadata {
	const titleField = absoluteTitle ? { absolute: title } : title
	const explicitImages = images && images.length > 0 ? images : undefined

	return {
		title: titleField,
		description,
		alternates: {
			canonical: path,
		},
		openGraph: {
			title,
			description,
			type: ogType,
			siteName: 'Aquacanvas',
			url: path,
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

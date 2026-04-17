import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
	locales: ['sv', 'en'],
	defaultLocale: 'sv',
	localePrefix: 'as-needed',
	// URL-prefixet är sanningskällan. Utan detta skulle en kvarhängande
	// `NEXT_LOCALE=en`-cookie tvinga middleware att omdirigera
	// `/gallery` → `/en/gallery` och bryta språkväxlaren.
	localeDetection: false,
	localeCookie: {
		name: 'NEXT_LOCALE',
		maxAge: 60 * 60 * 24 * 365,
	},
})

export type Locale = (typeof routing.locales)[number]

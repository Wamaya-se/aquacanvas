import { hasLocale } from 'next-intl'
import { getRequestConfig } from 'next-intl/server'
import { headers } from 'next/headers'
import { routing, type Locale } from './routing'

async function loadMessages(locale: Locale) {
	return (await import(`../../messages/${locale}.json`)).default
}

export default getRequestConfig(async ({ requestLocale }) => {
	// Honor explicit locale first — this is what `getTranslations({ locale })`
	// uses to force a specific language (e.g. from admin actions or webhooks
	// when rendering localized emails for a customer's saved locale).
	const requested = await requestLocale
	if (hasLocale(routing.locales, requested)) {
		return {
			locale: requested,
			messages: await loadMessages(requested),
		}
	}

	// Admin UI is English-only.
	const headerList = await headers()
	const pathname = headerList.get('x-pathname') ?? ''
	if (pathname.startsWith('/admin')) {
		return {
			locale: 'en' satisfies Locale,
			messages: await loadMessages('en'),
		}
	}

	return {
		locale: routing.defaultLocale,
		messages: await loadMessages(routing.defaultLocale),
	}
})

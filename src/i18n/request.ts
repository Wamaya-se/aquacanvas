import { hasLocale } from 'next-intl'
import { getRequestConfig } from 'next-intl/server'
import { headers } from 'next/headers'
import { routing, type Locale } from './routing'

async function loadMessages(locale: Locale) {
	return (await import(`../../messages/${locale}.json`)).default
}

export default getRequestConfig(async ({ requestLocale }) => {
	const headerList = await headers()
	const pathname = headerList.get('x-pathname') ?? ''

	if (pathname.startsWith('/admin')) {
		return {
			locale: 'en' satisfies Locale,
			messages: await loadMessages('en'),
		}
	}

	const requested = await requestLocale
	const locale = hasLocale(routing.locales, requested)
		? requested
		: routing.defaultLocale

	return {
		locale,
		messages: await loadMessages(locale),
	}
})

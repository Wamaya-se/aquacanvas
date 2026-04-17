import { notFound } from 'next/navigation'
import { hasLocale, NextIntlClientProvider } from 'next-intl'
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server'
import { routing } from '@/i18n/routing'
import type { ReactNode } from 'react'

export function generateStaticParams() {
	return routing.locales.map((locale) => ({ locale }))
}

interface LocaleLayoutProps {
	children: ReactNode
	params: Promise<{ locale: string }>
}

export default async function LocaleLayout({
	children,
	params,
}: LocaleLayoutProps) {
	const { locale } = await params

	if (!hasLocale(routing.locales, locale)) {
		notFound()
	}

	setRequestLocale(locale)

	const messages = await getMessages()
	const t = await getTranslations('common')

	return (
		<NextIntlClientProvider locale={locale} messages={messages}>
			<a href="#main-content" className="skip-to-content">
				{t('skipToContent')}
			</a>
			{children}
		</NextIntlClientProvider>
	)
}

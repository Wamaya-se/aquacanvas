import type { Metadata } from 'next'
import { EB_Garamond, Figtree } from 'next/font/google'
import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getMessages, getTranslations } from 'next-intl/server'
import { ThemeProvider } from '@/components/providers/theme-provider'
import './globals.css'

const ebGaramond = EB_Garamond({
	variable: '--font-eb-garamond',
	subsets: ['latin'],
	display: 'swap',
})

const figtree = Figtree({
	variable: '--font-figtree',
	subsets: ['latin'],
	display: 'swap',
})

export async function generateMetadata(): Promise<Metadata> {
	const t = await getTranslations('metadata')

	return {
		title: {
			default: t('homeTitle'),
			template: '%s — Aquacanvas',
		},
		description: t('homeDescription'),
		openGraph: {
			title: t('homeTitle'),
			description: t('homeDescription'),
			type: 'website',
			siteName: 'Aquacanvas',
		},
	}
}

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	const locale = await getLocale()
	const messages = await getMessages()
	const t = await getTranslations('common')

	return (
		<html
			lang={locale}
			className={`${ebGaramond.variable} ${figtree.variable}`}
			suppressHydrationWarning
		>
			<body className="min-h-dvh bg-surface text-foreground font-sans antialiased">
				<ThemeProvider>
					<NextIntlClientProvider messages={messages}>
						<a href="#main-content" className="skip-to-content">
							{t('skipToContent')}
						</a>
						{children}
					</NextIntlClientProvider>
				</ThemeProvider>
			</body>
		</html>
	)
}

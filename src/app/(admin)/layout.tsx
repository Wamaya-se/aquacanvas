import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getMessages } from 'next-intl/server'
import { AdminLayoutShell } from '@/components/admin/admin-layout-shell'
import type { ReactNode } from 'react'

interface AdminLayoutProps {
	children: ReactNode
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
	// Admin UI är engelska — `src/i18n/request.ts` tvingar locale='en'
	// för alla `/admin/*`-paths via x-pathname-headern.
	const locale = await getLocale()
	const messages = await getMessages()

	return (
		<NextIntlClientProvider locale={locale} messages={messages}>
			<AdminLayoutShell>{children}</AdminLayoutShell>
		</NextIntlClientProvider>
	)
}

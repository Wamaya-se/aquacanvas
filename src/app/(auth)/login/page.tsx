import type { Metadata } from 'next'
import { Suspense } from 'react'
import { getTranslations } from 'next-intl/server'
import { LoginForm } from '@/components/auth/login-form'
import { buildMetadata } from '@/lib/metadata'

export async function generateMetadata(): Promise<Metadata> {
	const t = await getTranslations('metadata')
	return buildMetadata({
		title: t('loginTitle'),
		description: t('homeDescription'),
		path: '/login',
		absoluteTitle: true,
		noIndex: true,
	})
}

export default async function LoginPage() {
	const t = await getTranslations('auth')

	return (
		<>
			<h1 className="sr-only">{t('loginTitle')}</h1>
			<Suspense>
				<LoginForm />
			</Suspense>
		</>
	)
}

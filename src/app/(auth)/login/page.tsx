import type { Metadata } from 'next'
import { Suspense } from 'react'
import { getTranslations } from 'next-intl/server'
import { LoginForm } from '@/components/auth/login-form'

export async function generateMetadata(): Promise<Metadata> {
	const t = await getTranslations('metadata')

	return {
		title: t('loginTitle'),
	}
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

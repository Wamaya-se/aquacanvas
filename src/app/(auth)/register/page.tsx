import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { RegisterForm } from '@/components/auth/register-form'
import { buildMetadata } from '@/lib/metadata'

export async function generateMetadata(): Promise<Metadata> {
	const t = await getTranslations('metadata')
	return buildMetadata({
		title: t('registerTitle'),
		description: t('homeDescription'),
		path: '/register',
		absoluteTitle: true,
		noIndex: true,
	})
}

export default async function RegisterPage() {
	const t = await getTranslations('auth')

	return (
		<>
			<h1 className="sr-only">{t('registerTitle')}</h1>
			<RegisterForm />
		</>
	)
}

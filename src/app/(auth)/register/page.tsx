import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { RegisterForm } from '@/components/auth/register-form'

export async function generateMetadata(): Promise<Metadata> {
	const t = await getTranslations('metadata')

	return {
		title: t('registerTitle'),
	}
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

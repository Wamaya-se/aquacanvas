import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { RegisterForm } from '@/components/auth/register-form'

export async function generateMetadata(): Promise<Metadata> {
	const t = await getTranslations('metadata')

	return {
		title: t('registerTitle'),
	}
}

export default function RegisterPage() {
	return (
		<>
			<h1 className="sr-only">Sign Up</h1>
			<RegisterForm />
		</>
	)
}

import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { LoginForm } from '@/components/auth/login-form'

export async function generateMetadata(): Promise<Metadata> {
	const t = await getTranslations('metadata')

	return {
		title: t('loginTitle'),
	}
}

export default function LoginPage() {
	return (
		<>
			<h1 className="sr-only">Sign In</h1>
			<LoginForm />
		</>
	)
}

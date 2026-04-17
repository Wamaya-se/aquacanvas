'use client'

import { useTranslations } from 'next-intl'

interface ErrorPageProps {
	error: Error & { digest?: string }
	reset: () => void
}

export default function AuthError({ error, reset }: ErrorPageProps) {
	const t = useTranslations('errors')
	const tCommon = useTranslations('common')
	void error

	return (
		<div className="flex min-h-[50vh] flex-col items-center justify-center px-6">
			<h1 className="font-heading text-3xl font-bold tracking-[-0.03em] text-foreground">
				{t('generic')}
			</h1>
			<button
				onClick={reset}
				className="mt-6 rounded-xl bg-brand px-6 py-3 font-sans font-medium text-on-brand transition-transform hover:scale-[1.02] active:scale-[0.97]"
			>
				{tCommon('tryAgain')}
			</button>
		</div>
	)
}

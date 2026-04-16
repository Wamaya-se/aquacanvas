'use client'

import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'

interface ErrorPageProps {
	error: Error & { digest?: string }
	reset: () => void
}

export default function MarketingError({ error, reset }: ErrorPageProps) {
	const t = useTranslations('errors')

	return (
		<div className="flex min-h-[50vh] flex-col items-center justify-center px-6">
			<h1 className="font-heading text-3xl font-bold tracking-[-0.03em] text-foreground">
				{t('generic')}
			</h1>
			<Button variant="brand" className="mt-6" onClick={reset}>
				{t('generic')}
			</Button>
		</div>
	)
}

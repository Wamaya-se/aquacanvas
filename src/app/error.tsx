'use client'

import { useEffect } from 'react'

interface ErrorPageProps {
	error: Error & { digest?: string }
	reset: () => void
}

// Root error boundary — kan trigga innan NextIntlClientProvider är monterad,
// så vi använder statisk tvåspråkig text i stället för next-intl.
export default function RootError({ error, reset }: ErrorPageProps) {
	useEffect(() => {
		if (!process.env.NEXT_PUBLIC_SENTRY_DSN) return
		import('@sentry/nextjs')
			.then((Sentry) => {
				Sentry.captureException(error, {
					tags: { digest: error.digest ?? 'unknown' },
				})
			})
			.catch(() => {})
	}, [error])

	return (
		<main
			id="main-content"
			className="flex min-h-dvh flex-col items-center justify-center px-6 text-center"
		>
			<h1 className="font-heading text-3xl font-bold tracking-[-0.03em] text-foreground">
				Something went wrong
			</h1>
			<p className="mt-2 font-sans text-sm text-muted-foreground">
				Något gick fel. Försök igen.
			</p>
			<button
				onClick={reset}
				className="mt-6 rounded-xl bg-brand px-6 py-3 font-sans font-medium text-on-brand transition-transform hover:scale-[1.02] active:scale-[0.97]"
			>
				Try again / Försök igen
			</button>
		</main>
	)
}

import { getTranslations } from 'next-intl/server'
import Link from 'next/link'

export default async function NotFound() {
	const t = await getTranslations('errors')
	const tCommon = await getTranslations('common')

	return (
		<main id="main-content" className="flex min-h-dvh flex-col items-center justify-center px-6">
			<h1 className="font-heading text-5xl font-bold tracking-[-0.03em] text-foreground">
				404
			</h1>
			<p className="mt-4 font-sans text-lg text-muted-foreground">
				{t('notFound')}
			</p>
			<Link
				href="/"
				className="mt-8 rounded-xl bg-brand px-6 py-3 font-sans font-medium text-on-brand transition-transform hover:scale-[1.02] active:scale-[0.97]"
			>
				{tCommon('back')}
			</Link>
		</main>
	)
}

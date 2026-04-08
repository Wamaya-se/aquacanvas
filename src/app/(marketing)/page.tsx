import { getTranslations } from 'next-intl/server'

export default async function HomePage() {
	const t = await getTranslations('hero')

	return (
		<section className="flex flex-1 flex-col items-center justify-center px-6 py-24">
			<div className="mx-auto max-w-3xl text-center">
				<h1 className="font-heading text-4xl font-bold tracking-[-0.03em] text-foreground sm:text-5xl lg:text-6xl">
					{t('title')}
				</h1>
				<p className="mt-6 font-sans text-lg leading-[1.7] text-muted-foreground sm:text-xl">
					{t('subtitle')}
				</p>
			</div>
		</section>
	)
}

import { Link } from '@/i18n/navigation'
import { getTranslations } from 'next-intl/server'

export async function Footer() {
	const t = await getTranslations('footer')
	const tCommon = await getTranslations('common')

	return (
		<footer className="bg-surface-container-low">
			<div className="mx-auto flex max-w-7xl flex-col items-center gap-6 px-6 py-12 md:flex-row md:justify-between">
				<div className="flex flex-col items-center gap-2 md:items-start">
					<span className="font-heading text-sm font-bold tracking-[-0.03em] text-brand">
						{tCommon('brandName')}
					</span>
					<p className="font-sans text-xs text-muted-foreground">
						{t('copyright', { year: new Date().getFullYear() })}
					</p>
				</div>

			<nav aria-label={t('ariaLabel')} className="flex flex-wrap items-center gap-6">
				<Link
					href="/about"
					className="font-sans text-xs text-muted-foreground transition-colors hover:text-foreground"
				>
					{t('about')}
				</Link>
				<Link
					href="/gallery"
					className="font-sans text-xs text-muted-foreground transition-colors hover:text-foreground"
				>
					{t('gallery')}
				</Link>
				<Link
					href="/faq"
					className="font-sans text-xs text-muted-foreground transition-colors hover:text-foreground"
				>
					{t('faq')}
				</Link>
				<Link
					href="/contact"
					className="font-sans text-xs text-muted-foreground transition-colors hover:text-foreground"
				>
					{t('contact')}
				</Link>
				<Link
					href="/privacy"
					className="font-sans text-xs text-muted-foreground transition-colors hover:text-foreground"
				>
					{t('privacy')}
				</Link>
				<Link
					href="/terms"
					className="font-sans text-xs text-muted-foreground transition-colors hover:text-foreground"
				>
					{t('terms')}
				</Link>
				<Link
					href="/cookies"
					className="font-sans text-xs text-muted-foreground transition-colors hover:text-foreground"
				>
					{t('cookies')}
				</Link>
			</nav>
			</div>
		</footer>
	)
}

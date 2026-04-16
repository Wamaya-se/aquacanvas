import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/shared/theme-toggle'
import { MobileNav } from '@/components/shared/mobile-nav'
import { LogoutButton } from '@/components/shared/logout-button'

export async function Header() {
	const t = await getTranslations('nav')
	const supabase = await createClient()
	const {
		data: { user },
	} = await supabase.auth.getUser()

	const isAdmin = user?.app_metadata?.role === 'admin'

	const navItems = [
		{ href: '/', label: t('home') },
		{ href: '/create', label: t('create') },
		{ href: '/gallery', label: t('gallery') },
		{ href: '/about', label: t('about') },
	]

	return (
		<header className="sticky top-0 z-50 bg-surface/70 backdrop-blur-[24px]">
			<div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
				<div className="flex items-center gap-8">
					<Link
						href="/"
						className="font-heading text-lg font-bold tracking-[-0.03em] text-brand"
					>
						Aquacanvas
					</Link>

					<nav aria-label={t('mainAriaLabel')} className="hidden md:flex md:items-center md:gap-1">
						{navItems.map((item) => (
							<Link
								key={item.href}
								href={item.href}
								className="rounded-lg px-3 py-2 font-sans text-sm text-muted-foreground transition-colors hover:text-foreground"
							>
								{item.label}
							</Link>
						))}
					</nav>
				</div>

				<div className="flex items-center gap-2">
					<ThemeToggle />

					{user && (
						<div className="hidden md:flex md:items-center md:gap-2">
							{isAdmin && (
								<Button variant="ghost" size="sm" asChild>
									<Link href="/admin">{t('admin')}</Link>
								</Button>
							)}
							<LogoutButton />
						</div>
					)}

					<MobileNav items={navItems} isLoggedIn={!!user} isAdmin={isAdmin} />
				</div>
			</div>
		</header>
	)
}

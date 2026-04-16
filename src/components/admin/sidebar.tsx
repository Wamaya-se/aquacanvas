'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
	LayoutDashboard,
	Users,
	ShoppingCart,
	Package,
	Palette,
	Settings,
	ArrowLeft,
	LogOut,
	Menu,
	Tag,
	Frame,
	Image,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import {
	Sheet,
	SheetContent,
	SheetTitle,
} from '@/components/ui/sheet'
import { logout } from '@/lib/actions/auth'
import { cn } from '@/lib/utils'

const navItems = [
	{ href: '/admin', icon: LayoutDashboard, labelKey: 'dashboard' as const, exact: true },
	{ href: '/admin/users', icon: Users, labelKey: 'users' as const, exact: false },
	{ href: '/admin/orders', icon: ShoppingCart, labelKey: 'orders' as const, exact: false },
	{ href: '/admin/products', icon: Package, labelKey: 'products' as const, exact: false },
	{ href: '/admin/styles', icon: Palette, labelKey: 'styles' as const, exact: false },
	{ href: '/admin/formats', icon: Frame, labelKey: 'formats' as const, exact: false },
	{ href: '/admin/scenes', icon: Image, labelKey: 'scenes' as const, exact: false },
	{ href: '/admin/discounts', icon: Tag, labelKey: 'discounts' as const, exact: false },
	{ href: '/admin/settings', icon: Settings, labelKey: 'settings' as const, exact: false },
]

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
	const pathname = usePathname()
	const t = useTranslations('admin')
	const tCommon = useTranslations('common')

	return (
		<>
			<div className="flex h-16 items-center px-6">
				<Link
					href="/admin"
					onClick={onNavigate}
					className="font-heading text-lg font-bold tracking-[-0.03em] text-brand"
				>
					{tCommon('brandName')}
				</Link>
			</div>

			<nav aria-label={t('navAriaLabel')} className="flex flex-1 flex-col gap-1 px-3 py-2">
				{navItems.map((item) => {
					const isActive = item.exact
						? pathname === item.href
						: pathname.startsWith(item.href)

					return (
						<Link
							key={item.href}
							href={item.href}
							onClick={onNavigate}
							className={cn(
								'flex items-center gap-3 rounded-lg px-3 py-2.5 font-sans text-sm transition-colors',
								isActive
									? 'bg-surface-container-high text-foreground font-medium'
									: 'text-muted-foreground hover:bg-surface-container-high/50 hover:text-foreground',
							)}
						>
							<item.icon className="size-4 shrink-0" aria-hidden="true" />
							{t(item.labelKey)}
						</Link>
					)
				})}
			</nav>

			<div className="flex flex-col gap-1 border-t border-outline-variant/20 px-3 py-3">
				<Link
					href="/"
					onClick={onNavigate}
					className="flex items-center gap-3 rounded-lg px-3 py-2.5 font-sans text-sm text-muted-foreground transition-colors hover:bg-surface-container-high/50 hover:text-foreground"
				>
					<ArrowLeft className="size-4 shrink-0" aria-hidden="true" />
					{t('backToSite')}
				</Link>
				<form action={logout}>
					<Button
						type="submit"
						variant="ghost"
						className="w-full justify-start gap-3 px-3 py-2.5 font-sans text-sm text-muted-foreground hover:text-foreground"
					>
						<LogOut className="size-4 shrink-0" aria-hidden="true" />
						{t('logout')}
					</Button>
				</form>
			</div>
		</>
	)
}

export function AdminSidebar() {
	return (
		<aside className="hidden h-dvh w-64 flex-col bg-surface-container md:flex">
			<SidebarNav />
		</aside>
	)
}

interface AdminMobileHeaderProps {
	isOpen: boolean
	onOpenChange: (open: boolean) => void
}

export function AdminMobileHeader({ isOpen, onOpenChange }: AdminMobileHeaderProps) {
	const t = useTranslations('admin')
	const tCommon = useTranslations('common')
	const pathname = usePathname()

	useEffect(() => {
		onOpenChange(false)
	}, [pathname, onOpenChange])

	return (
		<div className="flex h-14 items-center gap-3 border-b border-outline-variant/20 bg-surface-container px-4 md:hidden">
			<Button
				variant="ghost"
				size="icon"
				onClick={() => onOpenChange(!isOpen)}
				aria-label={isOpen ? t('mobileMenuClose') : t('mobileMenuOpen')}
				aria-expanded={isOpen}
			>
				<Menu className="size-5" />
			</Button>
			<Link
				href="/admin"
				className="font-heading text-base font-bold tracking-[-0.03em] text-brand"
			>
				{tCommon('brandName')}
			</Link>

			<Sheet open={isOpen} onOpenChange={onOpenChange}>
				<SheetContent side="left" showCloseButton className="flex w-64 flex-col p-0">
					<SheetTitle className="sr-only">{t('navAriaLabel')}</SheetTitle>
					<SidebarNav onNavigate={() => onOpenChange(false)} />
				</SheetContent>
			</Sheet>
		</div>
	)
}

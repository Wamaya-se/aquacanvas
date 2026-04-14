'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { logout } from '@/lib/actions/auth'

interface MobileNavProps {
	items: { href: string; label: string }[]
	isLoggedIn: boolean
	isAdmin: boolean
}

export function MobileNav({ items, isLoggedIn, isAdmin }: MobileNavProps) {
	const [isOpen, setIsOpen] = useState(false)
	const t = useTranslations('header')
	const tNav = useTranslations('nav')

	return (
		<div className="md:hidden">
			<Button
				variant="ghost"
				size="icon"
				onClick={() => setIsOpen(!isOpen)}
				aria-label={isOpen ? t('menuClose') : t('menuOpen')}
				aria-expanded={isOpen}
			>
				{isOpen ? <X className="size-5" /> : <Menu className="size-5" />}
			</Button>

			{isOpen && (
				<div className="absolute left-0 right-0 top-full z-50 border-b border-outline-variant/10 bg-surface/95 backdrop-blur-[24px]">
					<nav aria-label="Mobile" className="flex flex-col gap-1 px-6 py-4">
						{items.map((item) => (
							<Link
								key={item.href}
								href={item.href}
								onClick={() => setIsOpen(false)}
								className="rounded-lg px-3 py-2.5 font-sans text-sm text-foreground transition-colors hover:bg-surface-container-high"
							>
								{item.label}
							</Link>
						))}
						{isLoggedIn && (
							<>
								<div className="my-2 h-px bg-outline-variant/20" />
								{isAdmin && (
									<Link
										href="/admin"
										onClick={() => setIsOpen(false)}
										className="rounded-lg px-3 py-2.5 font-sans text-sm text-brand transition-colors hover:bg-surface-container-high"
									>
										{tNav('admin')}
									</Link>
								)}
								<form action={logout}>
									<button
										type="submit"
										className="w-full rounded-lg px-3 py-2.5 text-left font-sans text-sm text-muted-foreground transition-colors hover:bg-surface-container-high hover:text-foreground"
									>
										{tNav('logout')}
									</button>
								</form>
							</>
						)}
					</nav>
				</div>
			)}
		</div>
	)
}

'use client'

import { useTransition } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { Languages } from 'lucide-react'
import { usePathname, useRouter } from '@/i18n/navigation'
import { routing } from '@/i18n/routing'
import { Button } from '@/components/ui/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const LOCALE_LABELS: Record<string, string> = {
	sv: 'Svenska',
	en: 'English',
}

export function LocaleSwitcher() {
	const activeLocale = useLocale()
	const router = useRouter()
	const pathname = usePathname()
	const [isPending, startTransition] = useTransition()
	const t = useTranslations('common')

	function switchLocale(nextLocale: string) {
		if (nextLocale === activeLocale) return
		startTransition(() => {
			router.replace(pathname, { locale: nextLocale })
		})
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="ghost"
					size="icon"
					aria-label={t('languageSwitcher', {
						locale: LOCALE_LABELS[activeLocale] ?? activeLocale,
					})}
					disabled={isPending}
				>
					<Languages className="size-4" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				{routing.locales.map((loc) => (
					<DropdownMenuItem
						key={loc}
						onSelect={() => switchLocale(loc)}
						aria-current={loc === activeLocale ? 'true' : undefined}
						className={loc === activeLocale ? 'font-semibold' : undefined}
					>
						{LOCALE_LABELS[loc] ?? loc}
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	)
}

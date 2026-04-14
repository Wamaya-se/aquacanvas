'use client'

import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { logout } from '@/lib/actions/auth'

export function LogoutButton() {
	const t = useTranslations('nav')

	return (
		<form action={logout}>
			<Button type="submit" variant="ghost" size="sm">
				{t('logout')}
			</Button>
		</form>
	)
}

'use client'

import { useTranslations } from 'next-intl'

export function useActionError() {
	const t = useTranslations('errors')

	return function translateError(errorKey: string): string {
		const key = errorKey.startsWith('errors.')
			? errorKey.slice(7)
			: errorKey

		return t(key)
	}
}

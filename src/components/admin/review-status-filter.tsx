'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'

const STATUSES = ['all', 'pending', 'approved', 'rejected'] as const

interface ReviewStatusFilterProps {
	currentStatus: string
}

export function ReviewStatusFilter({ currentStatus }: ReviewStatusFilterProps) {
	const t = useTranslations('admin')
	const router = useRouter()
	const pathname = usePathname()

	function handleChange(value: string) {
		const params = new URLSearchParams()
		if (value !== 'all') {
			params.set('status', value)
		}
		const qs = params.toString()
		router.push(qs ? `${pathname}?${qs}` : pathname)
	}

	return (
		<Select value={currentStatus} onValueChange={handleChange}>
			<SelectTrigger className="w-[200px]" aria-label={t('reviewFilterByStatus')}>
				<SelectValue />
			</SelectTrigger>
			<SelectContent>
				{STATUSES.map((status) => (
					<SelectItem key={status} value={status}>
						{status === 'all'
							? t('reviewAllStatuses')
							: t(
									`reviewStatus_${status}` as
										| 'reviewStatus_pending'
										| 'reviewStatus_approved'
										| 'reviewStatus_rejected',
								)}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	)
}

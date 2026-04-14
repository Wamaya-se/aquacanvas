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

const STATUSES = ['all', 'created', 'processing', 'generated', 'paid', 'shipped'] as const

interface OrderStatusFilterProps {
	currentStatus: string
}

export function OrderStatusFilter({ currentStatus }: OrderStatusFilterProps) {
	const t = useTranslations('admin')
	const tStatus = useTranslations('dashboard.orderStatus')
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
			<SelectTrigger className="w-[180px]" aria-label={t('filterByStatus')}>
				<SelectValue placeholder={t('filterByStatus')} />
			</SelectTrigger>
			<SelectContent>
				{STATUSES.map((status) => (
					<SelectItem key={status} value={status}>
						{status === 'all'
							? t('allStatuses')
							: tStatus(status as 'created')}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	)
}

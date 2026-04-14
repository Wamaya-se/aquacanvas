'use client'

import { useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { updateOrderStatus } from '@/lib/actions/admin-orders'

const STATUSES = ['created', 'processing', 'generated', 'paid', 'shipped'] as const

interface OrderStatusChangerProps {
	orderId: string
	currentStatus: string
}

export function OrderStatusChanger({ orderId, currentStatus }: OrderStatusChangerProps) {
	const t = useTranslations('admin')
	const tCommon = useTranslations('common')
	const tStatus = useTranslations('dashboard.orderStatus')
	const tErrors = useTranslations('errors')
	const [status, setStatus] = useState(currentStatus)
	const [isPending, startTransition] = useTransition()
	const [message, setMessage] = useState<string | null>(null)
	const [error, setError] = useState<string | null>(null)

	function handleSave() {
		if (status === currentStatus) return
		setMessage(null)
		setError(null)
		startTransition(async () => {
			const result = await updateOrderStatus(orderId, status)
			if (result.success) {
				setMessage(t('statusUpdated'))
			} else {
				setError(tErrors(result.error.replace('errors.', '') as 'generic'))
			}
		})
	}

	return (
		<div className="space-y-3">
			<div className="flex items-end gap-3">
				<div className="flex-1">
					<Select value={status} onValueChange={setStatus} aria-label={t('changeStatus')}>
						<SelectTrigger className="w-full" aria-label={t('changeStatus')}>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{STATUSES.map((s) => (
								<SelectItem key={s} value={s}>
									{tStatus(s)}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
				<Button
					variant="brand"
					size="sm"
					onClick={handleSave}
					disabled={isPending || status === currentStatus}
				>
					{isPending ? tCommon('loading') : t('updateStatus')}
				</Button>
			</div>
			{message && (
				<p role="status" className="font-sans text-xs text-success">{message}</p>
			)}
			{error && (
				<p role="alert" className="font-sans text-xs text-destructive">{error}</p>
			)}
		</div>
	)
}

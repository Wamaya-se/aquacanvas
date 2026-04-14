'use client'

import { useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { exportOrdersCsv } from '@/lib/actions/admin-orders'

interface ExportCsvButtonProps {
	currentStatus: string
}

export function ExportCsvButton({ currentStatus }: ExportCsvButtonProps) {
	const t = useTranslations('admin')
	const tErrors = useTranslations('errors')
	const [isPending, startTransition] = useTransition()

	function handleExport() {
		startTransition(async () => {
			const result = await exportOrdersCsv(currentStatus)

			if (!result.success) {
				console.error(tErrors(result.error.replace('errors.', '') as 'generic'))
				return
			}

			const blob = new Blob([result.data.csv], { type: 'text/csv;charset=utf-8;' })
			const url = URL.createObjectURL(blob)
			const link = document.createElement('a')
			link.href = url
			link.download = result.data.filename
			document.body.appendChild(link)
			link.click()
			document.body.removeChild(link)
			URL.revokeObjectURL(url)
		})
	}

	return (
		<Button
			variant="outline"
			size="sm"
			onClick={handleExport}
			disabled={isPending}
		>
			<Download className="mr-1.5 size-4" aria-hidden="true" />
			{isPending ? t('exportingCsv') : t('exportCsv')}
		</Button>
	)
}

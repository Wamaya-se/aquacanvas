'use client'

import { useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { toggleDiscountCode, deleteDiscountCode } from '@/lib/actions/admin-discounts'

interface ToggleDiscountButtonProps {
	discountId: string
	isActive: boolean
}

export function ToggleDiscountButton({ discountId, isActive }: ToggleDiscountButtonProps) {
	const t = useTranslations('admin')
	const tCommon = useTranslations('common')
	const [isPending, startTransition] = useTransition()

	function handleToggle() {
		startTransition(async () => {
			await toggleDiscountCode(discountId, !isActive)
		})
	}

	function handleDelete() {
		startTransition(async () => {
			await deleteDiscountCode(discountId)
		})
	}

	return (
		<div className="flex gap-2">
			<Button
				variant="outline"
				size="sm"
				onClick={handleToggle}
				disabled={isPending}
			>
				{isActive ? t('deactivate') : t('activate')}
			</Button>
			<AlertDialog>
				<AlertDialogTrigger asChild>
					<Button
						variant="ghost"
						size="sm"
						disabled={isPending}
						className="text-destructive hover:text-destructive"
					>
						{tCommon('delete')}
					</Button>
				</AlertDialogTrigger>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>{t('deleteDiscountConfirm')}</AlertDialogTitle>
						<AlertDialogDescription>
							{t('deleteDiscountDescription')}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>{tCommon('cancel')}</AlertDialogCancel>
						<AlertDialogAction onClick={handleDelete}>
							{tCommon('delete')}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	)
}

'use client'

import { useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { Check, Trash2, X } from 'lucide-react'
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
import { moderateReview } from '@/lib/actions/reviews'

interface ReviewModerationButtonsProps {
	reviewId: string
	status: 'pending' | 'approved' | 'rejected'
}

export function ReviewModerationButtons({
	reviewId,
	status,
}: ReviewModerationButtonsProps) {
	const t = useTranslations('admin')
	const tCommon = useTranslations('common')
	const [isPending, startTransition] = useTransition()

	function act(action: 'approve' | 'reject' | 'delete') {
		startTransition(async () => {
			await moderateReview(reviewId, action)
		})
	}

	return (
		<div className="flex flex-wrap justify-end gap-2">
			{status !== 'approved' && (
				<Button
					variant="outline"
					size="sm"
					onClick={() => act('approve')}
					disabled={isPending}
				>
					<Check className="size-4" aria-hidden="true" />
					{t('reviewApprove')}
				</Button>
			)}
			{status !== 'rejected' && (
				<Button
					variant="outline"
					size="sm"
					onClick={() => act('reject')}
					disabled={isPending}
				>
					<X className="size-4" aria-hidden="true" />
					{t('reviewReject')}
				</Button>
			)}
			<AlertDialog>
				<AlertDialogTrigger asChild>
					<Button
						variant="ghost"
						size="sm"
						disabled={isPending}
						className="text-destructive hover:text-destructive"
					>
						<Trash2 className="size-4" aria-hidden="true" />
						<span className="sr-only">{tCommon('delete')}</span>
					</Button>
				</AlertDialogTrigger>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>{t('reviewDeleteConfirm')}</AlertDialogTitle>
						<AlertDialogDescription>
							{t('reviewDeleteDescription')}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>{tCommon('cancel')}</AlertDialogCancel>
						<AlertDialogAction onClick={() => act('delete')}>
							{tCommon('delete')}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	)
}

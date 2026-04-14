'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
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
import { deleteProduct } from '@/lib/actions/admin-products'

interface DeleteProductButtonProps {
	productId: string
	productName: string
}

export function DeleteProductButton({
	productId,
	productName,
}: DeleteProductButtonProps) {
	const t = useTranslations('admin')
	const tCommon = useTranslations('common')
	const tErrors = useTranslations('errors')
	const [isPending, startTransition] = useTransition()
	const [open, setOpen] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const router = useRouter()

	function handleDelete() {
		setError(null)
		startTransition(async () => {
			const result = await deleteProduct(productId)
			if (result.success) {
				router.push('/admin/products')
			} else {
				setError(tErrors(result.error.replace('errors.', '') as 'generic'))
			}
			setOpen(false)
		})
	}

	return (
		<>
			{error && (
				<div role="alert" className="mb-4 rounded-lg bg-destructive/10 px-4 py-3 font-sans text-sm text-destructive">
					{error}
				</div>
			)}
		<AlertDialog open={open} onOpenChange={setOpen}>
			<AlertDialogTrigger asChild>
				<Button variant="destructive" size="sm">
					<Trash2 className="mr-2 size-4" aria-hidden="true" />
					{t('deleteProduct')}
				</Button>
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>
						{t('deleteProduct')}: {productName}
					</AlertDialogTitle>
					<AlertDialogDescription>
						{t('deleteProductConfirm')}
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>{tCommon('cancel')}</AlertDialogCancel>
					<AlertDialogAction
						onClick={handleDelete}
						disabled={isPending}
						className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
					>
						{isPending ? tCommon('loading') : tCommon('delete')}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
		</>
	)
}

'use client'

import { useActionState, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { createDiscountCode } from '@/lib/actions/admin-discounts'
import type { ActionResult } from '@/types/actions'

export function DiscountForm() {
	const t = useTranslations('admin')
	const tCommon = useTranslations('common')
	const tErrors = useTranslations('errors')
	const router = useRouter()
	const [discountType, setDiscountType] = useState<'percent' | 'amount'>('percent')

	const [state, formAction, isPending] = useActionState(
		async (_prev: ActionResult<{ id: string }> | null, formData: FormData) => {
			return createDiscountCode(formData)
		},
		null,
	)

	useEffect(() => {
		if (state?.success) {
			router.push('/admin/discounts')
		}
	}, [state, router])

	return (
		<form action={formAction} className="space-y-6">
			{state && !state.success && (
				<div
					role="alert"
					className="rounded-lg bg-destructive/10 px-4 py-3 font-sans text-sm text-destructive"
				>
					{tErrors(state.error.replace('errors.', '') as 'generic')}
				</div>
			)}

			<div className="space-y-2">
				<Label htmlFor="code">{t('discountCode')}</Label>
				<Input
					id="code"
					name="code"
					required
					maxLength={50}
					pattern="[A-Za-z0-9_-]+"
					placeholder="SUMMER20"
					className="uppercase"
					onChange={(e) => { e.target.value = e.target.value.toUpperCase() }}
				/>
				<p className="font-sans text-xs text-muted-foreground">
					{t('discountCodeHint')}
				</p>
			</div>

			<div className="grid gap-6 sm:grid-cols-2">
				<div className="space-y-2">
					<Label htmlFor="discountType">{t('discountType')}</Label>
					<Select
						name="discountType"
						value={discountType}
						onValueChange={(v) => setDiscountType(v as 'percent' | 'amount')}
					>
						<SelectTrigger className="w-full">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="percent">{t('discountTypePercent')}</SelectItem>
							<SelectItem value="amount">{t('discountTypeAmount')}</SelectItem>
						</SelectContent>
					</Select>
				</div>

				{discountType === 'percent' ? (
					<div className="space-y-2">
						<Label htmlFor="discountPercent">{t('discountPercent')}</Label>
						<Input
							id="discountPercent"
							name="discountPercent"
							type="number"
							min={1}
							max={100}
							required
							placeholder="20"
						/>
					</div>
				) : (
					<div className="space-y-2">
						<Label htmlFor="discountAmountSek">{t('discountAmount')}</Label>
						<Input
							id="discountAmountSek"
							name="discountAmountSek"
							type="number"
							min={1}
							required
							placeholder="50"
						/>
						<p className="font-sans text-xs text-muted-foreground">
							{t('discountAmountHint')}
						</p>
					</div>
				)}
			</div>

			<div className="grid gap-6 sm:grid-cols-2">
				<div className="space-y-2">
					<Label htmlFor="maxUses">{t('discountMaxUses')}</Label>
					<Input
						id="maxUses"
						name="maxUses"
						type="number"
						min={1}
						placeholder={t('discountUnlimited')}
					/>
				</div>

				<div className="space-y-2">
					<Label htmlFor="expiresAt">{t('discountExpires')}</Label>
					<Input
						id="expiresAt"
						name="expiresAt"
						type="date"
					/>
				</div>
			</div>

			<div className="flex gap-3">
				<Button type="submit" variant="brand" disabled={isPending}>
					{isPending ? tCommon('loading') : t('createDiscount')}
				</Button>
				<Button
					type="button"
					variant="ghost"
					onClick={() => router.push('/admin/discounts')}
				>
					{tCommon('cancel')}
				</Button>
			</div>
		</form>
	)
}

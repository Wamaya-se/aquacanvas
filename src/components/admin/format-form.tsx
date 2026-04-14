'use client'

import { useActionState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { createFormat, updateFormat } from '@/lib/actions/admin-formats'
import type { ActionResult } from '@/types/actions'

interface FormatData {
	id: string
	name: string
	slug: string
	description: string | null
	format_type: string
	width_cm: number
	height_cm: number
	price_cents: number
	is_active: boolean
	sort_order: number
}

interface FormatFormProps {
	format?: FormatData
}

export function FormatForm({ format }: FormatFormProps) {
	const t = useTranslations('admin')
	const tCommon = useTranslations('common')
	const tErrors = useTranslations('errors')
	const router = useRouter()
	const isEditing = !!format

	async function handleAction(
		_prev: ActionResult | null,
		formData: FormData,
	): Promise<ActionResult> {
		if (isEditing) {
			return updateFormat(format.id, formData)
		}
		const result = await createFormat(formData)
		if (!result.success) return result
		return { success: true, data: undefined }
	}

	const [state, formAction, isPending] = useActionState(handleAction, null)

	useEffect(() => {
		if (state?.success) {
			router.push('/admin/formats')
		}
	}, [state, router])

	return (
		<form action={formAction} className="space-y-8">
			{state && !state.success && (
				<div
					role="alert"
					className="rounded-lg bg-destructive/10 px-4 py-3 font-sans text-sm text-destructive"
				>
					{tErrors(state.error.replace('errors.', '') as 'generic')}
				</div>
			)}

			<div className="grid gap-6 sm:grid-cols-2">
				<div className="space-y-2">
					<Label htmlFor="name">{t('formatName')}</Label>
					<Input
						id="name"
						name="name"
						required
						maxLength={100}
						defaultValue={format?.name ?? ''}
					/>
				</div>

				<div className="space-y-2">
					<Label htmlFor="slug">{t('formatSlug')}</Label>
					<Input
						id="slug"
						name="slug"
						required
						maxLength={100}
						pattern="[a-z0-9-]+"
						defaultValue={format?.slug ?? ''}
					/>
				</div>
			</div>

			<div className="space-y-2">
				<Label htmlFor="description">{t('formatDescription')}</Label>
				<Textarea
					id="description"
					name="description"
					maxLength={500}
					rows={2}
					defaultValue={format?.description ?? ''}
				/>
			</div>

			<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
				<div className="space-y-2">
					<Label htmlFor="formatType">{t('formatType')}</Label>
					<Input
						id="formatType"
						name="formatType"
						required
						defaultValue={format?.format_type ?? 'canvas'}
					/>
				</div>

				<div className="space-y-2">
					<Label htmlFor="widthCm">{t('formatWidth')}</Label>
					<Input
						id="widthCm"
						name="widthCm"
						type="number"
						min={1}
						required
						defaultValue={format?.width_cm ?? ''}
					/>
				</div>

				<div className="space-y-2">
					<Label htmlFor="heightCm">{t('formatHeight')}</Label>
					<Input
						id="heightCm"
						name="heightCm"
						type="number"
						min={1}
						required
						defaultValue={format?.height_cm ?? ''}
					/>
				</div>

				<div className="space-y-2">
					<Label htmlFor="priceCents">{t('formatPrice')}</Label>
					<Input
						id="priceCents"
						name="priceCents"
						type="number"
						min={0}
						required
						defaultValue={format ? (format.price_cents / 100).toFixed(0) : ''}
					/>
				</div>
			</div>

			<div className="grid gap-6 sm:grid-cols-2">
				<div className="space-y-2">
					<Label htmlFor="sortOrder">{t('formatSortOrder')}</Label>
					<Input
						id="sortOrder"
						name="sortOrder"
						type="number"
						min={0}
						defaultValue={format?.sort_order ?? 0}
					/>
				</div>

				<div className="flex items-center gap-3 pt-6">
					<Switch
						id="isActive"
						name="isActive"
						defaultChecked={format?.is_active ?? true}
					/>
					<Label htmlFor="isActive">{t('formatActive')}</Label>
				</div>
			</div>

			<div className="flex gap-3">
				<Button type="submit" variant="brand" disabled={isPending}>
					{isPending
						? tCommon('loading')
						: isEditing
							? t('saveFormat')
							: t('createFormat')}
				</Button>
				<Button
					type="button"
					variant="ghost"
					onClick={() => router.push('/admin/formats')}
				>
					{tCommon('cancel')}
				</Button>
			</div>
		</form>
	)
}

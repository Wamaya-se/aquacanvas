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
import { useActionError } from '@/hooks/use-action-error'

import type { Orientation } from '@/types/supabase'

export interface FormatData {
	id: string
	name: string
	slug: string
	description: string | null
	format_type: string
	width_cm: number
	height_cm: number
	price_cents: number
	orientation: Orientation
	is_active: boolean
	sort_order: number
}

interface FormatFormProps {
	format?: FormatData
}

export function FormatForm({ format }: FormatFormProps) {
	const t = useTranslations('admin')
	const tCommon = useTranslations('common')
	const translateError = useActionError()
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

	const fieldErrors = state && !state.success ? state.fieldErrors ?? {} : {}
	const formError =
		state && !state.success && !Object.keys(fieldErrors).length
			? state.error
			: null

	return (
		<form action={formAction} className="space-y-8">
			{formError && (
				<div
					role="alert"
					className="rounded-lg bg-destructive/10 px-4 py-3 font-sans text-sm text-destructive"
				>
					{translateError(formError)}
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
						aria-invalid={fieldErrors.name ? true : undefined}
						aria-describedby={
							fieldErrors.name ? 'format-name-error' : undefined
						}
					/>
					{fieldErrors.name && (
						<p
							id="format-name-error"
							role="alert"
							className="text-sm text-destructive"
						>
							{translateError(fieldErrors.name)}
						</p>
					)}
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
						aria-invalid={fieldErrors.slug ? true : undefined}
						aria-describedby={
							fieldErrors.slug ? 'format-slug-error' : undefined
						}
					/>
					{fieldErrors.slug && (
						<p
							id="format-slug-error"
							role="alert"
							className="text-sm text-destructive"
						>
							{translateError(fieldErrors.slug)}
						</p>
					)}
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
					aria-invalid={fieldErrors.description ? true : undefined}
					aria-describedby={
						fieldErrors.description ? 'format-description-error' : undefined
					}
				/>
				{fieldErrors.description && (
					<p
						id="format-description-error"
						role="alert"
						className="text-sm text-destructive"
					>
						{translateError(fieldErrors.description)}
					</p>
				)}
			</div>

			<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
				<div className="space-y-2">
					<Label htmlFor="formatType">{t('formatType')}</Label>
					<Input
						id="formatType"
						name="formatType"
						required
						defaultValue={format?.format_type ?? 'canvas'}
						aria-invalid={fieldErrors.formatType ? true : undefined}
						aria-describedby={
							fieldErrors.formatType ? 'format-type-error' : undefined
						}
					/>
					{fieldErrors.formatType && (
						<p
							id="format-type-error"
							role="alert"
							className="text-sm text-destructive"
						>
							{translateError(fieldErrors.formatType)}
						</p>
					)}
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
						aria-invalid={fieldErrors.widthCm ? true : undefined}
						aria-describedby={
							fieldErrors.widthCm ? 'format-width-error' : undefined
						}
					/>
					{fieldErrors.widthCm && (
						<p
							id="format-width-error"
							role="alert"
							className="text-sm text-destructive"
						>
							{translateError(fieldErrors.widthCm)}
						</p>
					)}
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
						aria-invalid={fieldErrors.heightCm ? true : undefined}
						aria-describedby={
							fieldErrors.heightCm ? 'format-height-error' : undefined
						}
					/>
					{fieldErrors.heightCm && (
						<p
							id="format-height-error"
							role="alert"
							className="text-sm text-destructive"
						>
							{translateError(fieldErrors.heightCm)}
						</p>
					)}
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
						aria-invalid={fieldErrors.priceCents ? true : undefined}
						aria-describedby={
							fieldErrors.priceCents ? 'format-price-error' : undefined
						}
					/>
					{fieldErrors.priceCents && (
						<p
							id="format-price-error"
							role="alert"
							className="text-sm text-destructive"
						>
							{translateError(fieldErrors.priceCents)}
						</p>
					)}
				</div>
			</div>

			<div className="space-y-2">
				<Label htmlFor="orientation">{t('formatOrientation')}</Label>
				<select
					id="orientation"
					name="orientation"
					defaultValue={format?.orientation ?? 'portrait'}
					className="flex h-10 w-full rounded-md border border-outline-variant/20 bg-surface-dim px-3 py-2 font-sans text-sm text-foreground focus:border-tertiary focus:outline-none focus:ring-1 focus:ring-tertiary"
				>
					<option value="portrait">{t('orientationPortrait')}</option>
					<option value="landscape">{t('orientationLandscape')}</option>
					<option value="square">{t('orientationSquare')}</option>
				</select>
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

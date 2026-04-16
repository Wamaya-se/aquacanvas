'use client'

import { useActionState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { updateStyle } from '@/lib/actions/admin-styles'
import type { ActionResult } from '@/types/actions'
import { useActionError } from '@/hooks/use-action-error'

interface StyleData {
	id: string
	name: string
	slug: string
	description: string | null
	prompt_template: string
	model_id: string
	price_cents: number
	is_active: boolean
	sort_order: number
}

interface StyleFormProps {
	style: StyleData
}

export function StyleForm({ style }: StyleFormProps) {
	const t = useTranslations('admin')
	const tCommon = useTranslations('common')
	const translateError = useActionError()
	const router = useRouter()

	async function handleAction(
		_prev: ActionResult | null,
		formData: FormData,
	): Promise<ActionResult> {
		return updateStyle(style.id, formData)
	}

	const [state, formAction, isPending] = useActionState(handleAction, null)

	useEffect(() => {
		if (state?.success) {
			router.push('/admin/styles')
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
					<Label htmlFor="name">{t('styleName')}</Label>
					<Input
						id="name"
						name="name"
						required
						maxLength={100}
						defaultValue={style.name}
						aria-invalid={fieldErrors.name ? true : undefined}
						aria-describedby={
							fieldErrors.name ? 'style-name-error' : undefined
						}
					/>
					{fieldErrors.name && (
						<p
							id="style-name-error"
							role="alert"
							className="text-sm text-destructive"
						>
							{translateError(fieldErrors.name)}
						</p>
					)}
				</div>

				<div className="space-y-2">
					<Label htmlFor="slug">{t('styleSlug')}</Label>
					<Input
						id="slug"
						name="slug"
						required
						maxLength={100}
						pattern="[a-z0-9-]+"
						defaultValue={style.slug}
						aria-invalid={fieldErrors.slug ? true : undefined}
						aria-describedby={
							fieldErrors.slug ? 'style-slug-error' : undefined
						}
					/>
					{fieldErrors.slug && (
						<p
							id="style-slug-error"
							role="alert"
							className="text-sm text-destructive"
						>
							{translateError(fieldErrors.slug)}
						</p>
					)}
				</div>
			</div>

			<div className="space-y-2">
				<Label htmlFor="description">{t('styleDescription')}</Label>
				<Textarea
					id="description"
					name="description"
					maxLength={500}
					rows={3}
					defaultValue={style.description ?? ''}
				/>
			</div>

			<div className="space-y-2">
				<Label htmlFor="promptTemplate">{t('stylePromptTemplate')}</Label>
				<Textarea
					id="promptTemplate"
					name="promptTemplate"
					required
					rows={4}
					defaultValue={style.prompt_template}
				/>
			</div>

			<div className="grid gap-6 sm:grid-cols-3">
				<div className="space-y-2">
					<Label htmlFor="modelId">{t('styleModelId')}</Label>
					<Input
						id="modelId"
						name="modelId"
						required
						defaultValue={style.model_id}
					/>
				</div>

				<div className="space-y-2">
					<Label htmlFor="priceCents">{t('stylePrice')}</Label>
					<Input
						id="priceCents"
						name="priceCents"
						type="number"
						min={0}
						required
						defaultValue={(style.price_cents / 100).toFixed(0)}
					/>
				</div>

				<div className="space-y-2">
					<Label htmlFor="sortOrder">{t('styleSortOrder')}</Label>
					<Input
						id="sortOrder"
						name="sortOrder"
						type="number"
						min={0}
						defaultValue={style.sort_order}
					/>
				</div>
			</div>

			<div className="flex items-center gap-3">
				<Switch
					id="isActive"
					name="isActive"
					defaultChecked={style.is_active}
				/>
				<Label htmlFor="isActive">{t('styleActive')}</Label>
			</div>

			<div className="flex gap-3">
				<Button type="submit" variant="brand" disabled={isPending}>
					{isPending ? tCommon('loading') : t('saveStyle')}
				</Button>
				<Button
					type="button"
					variant="ghost"
					onClick={() => router.push('/admin/styles')}
				>
					{tCommon('cancel')}
				</Button>
			</div>
		</form>
	)
}

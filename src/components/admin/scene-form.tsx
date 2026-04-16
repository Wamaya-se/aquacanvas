'use client'

import { useActionState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { ImageUploadField } from '@/components/admin/image-upload-field'
import { createScene, updateScene, deleteScene } from '@/lib/actions/admin-scenes'
import type { ActionResult } from '@/types/actions'
import { useActionError } from '@/hooks/use-action-error'

interface SceneData {
	id: string
	name: string
	description: string | null
	image_url: string | null
	is_active: boolean
	sort_order: number
}

interface SceneFormProps {
	scene?: SceneData
}

export function SceneForm({ scene }: SceneFormProps) {
	const t = useTranslations('admin')
	const tCommon = useTranslations('common')
	const translateError = useActionError()
	const router = useRouter()
	const isEditing = !!scene

	async function handleAction(
		_prev: ActionResult | null,
		formData: FormData,
	): Promise<ActionResult> {
		if (isEditing) {
			return updateScene(scene.id, formData)
		}
		const result = await createScene(formData)
		if (!result.success) return result
		return { success: true, data: undefined }
	}

	const [state, formAction, isPending] = useActionState(handleAction, null)

	useEffect(() => {
		if (state?.success) {
			router.push('/admin/scenes')
		}
	}, [state, router])

	async function handleDelete() {
		if (!scene) return
		const result = await deleteScene(scene.id)
		if (result.success) {
			router.push('/admin/scenes')
		}
	}

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
					<Label htmlFor="name">{t('sceneName')}</Label>
					<Input
						id="name"
						name="name"
						required
						maxLength={100}
						defaultValue={scene?.name ?? ''}
						aria-invalid={fieldErrors.name ? true : undefined}
						aria-describedby={
							fieldErrors.name ? 'scene-name-error' : undefined
						}
					/>
					{fieldErrors.name && (
						<p
							id="scene-name-error"
							role="alert"
							className="text-sm text-destructive"
						>
							{translateError(fieldErrors.name)}
						</p>
					)}
				</div>

				<div className="space-y-2">
					<Label htmlFor="sortOrder">{t('sceneSortOrder')}</Label>
					<Input
						id="sortOrder"
						name="sortOrder"
						type="number"
						min={0}
						defaultValue={scene?.sort_order ?? 0}
						aria-invalid={fieldErrors.sortOrder ? true : undefined}
						aria-describedby={
							fieldErrors.sortOrder ? 'scene-sort-error' : undefined
						}
					/>
					{fieldErrors.sortOrder && (
						<p
							id="scene-sort-error"
							role="alert"
							className="text-sm text-destructive"
						>
							{translateError(fieldErrors.sortOrder)}
						</p>
					)}
				</div>
			</div>

			<div className="space-y-2">
				<Label htmlFor="description">{t('sceneDescription')}</Label>
				<Textarea
					id="description"
					name="description"
					maxLength={500}
					rows={2}
					defaultValue={scene?.description ?? ''}
					aria-invalid={fieldErrors.description ? true : undefined}
					aria-describedby={
						fieldErrors.description ? 'scene-description-error' : undefined
					}
				/>
				{fieldErrors.description && (
					<p
						id="scene-description-error"
						role="alert"
						className="text-sm text-destructive"
					>
						{translateError(fieldErrors.description)}
					</p>
				)}
			</div>

			<ImageUploadField
				name="image"
				label={t('sceneImage')}
				existingUrl={scene?.image_url}
				error={fieldErrors.image ? translateError(fieldErrors.image) : undefined}
			/>

			<div className="flex items-center gap-3">
				<Switch
					id="isActive"
					name="isActive"
					defaultChecked={scene?.is_active ?? true}
				/>
				<Label htmlFor="isActive">{t('sceneActive')}</Label>
			</div>

			<div className="flex gap-3">
				<Button type="submit" variant="brand" disabled={isPending}>
					{isPending
						? tCommon('loading')
						: isEditing
							? t('saveScene')
							: t('createScene')}
				</Button>
				<Button
					type="button"
					variant="ghost"
					onClick={() => router.push('/admin/scenes')}
				>
					{tCommon('cancel')}
				</Button>
				{isEditing && (
					<Button
						type="button"
						variant="destructive"
						onClick={handleDelete}
					>
						{t('deleteScene')}
					</Button>
				)}
			</div>
		</form>
	)
}

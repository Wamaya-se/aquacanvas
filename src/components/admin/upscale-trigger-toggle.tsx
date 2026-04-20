'use client'

import { useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { setUpscaleTrigger } from '@/lib/actions/admin-settings'
import { useActionError } from '@/hooks/use-action-error'
import type { UpscaleTrigger } from '@/validators/admin'

interface UpscaleTriggerToggleProps {
	initialValue: UpscaleTrigger
}

/**
 * Admin-only switch between `post_checkout` and `post_generation` upscale
 * triggers. Persists to `app_settings` via `setUpscaleTrigger`.
 */
export function UpscaleTriggerToggle({ initialValue }: UpscaleTriggerToggleProps) {
	const t = useTranslations('admin')
	const tCommon = useTranslations('common')
	const translateError = useActionError()
	const [value, setValue] = useState<UpscaleTrigger>(initialValue)
	const [saved, setSaved] = useState<UpscaleTrigger>(initialValue)
	const [isPending, startTransition] = useTransition()
	const [message, setMessage] = useState<string | null>(null)
	const [error, setError] = useState<string | null>(null)

	const dirty = value !== saved
	const hint = value === 'post_generation'
		? t('pipelineTriggerPostGenerationHint')
		: t('pipelineTriggerPostCheckoutHint')

	function handleSave() {
		if (!dirty) return
		setMessage(null)
		setError(null)
		startTransition(async () => {
			const result = await setUpscaleTrigger(value)
			if (result.success) {
				setSaved(value)
				setMessage(t('pipelineTriggerSaved'))
			} else {
				setValue(saved)
				setError(translateError(result.error))
			}
		})
	}

	return (
		<div className="space-y-3">
			<Label htmlFor="upscaleTrigger" className="font-sans text-xs font-medium text-muted-foreground">
				{t('pipelineTrigger')}
			</Label>
			<div className="flex flex-col gap-3 sm:flex-row sm:items-start">
				<div className="flex-1">
					<Select
						value={value}
						onValueChange={(v) => setValue(v as UpscaleTrigger)}
						disabled={isPending}
					>
						<SelectTrigger id="upscaleTrigger" className="w-full">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="post_checkout">
								{t('pipelineTriggerPostCheckout')}
							</SelectItem>
							<SelectItem value="post_generation">
								{t('pipelineTriggerPostGeneration')}
							</SelectItem>
						</SelectContent>
					</Select>
				</div>
				<Button
					variant="brand"
					size="sm"
					onClick={handleSave}
					disabled={isPending || !dirty}
				>
					{isPending ? tCommon('loading') : tCommon('save')}
				</Button>
			</div>
			<p className="font-sans text-xs text-muted-foreground">{hint}</p>
			{message && (
				<p role="status" className="font-sans text-xs text-success">{message}</p>
			)}
			{error && (
				<p role="alert" className="font-sans text-xs text-destructive">{error}</p>
			)}
		</div>
	)
}

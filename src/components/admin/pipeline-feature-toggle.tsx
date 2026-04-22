'use client'

import { useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { Pause, Play } from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
	setUpscaleEnabled,
	setEnvironmentPreviewsEnabled,
} from '@/lib/actions/admin-settings'
import { useActionError } from '@/hooks/use-action-error'
import type { ActionResult } from '@/types/actions'

/**
 * Identifies which server action the toggle should call. Using a
 * string-literal union instead of passing the action as a prop keeps
 * this component fully JSON-serializable at the Server/Client boundary
 * and avoids the `"use server"` function-prop footgun in Next 15 when
 * the parent is a Server Component.
 */
export type PipelineFeatureKind = 'upscale' | 'environmentPreviews'

const TOGGLE_ACTIONS: Record<
	PipelineFeatureKind,
	(enabled: boolean) => Promise<ActionResult>
> = {
	upscale: setUpscaleEnabled,
	environmentPreviews: setEnvironmentPreviewsEnabled,
}

interface PipelineFeatureToggleProps {
	id: string
	kind: PipelineFeatureKind
	label: string
	description: string
	pausedHint: string
	initialEnabled: boolean
}

/**
 * Shared admin switch for pausing/resuming expensive pipeline stages
 * (Topaz upscale, Kie environment previews). Optimistically flips the
 * local toggle, reverts on server error, and surfaces both success and
 * error feedback via ARIA live regions.
 *
 * The badge reads as "Active" / "Paused" so admins immediately see which
 * state costs credits right now.
 */
export function PipelineFeatureToggle({
	id,
	kind,
	label,
	description,
	pausedHint,
	initialEnabled,
}: PipelineFeatureToggleProps) {
	const t = useTranslations('admin')
	const translateError = useActionError()
	const [enabled, setEnabled] = useState(initialEnabled)
	const [isPending, startTransition] = useTransition()
	const [error, setError] = useState<string | null>(null)

	function handleToggle(checked: boolean) {
		setEnabled(checked)
		setError(null)
		startTransition(async () => {
			const result = await TOGGLE_ACTIONS[kind](checked)
			if (!result.success) {
				setEnabled(!checked)
				setError(translateError(result.error))
			}
		})
	}

	return (
		<div className="space-y-3">
			<div className="flex items-center justify-between gap-4">
				<div className="flex items-center gap-3">
					<Switch
						id={id}
						checked={enabled}
						onCheckedChange={handleToggle}
						disabled={isPending}
					/>
					<Label htmlFor={id} className="cursor-pointer">
						{label}
					</Label>
				</div>
				<Badge variant={enabled ? 'default' : 'secondary'}>
					{enabled ? (
						<>
							<Play className="size-3" aria-hidden="true" />
							{t('pipelineFlagActive')}
						</>
					) : (
						<>
							<Pause className="size-3" aria-hidden="true" />
							{t('pipelineFlagPaused')}
						</>
					)}
				</Badge>
			</div>
			<p className="font-sans text-xs text-muted-foreground">{description}</p>
			{!enabled && (
				<div className="flex items-start gap-2 rounded-lg bg-warning/10 px-3 py-2">
					<Pause
						className="mt-0.5 size-4 shrink-0 text-warning"
						aria-hidden="true"
					/>
					<p className="font-sans text-xs font-medium text-warning">
						{pausedHint}
					</p>
				</div>
			)}
			{error && (
				<p role="alert" className="font-sans text-xs text-destructive">
					{error}
				</p>
			)}
		</div>
	)
}

'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { RefreshCw, Play, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { triggerUpscale, checkUpscaleStatus } from '@/lib/actions/upscale'
import { useActionError } from '@/hooks/use-action-error'
import type { UpscaleStatus } from '@/types/supabase'

interface UpscaleActionButtonProps {
	orderId: string
	status: UpscaleStatus | null
	hasGeneratedImage: boolean
}

/**
 * Admin action for the print pipeline. Behaviour depends on `status`:
 *
 * - `null` / `fail`   → triggers a fresh Topaz upscale run (uses the
 *                        `triggerUpscale` admin wrapper so the server
 *                        re-validates admin role).
 * - `pending` / `processing` → polls Kie once via `checkUpscaleStatus`,
 *                        mirroring the admin-initiated status check.
 * - `success`         → no button rendered (caller hides it).
 *
 * Refreshes the route via `router.refresh()` after any successful call so
 * the server-rendered status/badge/download link update immediately.
 */
export function UpscaleActionButton({
	orderId,
	status,
	hasGeneratedImage,
}: UpscaleActionButtonProps) {
	const t = useTranslations('admin')
	const tCommon = useTranslations('common')
	const translateError = useActionError()
	const router = useRouter()
	const [isPending, startTransition] = useTransition()
	const [message, setMessage] = useState<string | null>(null)
	const [error, setError] = useState<string | null>(null)

	if (status === 'success') return null
	if (!hasGeneratedImage) return null

	const isCheck = status === 'pending' || status === 'processing'
	const isRetry = status === 'fail'

	function handleClick() {
		setMessage(null)
		setError(null)
		startTransition(async () => {
			if (isCheck) {
				const result = await checkUpscaleStatus(orderId)
				if (!result.success) {
					setError(translateError(result.error))
					return
				}
				if (result.data.state === 'success') {
					setMessage(t('upscaleCompleted'))
				} else if (result.data.state === 'fail') {
					setError(translateError('errors.generic'))
				} else {
					setMessage(t('upscaleStillRunning'))
				}
			} else {
				const result = await triggerUpscale(orderId)
				if (!result.success) {
					setError(translateError(result.error))
					return
				}
				setMessage(t('upscaleStarted'))
			}

			router.refresh()
		})
	}

	const label = isCheck
		? t('checkUpscaleStatus')
		: isRetry
			? t('retryUpscale')
			: t('runUpscale')

	const Icon = isCheck ? RefreshCw : isRetry ? RefreshCw : Play

	return (
		<div className="space-y-2">
			<Button
				variant={isRetry ? 'outline' : 'brand'}
				size="sm"
				onClick={handleClick}
				disabled={isPending}
			>
				{isPending ? (
					<>
						<RefreshCw className="mr-2 size-4 animate-spin" aria-hidden="true" />
						{tCommon('loading')}
					</>
				) : (
					<>
						<Icon className="mr-2 size-4" aria-hidden="true" />
						{label}
					</>
				)}
			</Button>
			{message && (
				<p role="status" className="flex items-center gap-2 font-sans text-xs text-success">
					<Zap className="size-3" aria-hidden="true" />
					{message}
				</p>
			)}
			{error && (
				<p role="alert" className="font-sans text-xs text-destructive">{error}</p>
			)}
		</div>
	)
}

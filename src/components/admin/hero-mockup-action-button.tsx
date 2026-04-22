'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { RefreshCw, Play, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
	adminTriggerHeroMockup,
	adminCheckHeroMockupStatus,
} from '@/lib/actions/admin-hero-mockup'
import { useActionError } from '@/hooks/use-action-error'
import type { PreviewStatus } from '@/types/supabase'

interface HeroMockupActionButtonProps {
	orderId: string
	status: PreviewStatus
	hasGeneratedImage: boolean
}

/**
 * Admin action for the hero-mockup pipeline. Behaviour depends on `status`:
 *
 * - `pending` (default — never run) → triggers initial generation.
 * - `processing` → polls Kie once via `adminCheckHeroMockupStatus`.
 * - `fail` → resets + retries via `adminTriggerHeroMockup`.
 * - `success` → shows retry button (resets + re-runs).
 *
 * Refreshes the route via `router.refresh()` after any call so the
 * server-rendered badge / preview / download link update immediately.
 */
export function HeroMockupActionButton({
	orderId,
	status,
	hasGeneratedImage,
}: HeroMockupActionButtonProps) {
	const t = useTranslations('admin')
	const tCommon = useTranslations('common')
	const translateError = useActionError()
	const router = useRouter()
	const [isPending, startTransition] = useTransition()
	const [message, setMessage] = useState<string | null>(null)
	const [error, setError] = useState<string | null>(null)

	if (!hasGeneratedImage) return null

	const isCheck = status === 'processing'
	const isRetry = status === 'fail' || status === 'success'

	function handleClick() {
		setMessage(null)
		setError(null)
		startTransition(async () => {
			if (isCheck) {
				const result = await adminCheckHeroMockupStatus(orderId)
				if (!result.success) {
					setError(translateError(result.error))
					return
				}
				if (result.data.status === 'success') {
					setMessage(t('heroMockupCompleted'))
				} else if (result.data.status === 'fail') {
					setError(translateError('errors.generic'))
				} else {
					setMessage(t('heroMockupStillRunning'))
				}
			} else {
				const result = await adminTriggerHeroMockup(orderId)
				if (!result.success) {
					setError(translateError(result.error))
					return
				}
				setMessage(t('heroMockupStarted'))
			}

			router.refresh()
		})
	}

	const label = isCheck
		? t('checkHeroMockupStatus')
		: isRetry
			? t('retryHeroMockup')
			: t('runHeroMockup')

	const Icon = isCheck || isRetry ? RefreshCw : Play

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

'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { AlertTriangle, Expand, RefreshCw } from 'lucide-react'
import { ProtectedImage } from '@/components/shop/protected-image'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { GenerationProgressBar } from '@/components/shop/generation-progress'
import {
	generateHeroMockup,
	checkHeroMockupStatus,
} from '@/lib/actions/hero-mockup'
import { useActionError } from '@/hooks/use-action-error'
import { usePollingTask } from '@/hooks/use-polling-task'
import type { OrientationValue } from '@/validators/order'

type HeroMockupState = 'idle' | 'generating' | 'success' | 'fail'

const ORIENTATION_ASPECT: Record<OrientationValue, string> = {
	portrait: 'aspect-[3/4]',
	landscape: 'aspect-[4/3]',
	square: 'aspect-square',
}

const TEST_MOCKUPS: Record<OrientationValue, string> = {
	portrait: '/images/mockup-vertical.jpeg',
	landscape: '/images/mockup-horizontal.jpeg',
	square: '/images/mockup-square.jpeg',
}

interface HeroMockupProps {
	orderId: string
	guestSessionId: string
	orientation: OrientationValue
	existingMockupUrl?: string | null
	testMode?: boolean
	onMockupReady: (url: string) => void
	onImageClick: () => void
}

/**
 * Hero mockup — renders an AI-generated "canvas on a wall" composite of the
 * user's artwork. Triggers `generateHeroMockup` on mount (idempotent on the
 * server, so re-entering the flow after a successful generation immediately
 * returns the existing URL), then polls `checkHeroMockupStatus` until the
 * Kie task resolves. Progress is shown via `GenerationProgressBar`; failures
 * expose a retry button.
 *
 * In test mode the component skips the Kie pipeline and renders the static
 * master mockup directly so admin QA doesn't incur API calls.
 */
export function HeroMockup({
	orderId,
	guestSessionId,
	orientation,
	existingMockupUrl,
	testMode,
	onMockupReady,
	onImageClick,
}: HeroMockupProps) {
	const t = useTranslations('shop')
	const translateError = useActionError()

	const initialUrl = testMode
		? TEST_MOCKUPS[orientation]
		: (existingMockupUrl ?? null)

	const [state, setState] = useState<HeroMockupState>(
		initialUrl ? 'success' : 'idle',
	)
	const [mockupUrl, setMockupUrl] = useState<string | null>(initialUrl)
	const [error, setError] = useState<string | null>(null)

	const hasStartedRef = useRef(false)
	const lastReadyRef = useRef<string | null>(null)

	useEffect(() => {
		if (mockupUrl && mockupUrl !== lastReadyRef.current) {
			lastReadyRef.current = mockupUrl
			onMockupReady(mockupUrl)
		}
	}, [mockupUrl, onMockupReady])

	const { start: startPolling } = usePollingTask(
		() => checkHeroMockupStatus(orderId, guestSessionId),
		(result) => {
			if (!result.success) {
				setState('fail')
				setError(result.error)
				return 'done'
			}
			const { status, imageUrl } = result.data
			if (status === 'success' && imageUrl) {
				setMockupUrl(imageUrl)
				setState('success')
				return 'done'
			}
			if (status === 'fail') {
				setState('fail')
				setError('errors.generationFailed')
				return 'done'
			}
			return 'continue'
		},
		() => {
			setState('fail')
			setError('errors.generationTimeout')
		},
		{ maxAttempts: 40, initialDelay: 4000, maxDelay: 15000, backoff: 1.3 },
	)

	const handleGenerate = useCallback(async () => {
		setState('generating')
		setError(null)

		const result = await generateHeroMockup(orderId, guestSessionId)

		if (!result.success) {
			setState('fail')
			setError(result.error)
			return
		}

		const { status, imageUrl } = result.data
		if (status === 'success' && imageUrl) {
			setMockupUrl(imageUrl)
			setState('success')
			return
		}
		if (status === 'fail') {
			setState('fail')
			setError('errors.generationFailed')
			return
		}

		startPolling()
	}, [orderId, guestSessionId, startPolling])

	useEffect(() => {
		if (testMode) return
		if (existingMockupUrl) return
		if (hasStartedRef.current) return
		hasStartedRef.current = true
		// Call handleGenerate directly (no setTimeout/cleanup) so React
		// Strict Mode's double-invocation doesn't cancel the pending timer
		// before the second effect run sees `hasStartedRef.current === true`
		// and short-circuits — which would leave the component stuck in
		// `idle` forever. Matches the working pattern in
		// `EnvironmentPreviewGallery`; the `react-hooks/set-state-in-effect`
		// warning this produces is the same pre-existing one tracked in the
		// roadmap and does not affect runtime behaviour.
		// eslint-disable-next-line react-hooks/set-state-in-effect
		handleGenerate()
	}, [testMode, existingMockupUrl, handleGenerate])

	if (state === 'generating') {
		return (
			<div
				className="flex w-full max-w-md flex-col items-center gap-3"
				aria-busy="true"
			>
				<Skeleton
					className={`${ORIENTATION_ASPECT[orientation]} w-full rounded-xl`}
					aria-hidden="true"
				/>
				<GenerationProgressBar
					message={t('progressHeroMockup')}
					isActive
					estimatedDurationMs={25_000}
					className="w-full"
				/>
			</div>
		)
	}

	if (state === 'fail') {
		return (
			<div className="flex w-full max-w-md flex-col items-center gap-4 rounded-xl bg-surface-container-high px-6 py-8">
				<AlertTriangle
					className="size-8 text-destructive"
					aria-hidden="true"
				/>
				<p
					role="alert"
					className="text-center font-sans text-sm text-destructive"
				>
					{error ? translateError(error) : t('heroMockupFailed')}
				</p>
				<Button variant="secondary" size="sm" onClick={handleGenerate}>
					<RefreshCw className="size-4" aria-hidden="true" />
					{t('heroMockupTryAgain')}
				</Button>
			</div>
		)
	}

	if (state === 'success' && mockupUrl) {
		return (
			<div className="flex flex-col items-center gap-3">
				<div
					role="button"
					tabIndex={0}
					aria-label={t('zoomImage')}
					onClick={onImageClick}
					onKeyDown={(e) => {
						if (e.key === 'Enter' || e.key === ' ') {
							e.preventDefault()
							onImageClick()
						}
					}}
					className="group relative cursor-pointer overflow-hidden rounded-xl transition-transform hover:scale-[1.01] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background"
				>
					<ProtectedImage
						src={mockupUrl}
						alt={t('heroMockupAlt')}
						width={800}
						height={800}
						unoptimized
						className="block h-auto w-full max-w-md"
					/>
					<div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
						<div className="flex items-center gap-2 rounded-lg bg-black/60 px-3 py-1.5">
							<Expand
								className="size-4 text-on-scrim"
								aria-hidden="true"
							/>
							<span className="font-sans text-xs font-medium text-on-scrim">
								{t('zoomImage')}
							</span>
						</div>
					</div>
				</div>
				<p className="font-sans text-sm font-medium text-muted-foreground">
					{t('generatedLabel')}
				</p>
			</div>
		)
	}

	return null
}

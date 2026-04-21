'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Image from 'next/image'
import { Loader2, AlertTriangle, RefreshCw, Expand } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
	generateEnvironmentPreviews,
	checkEnvironmentPreviewsStatus,
	type EnvironmentPreviewItem,
} from '@/lib/actions/environment-preview'
import { useActionError } from '@/hooks/use-action-error'
import { usePollingTask } from '@/hooks/use-polling-task'
import { GenerationProgressBar } from '@/components/shop/generation-progress'

const TEST_ENVIRONMENT_PREVIEWS: EnvironmentPreviewItem[] = [
	{
		id: 'test-env-1',
		sceneId: 'test-scene-1',
		sceneName: 'Living Room',
		status: 'success',
		imageUrl: '/images/canvas-enviroment-1.jpeg',
	},
	{
		id: 'test-env-2',
		sceneId: 'test-scene-2',
		sceneName: 'Bedroom',
		status: 'success',
		imageUrl: '/images/canvas-enviroment-2.jpeg',
	},
	{
		id: 'test-env-3',
		sceneId: 'test-scene-3',
		sceneName: 'Office',
		status: 'success',
		imageUrl: '/images/canvas-enviroment-3.jpeg',
	},
]

type EnvPreviewState = 'idle' | 'generating' | 'done' | 'error'

interface EnvironmentPreviewGalleryProps {
	orderId: string
	guestSessionId: string
	testMode?: boolean
	onPreviewsLoaded?: (urls: { url: string; label: string }[]) => void
	onImageClick?: (envIndex: number) => void
}

export function EnvironmentPreviewGallery({
	orderId,
	guestSessionId,
	testMode,
	onPreviewsLoaded,
	onImageClick,
}: EnvironmentPreviewGalleryProps) {
	const t = useTranslations('shop')
	const translateError = useActionError()

	const [state, setState] = useState<EnvPreviewState>(testMode ? 'done' : 'generating')
	const [previews, setPreviews] = useState<EnvironmentPreviewItem[]>(
		testMode ? TEST_ENVIRONMENT_PREVIEWS : [],
	)
	const [error, setError] = useState<string | null>(null)

	const prevLoadedRef = useRef<string>('')
	const hasStartedRef = useRef(false)

	useEffect(() => {
		if (!onPreviewsLoaded) return

		const successPreviews = previews
			.filter((p) => p.status === 'success' && p.imageUrl)
			.map((p) => ({ url: p.imageUrl!, label: p.sceneName }))

		const key = successPreviews.map((p) => p.url).join(',')
		if (key && key !== prevLoadedRef.current) {
			prevLoadedRef.current = key
			onPreviewsLoaded(successPreviews)
		}
	}, [previews, onPreviewsLoaded])

	const { start: startPolling } = usePollingTask(
		() => checkEnvironmentPreviewsStatus(orderId, guestSessionId),
		(result) => {
			if (!result.success) {
				setState('error')
				setError(result.error)
				return 'done'
			}
			setPreviews(result.data.previews)
			if (result.data.allDone) {
				setState('done')
				return 'done'
			}
			return 'continue'
		},
		() => setState('done'),
		{ maxAttempts: 40, initialDelay: 4000, maxDelay: 15000, backoff: 1.3 },
	)

	const handleGenerate = useCallback(async () => {
		setState('generating')
		setError(null)
		setPreviews([])

		const result = await generateEnvironmentPreviews(orderId, guestSessionId)

		if (!result.success) {
			setState('error')
			setError(result.error)
			return
		}

		const { previews: initialPreviews } = result.data
		const allFailed =
			initialPreviews.length > 0 &&
			initialPreviews.every((p) => p.status === 'fail')

		setPreviews(initialPreviews)

		if (allFailed) {
			setState('error')
			setError('errors.generationFailed')
			return
		}

		startPolling()
	}, [orderId, guestSessionId, startPolling])

	useEffect(() => {
		if (testMode || hasStartedRef.current) return
		hasStartedRef.current = true
		handleGenerate()
	}, [testMode, handleGenerate])

	const hasAnyUsablePreview = previews.some(
		(p) => p.status === 'success' || p.status === 'processing' || p.status === 'pending',
	)

	if (state === 'error' && !hasAnyUsablePreview) {
		return (
			<div className="flex flex-col items-center gap-4 rounded-xl bg-surface-container-high px-6 py-8">
				<AlertTriangle className="size-8 text-destructive" aria-hidden="true" />
				<p role="alert" className="font-sans text-sm text-destructive">
					{error ? translateError(error) : t('generationFailed')}
				</p>
				<Button variant="secondary" size="sm" onClick={handleGenerate}>
					<RefreshCw className="size-4" aria-hidden="true" />
					{t('tryAgain')}
				</Button>
			</div>
		)
	}

	const isGenerating = state === 'generating'
	const hasAnyProcessing = previews.some((p) => p.status === 'processing' || p.status === 'pending')

	const progressActive = isGenerating || hasAnyProcessing

	return (
		<div className="flex flex-col gap-4">
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<h2 className="font-heading text-lg font-semibold tracking-[-0.03em] text-foreground">
					{t('environmentPreviewsHeading')}
				</h2>
				{progressActive && (
					<GenerationProgressBar
						message={t('progressEnvironmentPreviews')}
						isActive={progressActive}
						estimatedDurationMs={45_000}
						className="sm:max-w-sm"
					/>
				)}
			</div>

			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{isGenerating && previews.length === 0
					? Array.from({ length: 3 }).map((_, i) => (
							<PreviewCardSkeleton key={i} />
						))
					: previews.map((preview) => {
							const successIndex = onImageClick && preview.status === 'success' && preview.imageUrl
								? previews
									.filter((p) => p.status === 'success' && p.imageUrl)
									.findIndex((p) => p.id === preview.id)
								: -1

							return (
								<PreviewCard
									key={preview.id}
									preview={preview}
									onClick={
										successIndex >= 0
											? () => onImageClick!(successIndex)
											: undefined
									}
								/>
							)
						})}
			</div>
		</div>
	)
}

interface PreviewCardProps {
	preview: EnvironmentPreviewItem
	onClick?: () => void
}

function PreviewCard({ preview, onClick }: PreviewCardProps) {
	const t = useTranslations('shop')

	if (preview.status === 'success' && preview.imageUrl) {
		const isClickable = !!onClick
		return (
			<div className="flex flex-col gap-2">
				<div
					role={isClickable ? 'button' : undefined}
					tabIndex={isClickable ? 0 : undefined}
					aria-label={isClickable ? t('zoomImage') : undefined}
					onClick={onClick}
					onKeyDown={
						isClickable
							? (e) => {
									if (e.key === 'Enter' || e.key === ' ') {
										e.preventDefault()
										onClick?.()
									}
								}
							: undefined
					}
					className={`group overflow-hidden rounded-xl bg-surface-container-high p-2${
						isClickable
							? ' cursor-pointer transition-transform hover:scale-[1.01] active:scale-[0.99]'
							: ''
					}`}
				>
					<div className="relative overflow-hidden rounded-lg">
						<Image
							src={preview.imageUrl}
							alt={t('roomPreviewAlt', { sceneName: preview.sceneName })}
							width={600}
							height={400}
							unoptimized
							className="h-auto w-full object-cover"
						/>
						{isClickable && (
							<div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-opacity group-hover:bg-black/20 group-hover:opacity-100">
								<div className="flex items-center gap-2 rounded-lg bg-black/60 px-3 py-1.5">
									<Expand className="size-4 text-on-scrim" aria-hidden="true" />
									<span className="font-sans text-xs font-medium text-on-scrim">
										{t('zoomImage')}
									</span>
								</div>
							</div>
						)}
					</div>
				</div>
				<p className="text-center font-sans text-xs font-medium text-muted-foreground">
					{preview.sceneName}
				</p>
			</div>
		)
	}

	if (preview.status === 'fail') {
		return (
			<div className="flex flex-col gap-2">
				<div className="flex aspect-[3/2] flex-col items-center justify-center gap-2 rounded-xl bg-surface-container-high">
					<AlertTriangle className="size-5 text-destructive/60" aria-hidden="true" />
					<p role="alert" className="font-sans text-xs text-muted-foreground">
						{t('previewFailed')}
					</p>
				</div>
				<p className="text-center font-sans text-xs font-medium text-muted-foreground">
					{preview.sceneName}
				</p>
			</div>
		)
	}

	return (
		<div className="flex flex-col gap-2">
			<div className="flex aspect-[3/2] items-center justify-center rounded-xl bg-surface-container-high">
				<div className="flex flex-col items-center gap-2">
					<Loader2
						className="size-6 animate-spin text-brand/50"
						aria-hidden="true"
					/>
					<p role="status" className="font-sans text-xs text-muted-foreground">
						{t('generatingPreviews')}
					</p>
				</div>
			</div>
			<p className="text-center font-sans text-xs font-medium text-muted-foreground">
				{preview.sceneName}
			</p>
		</div>
	)
}

function PreviewCardSkeleton() {
	return (
		<div className="flex flex-col gap-2">
			<Skeleton className="aspect-[3/2] w-full rounded-xl" />
			<Skeleton className="mx-auto h-3 w-24 rounded" />
		</div>
	)
}

'use client'

import Image from 'next/image'
import { Sparkles, AlertTriangle, Clock } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { GenerationProgress } from '@/components/shop/generation-progress'
import { GenerationResult } from '@/components/shop/generation-result'
import type { FormatOption } from '@/components/shop/format-picker'
import type { OrientationValue } from '@/validators/order'

export type GenerationState =
	| 'idle'
	| 'submitting'
	| 'processing'
	| 'success'
	| 'error'

interface ArtPreviewProps {
	file: File | null
	selectedStyleId: string | null
	selectedStyleSlug: string | null
	selectedOrientation: OrientationValue | null
	stylePriceCents: number
	formats: FormatOption[]
	previewUrl: string | null
	generationState: GenerationState
	generatedImageUrl: string | null
	generatedWidthPx: number | null
	generatedHeightPx: number | null
	errorMessage: string | null
	errorMeta?: Record<string, unknown> | null
	orderId: string | null
	guestSessionId: string
	testMode?: boolean
	onGenerate: () => void
	onReset: () => void
}

const SLUG_TO_I18N: Record<string, string> = {
	'watercolor': 'watercolor',
	'oil-painting': 'oilPainting',
	'charcoal-sketch': 'charcoalSketch',
	'anime': 'anime',
	'impressionism': 'impressionism',
}

export function ArtPreview({
	file,
	selectedStyleId,
	selectedStyleSlug,
	selectedOrientation,
	stylePriceCents,
	formats,
	previewUrl,
	generationState,
	generatedImageUrl,
	generatedWidthPx,
	generatedHeightPx,
	errorMessage,
	errorMeta,
	orderId,
	guestSessionId,
	testMode,
	onGenerate,
	onReset,
}: ArtPreviewProps) {
	const tShop = useTranslations('shop')
	const tStyles = useTranslations('styles')
	const tErrors = useTranslations('errors')
	const isReady = !!file && !!selectedStyleId && !!selectedOrientation

	if (generationState === 'processing' || generationState === 'submitting') {
		return <GenerationProgress />
	}

	if (generationState === 'success' && generatedImageUrl && orderId) {
		return (
			<GenerationResult
				generatedImageUrl={generatedImageUrl}
				originalPreviewUrl={previewUrl}
				orderId={orderId}
				guestSessionId={guestSessionId}
				formats={formats}
				selectedOrientation={selectedOrientation}
				stylePriceCents={stylePriceCents}
				generatedWidthPx={generatedWidthPx}
				generatedHeightPx={generatedHeightPx}
				testMode={testMode}
				onReset={onReset}
			/>
		)
	}

	if (generationState === 'error') {
		const isRateLimited = errorMessage === 'errors.rateLimited'
		const minutes = errorMeta?.minutes as number | undefined
		const maxRequests = errorMeta?.maxRequests as number | undefined

		let displayMessage: string
		if (isRateLimited && minutes && maxRequests) {
			displayMessage = tErrors('rateLimited', { minutes, maxRequests })
		} else if (isRateLimited) {
			displayMessage = tErrors('rateLimitedGeneric')
		} else if (errorMessage?.startsWith('errors.')) {
			displayMessage = tErrors(
				errorMessage.replace('errors.', '') as Parameters<typeof tErrors>[0],
			)
		} else {
			displayMessage = tShop('generationFailed')
		}

		return (
			<div className="flex flex-col items-center justify-center gap-4 rounded-xl bg-surface-container-high px-6 py-16">
				{isRateLimited ? (
					<Clock className="size-8 text-warning" aria-hidden="true" />
				) : (
					<AlertTriangle className="size-8 text-destructive" aria-hidden="true" />
				)}
				<p
					role="alert"
					className={`max-w-md text-center font-sans text-sm ${isRateLimited ? 'text-warning' : 'text-destructive'}`}
				>
					{displayMessage}
				</p>
				<Button variant="secondary" size="sm" onClick={onReset}>
					{tShop('tryAgain')}
				</Button>
			</div>
		)
	}

	if (!isReady) {
		return (
			<div className="flex flex-col items-center justify-center gap-4 rounded-xl bg-surface-container-high px-6 py-16">
				<Sparkles
					className="size-8 text-muted-foreground/40"
					aria-hidden="true"
				/>
				<p className="font-sans text-sm text-muted-foreground">
					{tShop('readyToGenerate')}
				</p>
			</div>
		)
	}

	return (
		<div className="flex flex-col gap-6">
			<div className="flex items-center gap-4 overflow-hidden rounded-xl bg-surface-container-high p-4">
				<div className="relative aspect-square w-20 shrink-0 overflow-hidden rounded-lg">
					{previewUrl && (
						<Image
							src={previewUrl}
							alt={tShop('uploadedPreviewAlt')}
							fill
							className="object-cover"
						/>
					)}
				</div>
				<div className="flex flex-col gap-1">
					<p className="font-sans text-sm font-medium text-foreground">
						{file.name}
					</p>
					<p className="font-sans text-xs text-muted-foreground">
						{selectedStyleSlug
							? tStyles(
									(SLUG_TO_I18N[selectedStyleSlug] ??
										selectedStyleSlug) as Parameters<typeof tStyles>[0],
								)
							: null}
					</p>
				</div>
			</div>

			<Button
				variant="brand"
				size="lg"
				className="w-full"
				onClick={onGenerate}
			>
				<Sparkles className="size-4" aria-hidden="true" />
				{tShop('generateButton')}
			</Button>
		</div>
	)
}

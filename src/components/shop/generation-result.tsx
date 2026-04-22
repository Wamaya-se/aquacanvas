'use client'

import { useState, useCallback, useMemo } from 'react'
import { useRouter } from '@/i18n/navigation'
import Image from 'next/image'
import { Download, ShoppingBag, RotateCcw, FlaskConical, Loader2, Tag, Expand, AlertTriangle } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createCheckoutSession, simulatePurchase } from '@/lib/actions/checkout'
import { useActionError } from '@/hooks/use-action-error'
import { FormatPicker, type FormatOption } from '@/components/shop/format-picker'
import { EnvironmentPreviewGallery } from '@/components/shop/environment-preview-gallery'
import { HeroMockup } from '@/components/shop/hero-mockup'
import { ImageLightbox } from '@/components/shop/image-lightbox'
import {
	computeFormatEligibility,
	hasAnyEligibleFormat,
	type FormatEligibility,
} from '@/lib/format-eligibility'
import { resolveHeroMockupOrientation } from '@/lib/hero-mockup-scenes'
import type { OrientationValue } from '@/validators/order'

interface GenerationResultProps {
	generatedImageUrl: string
	originalPreviewUrl: string | null
	orderId: string
	guestSessionId: string
	formats: FormatOption[]
	selectedOrientation: OrientationValue | null
	stylePriceCents: number
	generatedWidthPx: number | null
	generatedHeightPx: number | null
	heroMockupUrl: string | null
	testMode?: boolean
	onReset: () => void
	onHeroMockupReady: (url: string) => void
}

interface LightboxImage {
	src: string
	alt: string
}

export function GenerationResult({
	generatedImageUrl,
	originalPreviewUrl,
	orderId,
	guestSessionId,
	formats,
	selectedOrientation,
	stylePriceCents,
	generatedWidthPx,
	generatedHeightPx,
	heroMockupUrl,
	testMode,
	onReset,
	onHeroMockupReady,
}: GenerationResultProps) {
	const t = useTranslations('shop')
	const tCheckout = useTranslations('checkout')
	const translateError = useActionError()
	const router = useRouter()

	const [checkoutLoading, setCheckoutLoading] = useState(false)
	const [simulateLoading, setSimulateLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [discountCode, setDiscountCode] = useState('')
	const [selectedFormatId, setSelectedFormatId] = useState<string | null>(null)

	const [lightboxOpen, setLightboxOpen] = useState(false)
	const [lightboxIndex, setLightboxIndex] = useState(0)
	const [envPreviewImages, setEnvPreviewImages] = useState<LightboxImage[]>([])

	const isDev = process.env.NODE_ENV !== 'production'

	const filteredFormats = useMemo(
		() =>
			selectedOrientation
				? formats.filter((f) => f.orientation === selectedOrientation)
				: formats,
		[formats, selectedOrientation],
	)

	// Compute DPI eligibility once per (formats, dims) pair. When the AI
	// dimensions weren't captured (e.g. sharp probe failed server-side, or
	// we're on a legacy order reopened via session storage) we fall back to
	// `undefined` which keeps every format selectable — `createCheckoutSession`
	// still guards server-side, so the worst case is slightly optimistic UI.
	const eligibility = useMemo<Record<string, FormatEligibility> | undefined>(() => {
		if (!generatedWidthPx || !generatedHeightPx) return undefined
		const map: Record<string, FormatEligibility> = {}
		for (const f of filteredFormats) {
			map[f.id] = computeFormatEligibility(generatedWidthPx, generatedHeightPx, {
				widthCm: f.widthCm,
				heightCm: f.heightCm,
			})
		}
		return map
	}, [filteredFormats, generatedWidthPx, generatedHeightPx])

	const allFormatsBlocked =
		eligibility !== undefined &&
		filteredFormats.length > 0 &&
		!hasAnyEligibleFormat(eligibility)

	// If the selected format is blocked after eligibility resolves (race:
	// user selected before dims arrived), drop the selection so the empty
	// state / checkout button reflects reality.
	const effectiveSelectedFormatId = useMemo(() => {
		if (!selectedFormatId) return null
		if (!eligibility) return selectedFormatId
		const grade = eligibility[selectedFormatId]?.grade
		return grade === 'red' ? null : selectedFormatId
	}, [selectedFormatId, eligibility])

	const heroOrientation = useMemo(
		() => resolveHeroMockupOrientation(
			selectedOrientation,
			generatedWidthPx,
			generatedHeightPx,
		),
		[selectedOrientation, generatedWidthPx, generatedHeightPx],
	)

	const baseImages = useMemo<LightboxImage[]>(() => {
		const images: LightboxImage[] = []
		if (heroMockupUrl) {
			images.push({ src: heroMockupUrl, alt: t('heroMockupAlt') })
		}
		images.push({ src: generatedImageUrl, alt: t('generatedLabel') })
		if (originalPreviewUrl) {
			images.push({ src: originalPreviewUrl, alt: t('originalLabel') })
		}
		return images
	}, [heroMockupUrl, generatedImageUrl, originalPreviewUrl, t])

	const heroMockupSlideIndex = heroMockupUrl ? 0 : -1

	const allSlides = useMemo(
		() => [...baseImages, ...envPreviewImages].map((img) => ({
			src: img.src,
			alt: img.alt,
		})),
		[baseImages, envPreviewImages],
	)

	const envStartIndex = baseImages.length

	function handleImageClick(index: number) {
		setLightboxIndex(index)
		setLightboxOpen(true)
	}

	function handleEnvImageClick(envIndex: number) {
		setLightboxIndex(envStartIndex + envIndex)
		setLightboxOpen(true)
	}

	const handlePreviewsLoaded = useCallback(
		(urls: { url: string; label: string }[]) => {
			setEnvPreviewImages(
				urls.map((u) => ({
					src: u.url,
					alt: t('roomPreviewAlt', { sceneName: u.label }),
				})),
			)
		},
		[t],
	)

	async function handleCheckout() {
		if (!effectiveSelectedFormatId) {
			setError(translateError('errors.formatRequired'))
			return
		}

		setCheckoutLoading(true)
		setError(null)

		const result = await createCheckoutSession(
			orderId,
			guestSessionId,
			discountCode || undefined,
			effectiveSelectedFormatId,
		)

		if (!result.success) {
			setError(translateError(result.error))
			setCheckoutLoading(false)
			return
		}

		window.location.href = result.data.url
	}

	async function handleSimulate() {
		if (!effectiveSelectedFormatId) {
			setError(translateError('errors.formatRequired'))
			return
		}

		setSimulateLoading(true)
		setError(null)

		const result = await simulatePurchase(orderId, guestSessionId, effectiveSelectedFormatId)

		if (!result.success) {
			setError(translateError(result.error))
			setSimulateLoading(false)
			return
		}

		router.push(`/checkout/success?order_id=${result.data.orderId}`)
	}

	return (
		<div className="flex flex-col gap-8">
			<p className="text-center font-heading text-xl font-semibold tracking-[-0.03em] text-foreground sm:text-2xl">
				{t('generationComplete')}
			</p>

			<div className="flex flex-col items-center gap-6">
				{heroOrientation ? (
					<HeroMockup
						orderId={orderId}
						guestSessionId={guestSessionId}
						orientation={heroOrientation}
						existingMockupUrl={heroMockupUrl}
						testMode={testMode}
						onMockupReady={onHeroMockupReady}
						onImageClick={() =>
							handleImageClick(
								heroMockupSlideIndex >= 0 ? heroMockupSlideIndex : 0,
							)
						}
					/>
				) : (
					<ClickableImage
						src={generatedImageUrl}
						alt={t('generatedPreviewAlt')}
						hintText={t('zoomImage')}
						onClick={() => handleImageClick(0)}
					/>
				)}
			</div>

			<EnvironmentPreviewGallery
				orderId={orderId}
				guestSessionId={guestSessionId}
				testMode={testMode}
				onPreviewsLoaded={handlePreviewsLoaded}
				onImageClick={handleEnvImageClick}
			/>

			{!testMode && filteredFormats.length > 0 && (
				<div className="flex flex-col gap-3">
					<h2 className="font-heading text-lg font-semibold tracking-[-0.03em] text-foreground">
						{t('chooseFormat')}
					</h2>
					{allFormatsBlocked ? (
						<LowResolutionBlock onReset={onReset} />
					) : (
						<FormatPicker
							formats={filteredFormats}
							selected={effectiveSelectedFormatId}
							onSelect={setSelectedFormatId}
							stylePriceCents={stylePriceCents}
							eligibility={eligibility}
						/>
					)}
				</div>
			)}

			{!testMode && !allFormatsBlocked && (
				<div className="flex items-center gap-2">
					<Tag className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
					<Input
						placeholder={t('discountCodePlaceholder')}
						aria-label={t('discountCodePlaceholder')}
						value={discountCode}
						onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
						className="flex-1 uppercase"
						maxLength={50}
					/>
				</div>
			)}

			{error && (
				<p role="alert" className="text-center font-sans text-sm text-destructive">
					{error}
				</p>
			)}

			{!testMode && !allFormatsBlocked && (
				<>
					<div className="flex flex-col gap-3 sm:flex-row">
						<Button
							variant="brand"
							size="lg"
							className="flex-1"
							asChild
						>
							<a
								href={generatedImageUrl}
								download="aquacanvas-artwork.png"
								target="_blank"
								rel="noopener noreferrer"
							>
								<Download className="size-4" aria-hidden="true" />
								{t('downloadArtwork')}
							</a>
						</Button>
						<Button
							variant="secondary"
							size="lg"
							className="flex-1"
							disabled={checkoutLoading || !effectiveSelectedFormatId}
							onClick={handleCheckout}
						>
							{checkoutLoading ? (
								<Loader2 className="size-4 animate-spin" aria-hidden="true" />
							) : (
								<ShoppingBag className="size-4" aria-hidden="true" />
							)}
							{checkoutLoading ? tCheckout('processing') : t('orderPrint')}
						</Button>
					</div>

					{isDev && (
						<Button
							variant="outline"
							size="lg"
							className="w-full border-dashed border-warning/50 text-warning hover:bg-warning/10"
							disabled={simulateLoading || !effectiveSelectedFormatId}
							onClick={handleSimulate}
						>
							{simulateLoading ? (
								<Loader2 className="size-4 animate-spin" aria-hidden="true" />
							) : (
								<FlaskConical className="size-4" aria-hidden="true" />
							)}
							{tCheckout('simulatePurchase')}
						</Button>
					)}
				</>
			)}

			<Button
				variant="ghost"
				size="sm"
				onClick={onReset}
				className="mx-auto"
			>
				<RotateCcw className="size-4" aria-hidden="true" />
				{t('tryAgain')}
			</Button>

			<ImageLightbox
				slides={allSlides}
				open={lightboxOpen}
				index={lightboxIndex}
				onClose={() => setLightboxOpen(false)}
			/>
		</div>
	)
}

interface LowResolutionBlockProps {
	onReset: () => void
}

function LowResolutionBlock({ onReset }: LowResolutionBlockProps) {
	const tShop = useTranslations('shop')

	return (
		<div
			role="alert"
			className="flex flex-col items-center gap-4 rounded-xl bg-warning/10 px-6 py-8 text-center"
		>
			<AlertTriangle className="size-8 text-warning" aria-hidden="true" />
			<div className="flex flex-col gap-2">
				<p className="font-heading text-base font-semibold tracking-[-0.03em] text-foreground">
					{tShop('dpiAllFormatsTooLowTitle')}
				</p>
				<p className="max-w-sm font-sans text-sm text-muted-foreground">
					{tShop('dpiAllFormatsTooLowBody')}
				</p>
			</div>
			<Button variant="secondary" size="sm" onClick={onReset}>
				{tShop('dpiUploadBigger')}
			</Button>
		</div>
	)
}

interface ClickableImageProps {
	src: string
	alt: string
	hintText: string
	onClick: () => void
}

function ClickableImage({ src, alt, hintText, onClick }: ClickableImageProps) {
	return (
		<div
			role="button"
			tabIndex={0}
			aria-label={hintText}
			onClick={onClick}
			onKeyDown={(e) => {
				if (e.key === 'Enter' || e.key === ' ') {
					e.preventDefault()
					onClick()
				}
			}}
			className="group cursor-pointer overflow-hidden rounded-xl bg-surface-container-high p-2 shadow-[0_4px_40px_rgba(0,0,0,0.06)] transition-transform hover:scale-[1.01] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background"
		>
			<div className="relative overflow-hidden rounded-lg">
				<Image
					src={src}
					alt={alt}
					width={600}
					height={600}
					unoptimized
					className="h-auto w-full object-cover"
				/>
				<div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-opacity group-hover:bg-black/20 group-hover:opacity-100">
					<div className="flex items-center gap-2 rounded-lg bg-black/60 px-3 py-1.5">
						<Expand className="size-4 text-on-scrim" aria-hidden="true" />
						<span className="font-sans text-xs font-medium text-on-scrim">
							{hintText}
						</span>
					</div>
				</div>
			</div>
		</div>
	)
}


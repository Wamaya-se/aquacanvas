'use client'

import { useState, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Download, ShoppingBag, RotateCcw, FlaskConical, Loader2, Tag, Expand } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createCheckoutSession, simulatePurchase } from '@/lib/actions/checkout'
import { useActionError } from '@/hooks/use-action-error'
import { FormatPicker, type FormatOption } from '@/components/shop/format-picker'
import { EnvironmentPreviewGallery } from '@/components/shop/environment-preview-gallery'
import { ImageLightbox } from '@/components/shop/image-lightbox'
import type { OrientationValue } from '@/validators/order'

interface GenerationResultProps {
	generatedImageUrl: string
	originalPreviewUrl: string | null
	orderId: string
	guestSessionId: string
	formats: FormatOption[]
	selectedOrientation: OrientationValue | null
	stylePriceCents: number
	testMode?: boolean
	onReset: () => void
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
	testMode,
	onReset,
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

	const baseImages = useMemo<LightboxImage[]>(() => {
		const images: LightboxImage[] = []
		if (originalPreviewUrl) {
			images.push({ src: originalPreviewUrl, alt: t('originalLabel') })
		}
		images.push({ src: generatedImageUrl, alt: t('generatedLabel') })
		return images
	}, [originalPreviewUrl, generatedImageUrl, t])

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
		if (!selectedFormatId) {
			setError(translateError('errors.formatRequired'))
			return
		}

		setCheckoutLoading(true)
		setError(null)

		const result = await createCheckoutSession(
			orderId,
			guestSessionId,
			discountCode || undefined,
			selectedFormatId,
		)

		if (!result.success) {
			setError(translateError(result.error))
			setCheckoutLoading(false)
			return
		}

		window.location.href = result.data.url
	}

	async function handleSimulate() {
		if (!selectedFormatId) {
			setError(translateError('errors.formatRequired'))
			return
		}

		setSimulateLoading(true)
		setError(null)

		const result = await simulatePurchase(orderId, guestSessionId, selectedFormatId)

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
				<CanvasMockup
					src={generatedImageUrl}
					alt={t('generatedPreviewAlt')}
					hintText={t('zoomImage')}
					onClick={() => handleImageClick(originalPreviewUrl ? 1 : 0)}
				/>

				{originalPreviewUrl && (
					<div className="flex w-full max-w-xs flex-col items-center gap-2">
						<p className="font-sans text-xs font-medium text-muted-foreground">
							{t('originalLabel')}
						</p>
						<ClickableImage
							src={originalPreviewUrl}
							alt={t('uploadedPreviewAlt')}
							hintText={t('zoomImage')}
							onClick={() => handleImageClick(0)}
						/>
					</div>
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
					<FormatPicker
						formats={filteredFormats}
						selected={selectedFormatId}
						onSelect={setSelectedFormatId}
						stylePriceCents={stylePriceCents}
					/>
				</div>
			)}

			{!testMode && (
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

			{!testMode && (
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
							disabled={checkoutLoading || !selectedFormatId}
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
							disabled={simulateLoading || !selectedFormatId}
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
			className="group cursor-pointer overflow-hidden rounded-xl bg-surface-container-high p-2 shadow-[0_4px_40px_rgba(0,0,0,0.06)] transition-transform hover:scale-[1.01] active:scale-[0.99]"
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

interface CanvasMockupProps {
	src: string
	alt: string
	hintText: string
	onClick: () => void
}

function CanvasMockup({ src, alt, hintText, onClick }: CanvasMockupProps) {
	const t = useTranslations('shop')

	return (
		<div className="flex flex-col items-center gap-3">
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
				className="group relative cursor-pointer transition-transform hover:scale-[1.01] active:scale-[0.99]"
			>
				<div className="rounded-sm bg-gradient-to-br from-[#c8a97e] via-[#b8956a] to-[#a07850] p-[6px] shadow-[0_8px_40px_rgba(0,0,0,0.15),0_2px_8px_rgba(0,0,0,0.1)]">
					<div className="rounded-[1px] bg-gradient-to-br from-[#d4b896] to-[#c0a07a] p-[2px]">
						<div className="relative overflow-hidden">
							<Image
								src={src}
								alt={alt}
								width={600}
								height={600}
								unoptimized
								className="block h-auto w-full"
							/>
							<div
								className="pointer-events-none absolute inset-0 opacity-[0.04] mix-blend-multiply"
								style={{
									backgroundImage:
										'repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(0,0,0,0.15) 1px, transparent 2px), repeating-linear-gradient(90deg, transparent, transparent 1px, rgba(0,0,0,0.15) 1px, transparent 2px)',
									backgroundSize: '3px 3px',
								}}
								aria-hidden="true"
							/>
						</div>
					</div>
				</div>

				<div
					className="pointer-events-none absolute -bottom-3 left-2 right-2 h-4 rounded-full opacity-20 blur-md"
					style={{ background: 'radial-gradient(ellipse, rgba(0,0,0,0.4) 0%, transparent 70%)' }}
					aria-hidden="true"
				/>

				<div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
					<div className="flex items-center gap-2 rounded-lg bg-black/60 px-3 py-1.5">
						<Expand className="size-4 text-on-scrim" aria-hidden="true" />
						<span className="font-sans text-xs font-medium text-on-scrim">
							{hintText}
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

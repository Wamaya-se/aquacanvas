'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Download, ShoppingBag, RotateCcw, FlaskConical, Loader2, Tag } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createCheckoutSession, simulatePurchase } from '@/lib/actions/checkout'
import { useActionError } from '@/hooks/use-action-error'
import { FormatPicker, type FormatOption } from '@/components/shop/format-picker'

interface GenerationResultProps {
	generatedImageUrl: string
	originalPreviewUrl: string | null
	orderId: string
	guestSessionId: string
	formats: FormatOption[]
	stylePriceCents: number
	onReset: () => void
}

export function GenerationResult({
	generatedImageUrl,
	originalPreviewUrl,
	orderId,
	guestSessionId,
	formats,
	stylePriceCents,
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

	const isDev = process.env.NODE_ENV !== 'production'

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

			<div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
				{originalPreviewUrl && (
					<div className="flex flex-col gap-2">
						<p className="font-sans text-sm font-medium text-muted-foreground">
							{t('originalLabel')}
						</p>
						<div className="overflow-hidden rounded-xl bg-surface-container-high p-2 shadow-[0_4px_40px_rgba(0,0,0,0.06)]">
							<Image
								src={originalPreviewUrl}
								alt={t('uploadedPreviewAlt')}
								width={600}
								height={600}
								unoptimized
								className="h-auto w-full rounded-lg object-cover"
							/>
						</div>
					</div>
				)}
				<div className="flex flex-col gap-2">
					<p className="font-sans text-sm font-medium text-muted-foreground">
						{t('generatedLabel')}
					</p>
					<div className="overflow-hidden rounded-xl bg-surface-container-high p-2 shadow-[0_4px_40px_rgba(0,0,0,0.06)]">
						<Image
							src={generatedImageUrl}
							alt={t('generatedPreviewAlt')}
							width={600}
							height={600}
							unoptimized
							className="h-auto w-full rounded-lg object-cover"
						/>
					</div>
				</div>
			</div>

			{formats.length > 0 && (
				<div className="flex flex-col gap-3">
					<h2 className="font-heading text-lg font-semibold tracking-[-0.03em] text-foreground">
						{t('chooseFormat')}
					</h2>
					<FormatPicker
						formats={formats}
						selected={selectedFormatId}
						onSelect={setSelectedFormatId}
						stylePriceCents={stylePriceCents}
					/>
				</div>
			)}

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

			{error && (
				<p role="alert" className="text-center font-sans text-sm text-destructive">
					{error}
				</p>
			)}

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

			<Button
				variant="ghost"
				size="sm"
				onClick={onReset}
				className="mx-auto"
			>
				<RotateCcw className="size-4" aria-hidden="true" />
				{t('tryAgain')}
			</Button>
		</div>
	)
}

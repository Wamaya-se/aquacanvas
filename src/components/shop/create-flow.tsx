'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { useTranslations } from 'next-intl'
import { ImageUpload } from '@/components/shop/image-upload'
import { StylePicker, type StyleOption } from '@/components/shop/style-picker'
import { OrientationPicker } from '@/components/shop/orientation-picker'
import { ArtPreview, type GenerationState } from '@/components/shop/art-preview'
import { generateArtwork, checkGenerationStatus } from '@/lib/actions/ai'
import type { FormatOption } from '@/components/shop/format-picker'
import type { OrientationValue } from '@/validators/order'
import { usePollingTask } from '@/hooks/use-polling-task'

const GUEST_SESSION_KEY = 'aquacanvas_guest_session'

function getOrCreateGuestSession(): string {
	if (typeof window === 'undefined') return crypto.randomUUID()
	const existing = sessionStorage.getItem(GUEST_SESSION_KEY)
	if (existing) return existing
	const id = crypto.randomUUID()
	sessionStorage.setItem(GUEST_SESSION_KEY, id)
	return id
}

const TEST_IMAGES = {
	original: '/images/hero-before.jpg',
	generated: '/images/hero-after.png',
	orderId: 'test-order-00000000-0000-0000-0000-000000000000',
}

interface CreateFlowProps {
	styles: StyleOption[]
	formats: FormatOption[]
	lockedStyleId?: string
	testMode?: boolean
}

export function CreateFlow({ styles, formats, lockedStyleId, testMode }: CreateFlowProps) {
	const tShop = useTranslations('shop')
	const guestSessionId = useMemo(() => getOrCreateGuestSession(), [])

	const [file, setFile] = useState<File | null>(null)
	const [selectedStyleId, setSelectedStyleId] = useState<string | null>(lockedStyleId ?? null)
	const [previewUrl, setPreviewUrl] = useState<string | null>(null)
	const [selectedOrientation, setSelectedOrientation] = useState<OrientationValue | null>(null)
	const [detectedOrientation, setDetectedOrientation] = useState<OrientationValue | null>(null)

	const isStyleLocked = !!lockedStyleId

	const selectedStyle = selectedStyleId
		? styles.find((s) => s.id === selectedStyleId) ?? null
		: null

	const [generationState, setGenerationState] = useState<GenerationState>(
		testMode ? 'success' : 'idle',
	)
	const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(
		testMode ? TEST_IMAGES.generated : null,
	)
	const [generatedWidthPx, setGeneratedWidthPx] = useState<number | null>(null)
	const [generatedHeightPx, setGeneratedHeightPx] = useState<number | null>(null)
	const [heroMockupUrl, setHeroMockupUrl] = useState<string | null>(null)
	const [errorMessage, setErrorMessage] = useState<string | null>(null)
	const [errorMeta, setErrorMeta] = useState<Record<string, unknown> | null>(null)
	const [orderId, setOrderId] = useState<string | null>(
		testMode ? TEST_IMAGES.orderId : null,
	)

	const activeTaskRef = useRef<{ taskId: string; orderId: string } | null>(null)

	useEffect(() => {
		if (testMode) {
			setPreviewUrl(TEST_IMAGES.original)
			setDetectedOrientation('portrait')
			setSelectedOrientation('portrait')
			return
		}
		if (file) {
			const url = URL.createObjectURL(file)
			setPreviewUrl(url)

			const img = new window.Image()
			img.onload = () => {
				let detected: OrientationValue
				if (img.naturalWidth > img.naturalHeight) {
					detected = 'landscape'
				} else if (img.naturalWidth < img.naturalHeight) {
					detected = 'portrait'
				} else {
					detected = 'square'
				}
				setDetectedOrientation(detected)
				setSelectedOrientation(detected)
			}
			img.src = url

			return () => URL.revokeObjectURL(url)
		}
		setPreviewUrl(null)
		setDetectedOrientation(null)
		setSelectedOrientation(null)
	}, [file, testMode])

	const { start: startPolling, stop: stopPolling } = usePollingTask(
		async () => {
			const task = activeTaskRef.current
			if (!task) return null
			return checkGenerationStatus(task.taskId, task.orderId, guestSessionId)
		},
		(result) => {
			if (!result) return 'done'
			if (!result.success) {
				setGenerationState('error')
				setErrorMessage(result.error)
				return 'done'
			}
			const {
				state,
				generatedImageUrl: url,
				generatedWidthPx: genW,
				generatedHeightPx: genH,
			} = result.data
			if (state === 'success' && url) {
				setGenerationState('success')
				setGeneratedImageUrl(url)
				setGeneratedWidthPx(genW)
				setGeneratedHeightPx(genH)
				return 'done'
			}
			if (state === 'fail') {
				setGenerationState('error')
				setErrorMessage('errors.generationFailed')
				return 'done'
			}
			return 'continue'
		},
		() => {
			setGenerationState('error')
			setErrorMessage('errors.generationTimeout')
		},
		{ maxAttempts: 60, initialDelay: 3000, maxDelay: 15000, backoff: 1.3 },
	)

	async function handleGenerate() {
		if (!file || !selectedStyleId || !selectedOrientation) return

		setGenerationState('submitting')
		setErrorMessage(null)
		setErrorMeta(null)
		setGeneratedImageUrl(null)
		setGeneratedWidthPx(null)
		setGeneratedHeightPx(null)
		setHeroMockupUrl(null)
		setOrderId(null)

		const formData = new FormData()
		formData.append('photo', file)
		formData.append('styleId', selectedStyleId)
		formData.append('guestSessionId', guestSessionId)
		formData.append('orientation', selectedOrientation)

		const result = await generateArtwork(formData)

		if (!result.success) {
			setGenerationState('error')
			setErrorMessage(result.error)
			setErrorMeta(result.meta ?? null)
			return
		}

		setOrderId(result.data.orderId)
		setGenerationState('processing')
		activeTaskRef.current = {
			taskId: result.data.taskId,
			orderId: result.data.orderId,
		}
		startPolling()
	}

	function handleReset() {
		stopPolling()
		activeTaskRef.current = null
		setGenerationState('idle')
		setGeneratedImageUrl(null)
		setGeneratedWidthPx(null)
		setGeneratedHeightPx(null)
		setHeroMockupUrl(null)
		setErrorMessage(null)
		setErrorMeta(null)
		setOrderId(null)
		setFile(null)
		setDetectedOrientation(null)
		setSelectedOrientation(null)
		if (!isStyleLocked) setSelectedStyleId(null)
	}

	return (
		<div className="flex flex-col gap-12">
		{generationState === 'idle' || generationState === 'error' ? (
			isStyleLocked ? (
				<>
					<div className="flex flex-col gap-4">
						<h2 className="font-heading text-lg font-semibold tracking-[-0.03em] text-foreground">
							{tShop('uploadPhoto')}
						</h2>
						<ImageUpload file={file} onFileChange={setFile} />
					</div>

					{file && detectedOrientation && (
						<div className="flex flex-col gap-4">
							<h2 className="font-heading text-lg font-semibold tracking-[-0.03em] text-foreground">
								{tShop('chooseOrientation')}
							</h2>
							<OrientationPicker
								selected={selectedOrientation}
								detectedOrientation={detectedOrientation}
								onSelect={setSelectedOrientation}
							/>
						</div>
					)}
				</>
			) : (
				<div className="flex flex-col gap-8">
					<div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
						<div className="flex flex-col gap-4">
							<h2 className="font-heading text-lg font-semibold tracking-[-0.03em] text-foreground">
								{tShop('uploadPhoto')}
							</h2>
							<ImageUpload file={file} onFileChange={setFile} />
						</div>

						<div className="flex flex-col gap-4">
							<h2 className="font-heading text-lg font-semibold tracking-[-0.03em] text-foreground">
								{tShop('chooseStyle')}
							</h2>
							<StylePicker
								styles={styles}
								selected={selectedStyleId}
								onSelect={setSelectedStyleId}
							/>
						</div>
					</div>

					{file && detectedOrientation && (
						<div className="flex flex-col gap-4">
							<h2 className="font-heading text-lg font-semibold tracking-[-0.03em] text-foreground">
								{tShop('chooseOrientation')}
							</h2>
							<OrientationPicker
								selected={selectedOrientation}
								detectedOrientation={detectedOrientation}
								onSelect={setSelectedOrientation}
							/>
						</div>
					)}
				</div>
			)
		) : null}

			<div>
				{generationState === 'idle' || generationState === 'error' ? (
					<h2 className="mb-4 font-heading text-lg font-semibold tracking-[-0.03em] text-foreground">
						{tShop('preview')}
					</h2>
				) : null}
			<ArtPreview
				file={file}
				selectedStyleId={selectedStyleId}
				selectedStyleSlug={selectedStyle?.slug ?? null}
				selectedOrientation={selectedOrientation}
				stylePriceCents={selectedStyle?.priceCents ?? 0}
				formats={formats}
				previewUrl={previewUrl}
				generationState={generationState}
				generatedImageUrl={generatedImageUrl}
				generatedWidthPx={generatedWidthPx}
				generatedHeightPx={generatedHeightPx}
				heroMockupUrl={heroMockupUrl}
				errorMessage={errorMessage}
				errorMeta={errorMeta}
				orderId={orderId}
				guestSessionId={guestSessionId}
				testMode={testMode}
				onGenerate={handleGenerate}
				onReset={handleReset}
				onHeroMockupReady={setHeroMockupUrl}
			/>
			</div>
		</div>
	)
}

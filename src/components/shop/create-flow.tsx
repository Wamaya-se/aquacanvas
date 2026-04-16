'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { ImageUpload } from '@/components/shop/image-upload'
import { StylePicker, type StyleOption } from '@/components/shop/style-picker'
import { OrientationPicker } from '@/components/shop/orientation-picker'
import { ArtPreview, type GenerationState } from '@/components/shop/art-preview'
import { generateArtwork, checkGenerationStatus } from '@/lib/actions/ai'
import type { FormatOption } from '@/components/shop/format-picker'
import type { OrientationValue } from '@/validators/order'

const MAX_POLL_ATTEMPTS = 60
const INITIAL_POLL_INTERVAL = 3000
const MAX_POLL_INTERVAL = 15000
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
	const [errorMessage, setErrorMessage] = useState<string | null>(null)
	const [errorMeta, setErrorMeta] = useState<Record<string, unknown> | null>(null)
	const [orderId, setOrderId] = useState<string | null>(
		testMode ? TEST_IMAGES.orderId : null,
	)

	const pollRef = useRef<ReturnType<typeof setTimeout> | null>(null)
	const attemptRef = useRef(0)

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

	useEffect(() => {
		return () => {
			if (pollRef.current) clearTimeout(pollRef.current)
		}
	}, [])

	const startPolling = useCallback(
		(taskId: string, orderId: string) => {
			attemptRef.current = 0

			function poll() {
				attemptRef.current += 1

				if (attemptRef.current > MAX_POLL_ATTEMPTS) {
					setGenerationState('error')
					setErrorMessage('errors.generationTimeout')
					return
				}

				checkGenerationStatus(taskId, orderId, guestSessionId).then((result) => {
					if (!result.success) {
						setGenerationState('error')
						setErrorMessage(result.error)
						return
					}

					const { state, generatedImageUrl: url } = result.data

					if (state === 'success' && url) {
						setGenerationState('success')
						setGeneratedImageUrl(url)
						return
					}

				if (state === 'fail') {
					setGenerationState('error')
					setErrorMessage('errors.generationFailed')
					return
				}

					const delay = Math.min(
						INITIAL_POLL_INTERVAL *
							Math.pow(1.3, attemptRef.current - 1),
						MAX_POLL_INTERVAL,
					)
					pollRef.current = setTimeout(poll, delay)
				})
			}

			pollRef.current = setTimeout(poll, INITIAL_POLL_INTERVAL)
		},
		[guestSessionId],
	)

	async function handleGenerate() {
		if (!file || !selectedStyleId || !selectedOrientation) return

		setGenerationState('submitting')
		setErrorMessage(null)
		setErrorMeta(null)
		setGeneratedImageUrl(null)
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
		startPolling(result.data.taskId, result.data.orderId)
	}

	function handleReset() {
		if (pollRef.current) clearTimeout(pollRef.current)
		setGenerationState('idle')
		setGeneratedImageUrl(null)
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
				errorMessage={errorMessage}
				errorMeta={errorMeta}
				orderId={orderId}
				guestSessionId={guestSessionId}
				testMode={testMode}
				onGenerate={handleGenerate}
				onReset={handleReset}
			/>
			</div>
		</div>
	)
}

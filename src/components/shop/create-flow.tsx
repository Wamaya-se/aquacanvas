'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { ImageUpload } from '@/components/shop/image-upload'
import { StylePicker, type StyleOption } from '@/components/shop/style-picker'
import { ArtPreview, type GenerationState } from '@/components/shop/art-preview'
import { generateArtwork, checkGenerationStatus } from '@/lib/actions/ai'
import type { FormatOption } from '@/components/shop/format-picker'

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

interface CreateFlowProps {
	styles: StyleOption[]
	formats: FormatOption[]
	lockedStyleId?: string
}

export function CreateFlow({ styles, formats, lockedStyleId }: CreateFlowProps) {
	const tShop = useTranslations('shop')
	const guestSessionId = useMemo(() => getOrCreateGuestSession(), [])

	const [file, setFile] = useState<File | null>(null)
	const [selectedStyleId, setSelectedStyleId] = useState<string | null>(lockedStyleId ?? null)
	const [previewUrl, setPreviewUrl] = useState<string | null>(null)

	const isStyleLocked = !!lockedStyleId

	const selectedStyle = selectedStyleId
		? styles.find((s) => s.id === selectedStyleId) ?? null
		: null

	const [generationState, setGenerationState] = useState<GenerationState>('idle')
	const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null)
	const [errorMessage, setErrorMessage] = useState<string | null>(null)
	const [orderId, setOrderId] = useState<string | null>(null)

	const pollRef = useRef<ReturnType<typeof setTimeout> | null>(null)
	const attemptRef = useRef(0)

	useEffect(() => {
		if (file) {
			const url = URL.createObjectURL(file)
			setPreviewUrl(url)
			return () => URL.revokeObjectURL(url)
		}
		setPreviewUrl(null)
	}, [file])

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
		if (!file || !selectedStyleId) return

		setGenerationState('submitting')
		setErrorMessage(null)
		setGeneratedImageUrl(null)
		setOrderId(null)

		const formData = new FormData()
		formData.append('photo', file)
		formData.append('styleId', selectedStyleId)
		formData.append('guestSessionId', guestSessionId)

		const result = await generateArtwork(formData)

		if (!result.success) {
			setGenerationState('error')
			setErrorMessage(result.error)
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
		setOrderId(null)
		setFile(null)
		if (!isStyleLocked) setSelectedStyleId(null)
	}

	return (
		<div className="flex flex-col gap-12">
			{generationState === 'idle' || generationState === 'error' ? (
				isStyleLocked ? (
					<div className="flex flex-col gap-4">
						<h2 className="font-heading text-lg font-semibold tracking-[-0.03em] text-foreground">
							{tShop('uploadPhoto')}
						</h2>
						<ImageUpload file={file} onFileChange={setFile} />
					</div>
				) : (
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
					stylePriceCents={selectedStyle?.priceCents ?? 0}
					formats={formats}
					previewUrl={previewUrl}
					generationState={generationState}
					generatedImageUrl={generatedImageUrl}
					errorMessage={errorMessage}
					orderId={orderId}
					guestSessionId={guestSessionId}
					onGenerate={handleGenerate}
					onReset={handleReset}
				/>
			</div>
		</div>
	)
}

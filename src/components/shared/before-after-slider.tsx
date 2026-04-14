'use client'

import { useCallback, useRef, useState } from 'react'
import Image from 'next/image'
import { ChevronsLeftRight } from 'lucide-react'

interface BeforeAfterSliderProps {
	beforeSrc: string
	afterSrc: string
	beforeAlt: string
	afterAlt: string
	beforeLabel: string
	afterLabel: string
	sliderAriaLabel?: string
}

export function BeforeAfterSlider({
	beforeSrc,
	afterSrc,
	beforeAlt,
	afterAlt,
	beforeLabel,
	afterLabel,
	sliderAriaLabel = 'Drag to compare before and after',
}: BeforeAfterSliderProps) {
	const [position, setPosition] = useState(50)
	const containerRef = useRef<HTMLDivElement>(null)
	const isDragging = useRef(false)

	const updatePosition = useCallback((clientX: number) => {
		const container = containerRef.current
		if (!container) return
		const rect = container.getBoundingClientRect()
		const x = clientX - rect.left
		const percent = Math.min(100, Math.max(0, (x / rect.width) * 100))
		setPosition(percent)
	}, [])

	const handlePointerDown = useCallback(
		(e: React.PointerEvent) => {
			isDragging.current = true
			;(e.target as HTMLElement).setPointerCapture(e.pointerId)
			updatePosition(e.clientX)
		},
		[updatePosition],
	)

	const handlePointerMove = useCallback(
		(e: React.PointerEvent) => {
			if (!isDragging.current) return
			updatePosition(e.clientX)
		},
		[updatePosition],
	)

	const handlePointerUp = useCallback(() => {
		isDragging.current = false
	}, [])

	const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
		const step = 5
		if (e.key === 'ArrowLeft') {
			e.preventDefault()
			setPosition((prev) => Math.max(0, prev - step))
		} else if (e.key === 'ArrowRight') {
			e.preventDefault()
			setPosition((prev) => Math.min(100, prev + step))
		}
	}, [])

	return (
		<div
			ref={containerRef}
			className="relative aspect-[16/9] w-full cursor-ew-resize select-none overflow-hidden rounded-xl bg-surface-dim"
			style={{
				boxShadow:
					'0 8px 40px oklch(0.2 0.02 260 / 0.06)',
			}}
			onPointerDown={handlePointerDown}
			onPointerMove={handlePointerMove}
			onPointerUp={handlePointerUp}
		>
			{/* Before image (full, underneath) */}
			<Image
				src={beforeSrc}
				alt={beforeAlt}
				fill
				sizes="(max-width: 768px) 100vw, 900px"
				className="object-contain"
				unoptimized
				priority
			/>

			{/* After image (clipped from the left) */}
			<div
				className="absolute inset-0"
				style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
			>
				<Image
					src={afterSrc}
					alt={afterAlt}
					fill
					sizes="(max-width: 768px) 100vw, 900px"
					className="object-contain"
					unoptimized
					priority
				/>
			</div>

			{/* Divider line */}
			<div
				className="absolute top-0 bottom-0 z-10 w-0.5 bg-foreground/80"
				style={{ left: `${position}%`, transform: 'translateX(-50%)' }}
			/>

			{/* Drag handle */}
			<div
				role="slider"
				tabIndex={0}
				aria-valuenow={Math.round(position)}
				aria-valuemin={0}
				aria-valuemax={100}
				aria-label={sliderAriaLabel}
				onKeyDown={handleKeyDown}
				className="absolute top-1/2 z-20 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-foreground/90 text-surface shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tertiary motion-safe:transition-[transform,opacity] motion-safe:duration-200"
				style={{ left: `${position}%`, transform: 'translate(-50%, -50%)' }}
			>
				<ChevronsLeftRight className="size-5" aria-hidden="true" />
			</div>

			{/* Labels */}
			<span className="absolute bottom-3 left-3 z-10 rounded-md bg-surface/70 px-2.5 py-1 font-sans text-xs font-medium text-foreground backdrop-blur-sm">
				{afterLabel}
			</span>
			<span className="absolute right-3 bottom-3 z-10 rounded-md bg-surface/70 px-2.5 py-1 font-sans text-xs font-medium text-foreground backdrop-blur-sm">
				{beforeLabel}
			</span>
		</div>
	)
}

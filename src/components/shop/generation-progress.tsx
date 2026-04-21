'use client'

import { Paintbrush } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useEffect, useRef, useState, useSyncExternalStore } from 'react'

/**
 * Full-block "generating your artwork" state shown while the primary Kie
 * artwork task runs. Used by `ArtPreview` when generation is in-flight —
 * the hero state before any result is available.
 *
 * No props today; translations drive all copy. Kept export-compatible with
 * earlier callers.
 */
export function GenerationProgress() {
	const t = useTranslations('shop')

	return (
		<div className="flex flex-col items-center justify-center gap-5 rounded-xl bg-surface-container-high px-6 py-16">
			<div className="relative flex size-16 items-center justify-center">
				<div className="absolute inset-0 animate-ping rounded-full bg-brand/20" />
				<div className="relative flex size-12 items-center justify-center rounded-full bg-brand/10">
					<Paintbrush
						className="size-6 text-brand"
						aria-hidden="true"
					/>
				</div>
			</div>
			<div className="text-center">
				<p
					className="font-heading text-lg font-semibold tracking-[-0.03em] text-foreground"
					role="status"
					aria-live="polite"
				>
					{t('generating')}
				</p>
				<p className="mt-1 font-sans text-sm text-muted-foreground">
					{t('generatingDescription')}
				</p>
			</div>
		</div>
	)
}

const DEFAULT_DURATION_MS = 25_000
const TARGET_PROGRESS = 0.9

function subscribeReducedMotion(cb: () => void): () => void {
	if (typeof window === 'undefined') return () => {}
	const mql = window.matchMedia('(prefers-reduced-motion: reduce)')
	mql.addEventListener('change', cb)
	return () => mql.removeEventListener('change', cb)
}

function getReducedMotion(): boolean {
	if (typeof window === 'undefined') return false
	return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function getReducedMotionServer(): boolean {
	return false
}

function usePrefersReducedMotion(): boolean {
	return useSyncExternalStore(
		subscribeReducedMotion,
		getReducedMotion,
		getReducedMotionServer,
	)
}

interface GenerationProgressBarProps {
	message: string
	isActive: boolean
	estimatedDurationMs?: number
	className?: string
}

/**
 * Compact time-based progress indicator for secondary AI generations
 * (hero mockup, environment previews). Kie doesn't expose real progress,
 * so we animate an exponential decay toward 90 % over
 * `estimatedDurationMs`; the remaining 10 % snaps in when `isActive`
 * flips to `false`.
 *
 *   progress(t) = 0.9 * (1 - exp(-t / tau)), where tau = duration / 3
 *
 * The curve starts fast and gradually slows — feels like real activity
 * without the frustrating "stuck at 99 %" pattern. Respects
 * `prefers-reduced-motion` by rendering a static determinate bar.
 */
export function GenerationProgressBar({
	message,
	isActive,
	estimatedDurationMs = DEFAULT_DURATION_MS,
	className,
}: GenerationProgressBarProps) {
	// Only track in-flight progress. Terminal state (`isActive === false`)
	// renders 100 % directly so no setState is needed in an effect.
	const [activeProgress, setActiveProgress] = useState(0)
	const rafRef = useRef<number | null>(null)
	const startRef = useRef<number | null>(null)
	const reduced = usePrefersReducedMotion()

	useEffect(() => {
		if (!isActive || reduced) return

		const tau = Math.max(1000, estimatedDurationMs / 3)

		function tick(timestamp: number) {
			if (startRef.current === null) startRef.current = timestamp
			const elapsed = timestamp - startRef.current
			const value = TARGET_PROGRESS * (1 - Math.exp(-elapsed / tau))
			setActiveProgress(Math.min(value, TARGET_PROGRESS))
			rafRef.current = requestAnimationFrame(tick)
		}

		rafRef.current = requestAnimationFrame(tick)

		return () => {
			if (rafRef.current !== null) {
				cancelAnimationFrame(rafRef.current)
				rafRef.current = null
			}
			startRef.current = null
		}
	}, [isActive, estimatedDurationMs, reduced])

	let percent: number
	if (!isActive) {
		percent = 100
	} else if (reduced) {
		percent = Math.round(TARGET_PROGRESS * 0.5 * 100)
	} else {
		percent = Math.round(activeProgress * 100)
	}

	return (
		<div
			role="status"
			aria-live="polite"
			className={[
				'flex flex-col items-center gap-3 rounded-xl bg-surface-container-high px-6 py-5',
				className ?? '',
			].join(' ').trim()}
		>
			<p className="font-sans text-sm font-medium text-foreground">
				{message}
			</p>
			<div
				role="progressbar"
				aria-valuemin={0}
				aria-valuemax={100}
				aria-valuenow={percent}
				className="relative h-1.5 w-full max-w-sm overflow-hidden rounded-full bg-surface-container-low"
			>
				<div
					className="h-full rounded-full bg-brand transition-[width] duration-150 ease-linear"
					style={{ width: `${percent}%` }}
				/>
			</div>
		</div>
	)
}

'use client'

import { useTranslations } from 'next-intl'
import { AlertTriangle } from 'lucide-react'
import type { OrientationValue } from '@/validators/order'

interface OrientationPickerProps {
	selected: OrientationValue | null
	detectedOrientation: OrientationValue | null
	onSelect: (orientation: OrientationValue) => void
}

const ORIENTATIONS: {
	value: OrientationValue
	widthRatio: number
	heightRatio: number
}[] = [
	{ value: 'portrait', widthRatio: 3, heightRatio: 4 },
	{ value: 'landscape', widthRatio: 4, heightRatio: 3 },
	{ value: 'square', widthRatio: 1, heightRatio: 1 },
]

const I18N_KEY: Record<OrientationValue, string> = {
	portrait: 'orientationPortrait',
	landscape: 'orientationLandscape',
	square: 'orientationSquare',
}

const HINT_KEY: Record<OrientationValue, string> = {
	portrait: 'orientationPortraitHint',
	landscape: 'orientationLandscapeHint',
	square: 'orientationSquareHint',
}

export function OrientationPicker({
	selected,
	detectedOrientation,
	onSelect,
}: OrientationPickerProps) {
	const t = useTranslations('shop')

	const isMismatch =
		selected !== null &&
		detectedOrientation !== null &&
		selected !== detectedOrientation

	return (
		<div className="flex flex-col gap-3">
			<div
				role="group"
				aria-label={t('chooseOrientation')}
				className="grid grid-cols-3 gap-3"
			>
				{ORIENTATIONS.map(({ value, widthRatio, heightRatio }) => {
					const isSelected = selected === value
					const scale = 40
					const w = widthRatio * scale
					const h = heightRatio * scale

					return (
						<button
							key={value}
							type="button"
							aria-pressed={isSelected}
							onClick={() => onSelect(value)}
							className={`group flex flex-col items-center gap-2.5 rounded-xl px-3 py-4 transition-colors ${
								isSelected
									? 'bg-brand/10 ring-2 ring-brand'
									: 'bg-surface-container-high hover:bg-surface-container-highest'
							}`}
						>
							<div
								className={`rounded-md border-2 transition-colors ${
									isSelected
										? 'border-brand bg-brand/5'
										: 'border-outline-variant/30 bg-surface-container-low'
								}`}
								style={{ width: `${w}px`, height: `${h}px` }}
								aria-hidden="true"
							/>

							<span className="font-heading text-sm font-semibold tracking-[-0.03em] text-foreground">
								{t(I18N_KEY[value] as Parameters<typeof t>[0])}
							</span>

							<span className="font-sans text-[11px] leading-tight text-muted-foreground text-center">
								{t(HINT_KEY[value] as Parameters<typeof t>[0])}
							</span>
						</button>
					)
				})}
			</div>

			{isMismatch && (
				<div className="flex items-start gap-2 rounded-lg bg-warning/10 px-3 py-2.5">
					<AlertTriangle
						className="mt-0.5 size-4 shrink-0 text-warning"
						aria-hidden="true"
					/>
					<p
						role="alert"
						className="font-sans text-xs leading-relaxed text-warning"
					>
						{t('orientationMismatchWarning', {
							photoOrientation: t(
								I18N_KEY[detectedOrientation!] as Parameters<typeof t>[0],
							).toLowerCase(),
							canvasOrientation: t(
								I18N_KEY[selected!] as Parameters<typeof t>[0],
							).toLowerCase(),
						})}
					</p>
				</div>
			)}
		</div>
	)
}

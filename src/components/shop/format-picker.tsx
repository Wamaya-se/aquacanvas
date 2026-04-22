'use client'

import { useTranslations } from 'next-intl'

import type {
	EligibilityGrade,
	FormatEligibility,
} from '@/lib/format-eligibility'
import type { OrientationValue } from '@/validators/order'

export interface FormatOption {
	id: string
	name: string
	slug: string
	description: string | null
	formatType: string
	widthCm: number
	heightCm: number
	priceCents: number
	orientation: OrientationValue
}

interface FormatPickerProps {
	formats: FormatOption[]
	selected: string | null
	onSelect: (id: string) => void
	stylePriceCents: number
	/**
	 * Per-format DPI eligibility. When omitted (e.g. generation dimensions
	 * unknown) the picker renders without badges and nothing is disabled —
	 * defense-in-depth still blocks red formats server-side in checkout.
	 */
	eligibility?: Record<string, FormatEligibility>
}

function formatPrice(cents: number): string {
	return `${Math.round(cents / 100)} SEK`
}

export function FormatPicker({
	formats,
	selected,
	onSelect,
	stylePriceCents,
	eligibility,
}: FormatPickerProps) {
	const t = useTranslations('formats')
	const tShop = useTranslations('shop')

	return (
		<div className="flex flex-col gap-5">
			<p className="font-sans text-sm text-muted-foreground">
				{tShop('formatHint')}
			</p>

			<div role="group" aria-label={tShop('chooseFormat')} className="grid grid-cols-1 gap-3 sm:grid-cols-3">
				{formats.map((format) => {
					const isSelected = selected === format.id
					const totalCents = stylePriceCents + format.priceCents
					const grade = eligibility?.[format.id]?.grade
					const isBlocked = grade === 'red'

					return (
						<button
							key={format.id}
							type="button"
							aria-pressed={isSelected}
							aria-disabled={isBlocked}
							disabled={isBlocked}
							title={
								grade
									? tShop(`dpiTooltip.${grade}` as 'dpiTooltip.green')
									: undefined
							}
							onClick={() => {
								if (isBlocked) return
								onSelect(format.id)
							}}
							className={`group relative flex flex-col items-center gap-2 rounded-xl px-4 py-5 text-center transition-colors ${
								isSelected && !isBlocked
									? 'bg-brand/10 ring-2 ring-brand'
									: isBlocked
										? 'cursor-not-allowed bg-surface-container-high opacity-55'
										: 'bg-surface-container-high hover:bg-surface-container-highest'
							}`}
						>
							<SizeIcon
								widthCm={format.widthCm}
								heightCm={format.heightCm}
								isSelected={isSelected && !isBlocked}
							/>

							<span className="font-heading text-sm font-semibold tracking-[-0.03em] text-foreground">
								{format.widthCm}×{format.heightCm} cm
							</span>

							<span className="font-sans text-xs text-muted-foreground">
								{t(format.slug as 'canvas-30x40') || format.description}
							</span>

							<span className={`font-heading text-lg font-bold tracking-[-0.03em] ${isSelected && !isBlocked ? 'text-brand' : 'text-foreground'}`}>
								{formatPrice(totalCents)}
							</span>

							<span className="font-sans text-[10px] text-muted-foreground">
								{t('includesArt')} + {t('canvas')}
							</span>

							{grade && <QualityBadge grade={grade} />}
						</button>
					)
				})}
			</div>
		</div>
	)
}

interface QualityBadgeProps {
	grade: EligibilityGrade
}

function QualityBadge({ grade }: QualityBadgeProps) {
	const tShop = useTranslations('shop')

	const styles: Record<EligibilityGrade, string> = {
		green: 'bg-success/15 text-success',
		yellow: 'bg-warning/15 text-warning',
		red: 'bg-destructive/15 text-destructive',
	}
	const labelKey: Record<EligibilityGrade, 'dpiBadgeRecommended' | 'dpiBadgeAcceptable' | 'dpiBadgeTooLow'> = {
		green: 'dpiBadgeRecommended',
		yellow: 'dpiBadgeAcceptable',
		red: 'dpiBadgeTooLow',
	}

	return (
		<span
			className={`mt-1 rounded-full px-2 py-0.5 font-sans text-[10px] font-semibold uppercase tracking-wide ${styles[grade]}`}
		>
			{tShop(labelKey[grade])}
		</span>
	)
}

interface SizeIconProps {
	widthCm: number
	heightCm: number
	isSelected: boolean
}

function SizeIcon({ widthCm, heightCm, isSelected }: SizeIconProps) {
	const maxDim = Math.max(widthCm, heightCm)
	const scale = 36 / maxDim
	const w = Math.round(widthCm * scale)
	const h = Math.round(heightCm * scale)

	return (
		<div
			className="flex items-center justify-center"
			style={{ width: 40, height: 40 }}
			aria-hidden="true"
		>
			<div
				className={`rounded-[2px] border-2 transition-colors ${
					isSelected
						? 'border-brand bg-brand/10'
						: 'border-muted-foreground/30 bg-surface-container-low'
				}`}
				style={{ width: `${w}px`, height: `${h}px` }}
			/>
		</div>
	)
}


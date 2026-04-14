'use client'

import { useTranslations } from 'next-intl'
import { Frame } from 'lucide-react'

export interface FormatOption {
	id: string
	name: string
	slug: string
	description: string | null
	formatType: string
	widthCm: number
	heightCm: number
	priceCents: number
}

interface FormatPickerProps {
	formats: FormatOption[]
	selected: string | null
	onSelect: (id: string) => void
	stylePriceCents: number
}

function formatPrice(cents: number): string {
	return `${Math.round(cents / 100)} SEK`
}

export function FormatPicker({
	formats,
	selected,
	onSelect,
	stylePriceCents,
}: FormatPickerProps) {
	const t = useTranslations('formats')
	const tShop = useTranslations('shop')

	return (
		<div className="flex flex-col gap-3">
			<p className="font-sans text-sm text-muted-foreground">
				{tShop('formatHint')}
			</p>
			<div role="group" aria-label={tShop('chooseFormat')} className="grid grid-cols-1 gap-3 sm:grid-cols-3">
				{formats.map((format) => {
					const isSelected = selected === format.id
					const totalCents = stylePriceCents + format.priceCents

					return (
						<button
							key={format.id}
							type="button"
							aria-pressed={isSelected}
							onClick={() => onSelect(format.id)}
							className={`group relative flex flex-col items-center gap-2 rounded-xl px-4 py-5 text-center transition-colors ${
								isSelected
									? 'bg-brand/10 ring-2 ring-brand'
									: 'bg-surface-container-high hover:bg-surface-container-highest'
							}`}
						>
							<Frame
								className={`size-6 ${isSelected ? 'text-brand' : 'text-muted-foreground'}`}
								aria-hidden="true"
							/>

							<span className="font-heading text-sm font-semibold tracking-[-0.03em] text-foreground">
								{format.widthCm}×{format.heightCm} cm
							</span>

							<span className="font-sans text-xs text-muted-foreground">
								{t(format.slug as 'canvas-30x40') || format.description}
							</span>

							<span className={`font-heading text-lg font-bold tracking-[-0.03em] ${isSelected ? 'text-brand' : 'text-foreground'}`}>
								{formatPrice(totalCents)}
							</span>

							<span className="font-sans text-[10px] text-muted-foreground">
								{t('includesArt')} + {t('canvas')}
							</span>
						</button>
					)
				})}
			</div>
		</div>
	)
}

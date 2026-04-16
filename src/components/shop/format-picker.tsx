'use client'

import { useTranslations } from 'next-intl'

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
}

function formatPrice(cents: number): string {
	return `${Math.round(cents / 100)} SEK`
}

const SOFA_WIDTH_CM = 180

export function FormatPicker({
	formats,
	selected,
	onSelect,
	stylePriceCents,
}: FormatPickerProps) {
	const t = useTranslations('formats')
	const tShop = useTranslations('shop')

	const selectedFormat = formats.find((f) => f.id === selected) ?? null

	return (
		<div className="flex flex-col gap-5">
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
							<SizeIcon
								widthCm={format.widthCm}
								heightCm={format.heightCm}
								isSelected={isSelected}
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

			{selectedFormat && (
				<SizeComparison format={selectedFormat} />
			)}
		</div>
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

interface SizeComparisonProps {
	format: FormatOption
}

function SizeComparison({ format }: SizeComparisonProps) {
	const tShop = useTranslations('shop')

	const viewboxWidth = 240
	const viewboxHeight = 120
	const pxPerCm = viewboxWidth / (SOFA_WIDTH_CM + 40)

	const sofaW = SOFA_WIDTH_CM * pxPerCm
	const sofaH = 40 * pxPerCm
	const sofaX = (viewboxWidth - sofaW) / 2
	const sofaY = viewboxHeight - sofaH - 4

	const canvasW = format.widthCm * pxPerCm
	const canvasH = format.heightCm * pxPerCm
	const canvasX = (viewboxWidth - canvasW) / 2
	const canvasY = sofaY - canvasH - 6 * pxPerCm

	return (
		<div className="flex flex-col items-center gap-2 rounded-xl bg-surface-container-high px-4 py-4">
			<p className="font-sans text-xs font-medium text-muted-foreground">
				{tShop('sizeComparisonLabel')}
			</p>
			<svg
				viewBox={`0 0 ${viewboxWidth} ${viewboxHeight}`}
				className="h-auto w-full max-w-xs"
				role="img"
				aria-label={tShop('sizeComparisonAlt', { width: format.widthCm, height: format.heightCm })}
			>
				{/* Wall background */}
				<rect
					x="0" y="0"
					width={viewboxWidth} height={viewboxHeight}
					className="fill-surface-container-low"
					rx="4"
				/>

				{/* Canvas frame */}
				<rect
					x={canvasX - 1.5} y={canvasY - 1.5}
					width={canvasW + 3} height={canvasH + 3}
					rx="0.5"
					fill="#b8956a"
				/>
				<rect
					x={canvasX} y={canvasY}
					width={canvasW} height={canvasH}
					className="fill-brand/15"
					rx="0.3"
				/>

				{/* Canvas dimension label */}
				<text
					x={viewboxWidth / 2}
					y={canvasY + canvasH / 2 + 2.5}
					textAnchor="middle"
					className="fill-foreground font-sans"
					fontSize="7"
					fontWeight="600"
				>
					{format.widthCm}×{format.heightCm}
				</text>

				{/* Sofa body */}
				<rect
					x={sofaX} y={sofaY + 6}
					width={sofaW} height={sofaH - 6}
					rx="4"
					className="fill-muted-foreground/20"
				/>
				{/* Sofa back */}
				<rect
					x={sofaX + 2} y={sofaY}
					width={sofaW - 4} height={sofaH - 8}
					rx="3"
					className="fill-muted-foreground/15"
				/>
				{/* Sofa cushions */}
				<rect
					x={sofaX + 6} y={sofaY + 2}
					width={sofaW / 3 - 8} height={sofaH - 14}
					rx="2"
					className="fill-muted-foreground/10"
				/>
				<rect
					x={sofaX + sofaW / 3 + 2} y={sofaY + 2}
					width={sofaW / 3 - 4} height={sofaH - 14}
					rx="2"
					className="fill-muted-foreground/10"
				/>
				<rect
					x={sofaX + (sofaW * 2) / 3 + 2} y={sofaY + 2}
					width={sofaW / 3 - 8} height={sofaH - 14}
					rx="2"
					className="fill-muted-foreground/10"
				/>
			</svg>
		</div>
	)
}

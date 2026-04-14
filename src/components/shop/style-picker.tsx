'use client'

import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { Badge } from '@/components/ui/badge'

export interface StyleOption {
	id: string
	slug: string
	name: string
	description: string | null
	thumbnailUrl: string | null
	isActive: boolean
	priceCents: number
}

const SLUG_TO_I18N: Record<string, { nameKey: string; descKey: string }> = {
	'watercolor': { nameKey: 'watercolor', descKey: 'watercolorDesc' },
	'oil-painting': { nameKey: 'oilPainting', descKey: 'oilPaintingDesc' },
	'charcoal-sketch': { nameKey: 'charcoalSketch', descKey: 'charcoalSketchDesc' },
	'anime': { nameKey: 'anime', descKey: 'animeDesc' },
	'impressionism': { nameKey: 'impressionism', descKey: 'impressionismDesc' },
}

interface StylePickerProps {
	styles: StyleOption[]
	selected: string | null
	onSelect: (id: string) => void
}

export function StylePicker({ styles, selected, onSelect }: StylePickerProps) {
	const tStyles = useTranslations('styles')
	const tShop = useTranslations('shop')

	return (
		<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
			{styles.map((style) => {
				const isSelected = selected === style.id
				const isDisabled = !style.isActive

				const i18nKeys = SLUG_TO_I18N[style.slug]
				const displayName = i18nKeys
					? tStyles(i18nKeys.nameKey)
					: style.name
				const displayDesc = i18nKeys
					? tStyles(i18nKeys.descKey)
					: style.description ?? ''

				return (
					<button
						key={style.id}
						type="button"
						disabled={isDisabled}
						onClick={() => onSelect(style.id)}
						className={`group relative flex items-start gap-3 rounded-xl p-3 text-left transition-colors ${
							isSelected
								? 'bg-brand/10 ring-2 ring-brand'
								: isDisabled
									? 'cursor-not-allowed opacity-50'
									: 'bg-surface-container-high hover:bg-surface-container-highest'
						}`}
					>
						<div className="relative size-16 shrink-0 overflow-hidden rounded-lg">
							<Image
								src={
									style.thumbnailUrl ??
									`https://placehold.co/80x80/${isSelected ? '1a1e2a/5eb5c4' : '222736/8a8fa0'}?text=${encodeURIComponent(displayName.slice(0, 3))}`
								}
								alt={displayName}
								width={80}
								height={80}
								unoptimized
								className="size-full object-cover"
							/>
						</div>

						<div className="flex flex-1 flex-col gap-0.5">
							<div className="flex items-center gap-2">
								<span className="font-heading text-sm font-semibold tracking-[-0.03em] text-foreground">
									{displayName}
								</span>
								{isDisabled && (
									<Badge
										variant="secondary"
										className="text-[10px]"
									>
										{tShop('comingSoon')}
									</Badge>
								)}
							</div>
							<span className="font-sans text-xs leading-relaxed text-muted-foreground">
								{displayDesc}
							</span>
						</div>
					</button>
				)
			})}
		</div>
	)
}

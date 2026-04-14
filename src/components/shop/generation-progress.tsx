'use client'

import { Paintbrush } from 'lucide-react'
import { useTranslations } from 'next-intl'

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

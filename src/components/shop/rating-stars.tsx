import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RatingStarsProps {
	value: number
	size?: 'sm' | 'md' | 'lg'
	className?: string
	ariaLabel?: string
}

/**
 * Decorative star rating display (rounded to nearest half star).
 * Pair with an accessible label via `ariaLabel` for screen readers.
 */
export function RatingStars({
	value,
	size = 'md',
	className,
	ariaLabel,
}: RatingStarsProps) {
	const clamped = Math.max(0, Math.min(5, value))
	const rounded = Math.round(clamped * 2) / 2
	const sizeClass =
		size === 'sm' ? 'size-3.5' : size === 'lg' ? 'size-5' : 'size-4'

	return (
		<div
			className={cn('inline-flex items-center gap-0.5 text-brand', className)}
			role="img"
			aria-label={ariaLabel ?? `${rounded} / 5`}
		>
			{Array.from({ length: 5 }, (_, i) => {
				const filled = i + 1 <= rounded
				const half = !filled && i + 0.5 === rounded
				return (
					<span key={i} className="relative inline-block" aria-hidden="true">
						<Star className={cn(sizeClass, 'text-outline-variant/60')} />
						{(filled || half) && (
							<span
								className={cn(
									'pointer-events-none absolute inset-0 overflow-hidden',
									half ? 'w-1/2' : 'w-full',
								)}
							>
								<Star className={cn(sizeClass, 'fill-current')} />
							</span>
						)}
					</span>
				)
			})}
		</div>
	)
}

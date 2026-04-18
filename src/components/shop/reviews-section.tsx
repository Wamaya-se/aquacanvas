import { getLocale, getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { RatingStars } from '@/components/shop/rating-stars'
import { ReviewForm } from '@/components/shop/review-form'

interface ReviewsSectionProps {
	productId: string
}

export async function ReviewsSection({ productId }: ReviewsSectionProps) {
	const t = await getTranslations('reviews')
	const locale = await getLocale()
	const dateLocale = locale === 'en' ? 'en-GB' : 'sv-SE'
	const supabase = await createClient()

	const { data: reviews } = await supabase
		.from('product_reviews')
		.select('id, customer_name, rating, title, body, created_at')
		.eq('product_id', productId)
		.eq('status', 'approved')
		.order('created_at', { ascending: false })
		.limit(50)

	const count = reviews?.length ?? 0
	const average =
		count > 0
			? (reviews ?? []).reduce((sum, r) => sum + r.rating, 0) / count
			: 0

	return (
		<section
			id="reviews"
			aria-labelledby="reviews-heading"
			className="bg-surface px-6 py-16 lg:py-24"
		>
			<div className="mx-auto max-w-3xl">
				<div className="mb-10 text-center">
					<h2
						id="reviews-heading"
						className="font-heading text-2xl font-bold tracking-[-0.03em] text-foreground sm:text-3xl"
					>
						{t('heading')}
					</h2>
					{count > 0 && (
						<div className="mt-4 flex flex-col items-center gap-1">
							<RatingStars
								value={average}
								size="lg"
								ariaLabel={t('averageAriaLabel', {
									average: average.toFixed(1),
								})}
							/>
							<p className="font-sans text-sm text-muted-foreground">
								{t('averageSummary', {
									average: average.toFixed(1),
									count,
								})}
							</p>
						</div>
					)}
				</div>

				{count === 0 ? (
					<div className="mb-12 rounded-xl bg-surface-container px-6 py-10 text-center">
						<p className="font-sans text-sm text-muted-foreground">
							{t('emptyState')}
						</p>
					</div>
				) : (
					<ul className="mb-12 space-y-4">
						{(reviews ?? []).map((review) => (
							<li
								key={review.id}
								className="rounded-xl bg-surface-container p-6"
							>
								<div className="mb-3 flex items-center justify-between gap-3">
									<div>
										<p className="font-sans text-sm font-medium text-foreground">
											{review.customer_name}
										</p>
										<time
											dateTime={review.created_at}
											className="font-sans text-xs text-muted-foreground"
										>
											{new Date(review.created_at).toLocaleDateString(dateLocale)}
										</time>
									</div>
									<RatingStars
										value={review.rating}
										ariaLabel={t('ratingAriaLabel', { rating: review.rating })}
									/>
								</div>
								{review.title && (
									<h3 className="mb-2 font-heading text-base font-semibold tracking-[-0.02em] text-foreground">
										{review.title}
									</h3>
								)}
								<p className="font-sans text-sm leading-[1.7] text-muted-foreground">
									{review.body}
								</p>
							</li>
						))}
					</ul>
				)}

				<div className="rounded-xl bg-surface-container-low p-6 sm:p-8">
					<h3 className="mb-2 font-heading text-lg font-semibold tracking-[-0.03em] text-foreground">
						{t('formHeading')}
					</h3>
					<p className="mb-6 font-sans text-sm leading-[1.7] text-muted-foreground">
						{t('formSubtitle')}
					</p>
					<ReviewForm productId={productId} />
				</div>
			</div>
		</section>
	)
}

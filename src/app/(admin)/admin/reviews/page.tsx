import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { Star } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { Badge } from '@/components/ui/badge'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'
import { ReviewModerationButtons } from '@/components/admin/review-moderation-buttons'
import { ReviewStatusFilter } from '@/components/admin/review-status-filter'
import { unwrapSingleRelation } from '@/lib/db-helpers'

export async function generateMetadata(): Promise<Metadata> {
	const t = await getTranslations('admin.meta')
	return { title: t('reviewsTitle') }
}

interface AdminReviewsPageProps {
	searchParams: Promise<{ status?: string }>
}

type ReviewStatus = 'pending' | 'approved' | 'rejected'
const VALID_STATUSES: ReviewStatus[] = ['pending', 'approved', 'rejected']

function isReviewStatus(value: unknown): value is ReviewStatus {
	return typeof value === 'string' && (VALID_STATUSES as string[]).includes(value)
}

function StarRow({ rating }: { rating: number }) {
	return (
		<div className="flex items-center gap-0.5" aria-label={`${rating} / 5`}>
			{Array.from({ length: 5 }, (_, i) => (
				<Star
					key={i}
					className="size-3.5"
					fill={i < rating ? 'currentColor' : 'none'}
					aria-hidden="true"
				/>
			))}
		</div>
	)
}

export default async function AdminReviewsPage({
	searchParams,
}: AdminReviewsPageProps) {
	const t = await getTranslations('admin')
	const { status: rawStatus } = await searchParams
	const statusFilter: ReviewStatus | 'all' = isReviewStatus(rawStatus)
		? rawStatus
		: 'all'

	// Auth gate — admin-only route. Middleware already redirects non-admins,
	// but defence-in-depth before we hand out a service-role client.
	const authClient = await createClient()
	const { data: { user } } = await authClient.auth.getUser()
	if (!user) redirect('/login')
	if (user.app_metadata?.role !== 'admin') redirect('/')

	// Use admin client: column-level REVOKE on customer_email (migration
	// 00017) blocks the authenticated role from reading the PII column.
	const supabase = createAdminClient()
	let query = supabase
		.from('product_reviews')
		.select(
			'id, product_id, customer_name, customer_email, rating, title, body, status, locale, created_at, products(name, slug)',
		)
		.order('created_at', { ascending: false })
		.limit(200)

	if (statusFilter !== 'all') {
		query = query.eq('status', statusFilter)
	}

	const { data: reviews, error } = await query
	if (error) throw new Error('Failed to load reviews')

	const dateLocale = 'sv-SE'

	return (
		<div>
			<div className="mb-8 flex flex-wrap items-center justify-between gap-4">
				<h1 className="font-heading text-2xl font-bold tracking-[-0.03em] text-foreground">
					{t('allReviews')}
				</h1>
				<ReviewStatusFilter currentStatus={statusFilter} />
			</div>

			{!reviews || reviews.length === 0 ? (
				<div className="flex flex-col items-center justify-center rounded-xl bg-surface-container py-16">
					<p className="font-sans text-sm text-muted-foreground">
						{t('noReviews')}
					</p>
				</div>
			) : (
				<div className="overflow-x-auto rounded-xl bg-surface-container">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>{t('reviewProduct')}</TableHead>
								<TableHead>{t('reviewAuthor')}</TableHead>
								<TableHead>{t('reviewRating')}</TableHead>
								<TableHead>{t('reviewContent')}</TableHead>
								<TableHead>{t('reviewCreatedAt')}</TableHead>
								<TableHead>{t('orderStatus')}</TableHead>
								<TableHead className="text-right">{t('discountActions')}</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{reviews.map((review) => {
								const product = unwrapSingleRelation(review.products)
								const status = review.status

								return (
									<TableRow key={review.id}>
										<TableCell>
											<div className="font-medium text-foreground">
												{product?.name ?? '—'}
											</div>
											<div className="text-xs text-muted-foreground">
												/p/{product?.slug ?? ''}
											</div>
										</TableCell>
										<TableCell>
											<div className="font-medium text-foreground">
												{review.customer_name}
											</div>
											<div className="text-xs text-muted-foreground">
												{review.customer_email}
											</div>
										</TableCell>
										<TableCell>
											<StarRow rating={review.rating} />
										</TableCell>
										<TableCell className="max-w-sm">
											{review.title && (
												<div className="mb-1 text-sm font-medium text-foreground">
													{review.title}
												</div>
											)}
											<div className="line-clamp-3 text-xs text-muted-foreground">
												{review.body}
											</div>
										</TableCell>
										<TableCell className="whitespace-nowrap text-xs text-muted-foreground">
											{new Date(review.created_at).toLocaleDateString(dateLocale)}
										</TableCell>
										<TableCell>
											<Badge
												variant={
													status === 'approved'
														? 'default'
														: status === 'pending'
															? 'secondary'
															: 'outline'
												}
											>
												{t(
													`reviewStatus_${status}` as
														| 'reviewStatus_pending'
														| 'reviewStatus_approved'
														| 'reviewStatus_rejected',
												)}
											</Badge>
										</TableCell>
										<TableCell>
											<ReviewModerationButtons
												reviewId={review.id}
												status={status}
											/>
										</TableCell>
									</TableRow>
								)
							})}
						</TableBody>
					</Table>
				</div>
			)}
		</div>
	)
}

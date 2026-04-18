import { z } from 'zod'

export const REVIEW_STATUS = ['pending', 'approved', 'rejected'] as const
export type ReviewStatus = (typeof REVIEW_STATUS)[number]

export const REVIEW_LOCALES = ['sv', 'en'] as const

export const submitReviewSchema = z.object({
	productId: z.string().uuid(),
	orderId: z.string().uuid().optional(),
	customerName: z.string().trim().min(1).max(60),
	customerEmail: z.string().trim().toLowerCase().email().max(200),
	rating: z.coerce.number().int().min(1).max(5),
	title: z
		.string()
		.trim()
		.max(80)
		.optional()
		.transform((v) => (v && v.length > 0 ? v : undefined)),
	body: z.string().trim().min(10).max(1000),
	locale: z.enum(REVIEW_LOCALES).default('sv'),
})

export type SubmitReviewInput = z.infer<typeof submitReviewSchema>

export const moderateReviewSchema = z.object({
	reviewId: z.string().uuid(),
	action: z.enum(['approve', 'reject', 'delete']),
})

export type ModerateReviewInput = z.infer<typeof moderateReviewSchema>

import { z } from 'zod'

export const createDiscountSchema = z.object({
	code: z.string().min(2).max(50).regex(/^[A-Z0-9_-]+$/, 'Code must be uppercase alphanumeric with hyphens/underscores'),
	discountType: z.enum(['percent', 'amount']),
	discountPercent: z.coerce.number().int().min(1).max(100).optional(),
	discountAmountSek: z.coerce.number().int().min(1).optional(),
	maxUses: z.coerce.number().int().min(1).optional().or(z.literal('')),
	expiresAt: z.string().optional().or(z.literal('')),
}).refine(
	(data) => {
		if (data.discountType === 'percent') return typeof data.discountPercent === 'number'
		return typeof data.discountAmountSek === 'number'
	},
	{ message: 'Discount value is required', path: ['discountPercent'] },
)

export type CreateDiscountInput = z.infer<typeof createDiscountSchema>

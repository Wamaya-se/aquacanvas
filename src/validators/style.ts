import { z } from 'zod'

export const styleSchema = z.object({
	name: z.string().min(1).max(100),
	slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/),
	description: z.string().max(500).optional().or(z.literal('')),
	promptTemplate: z.string().min(1),
	modelId: z.string().min(1),
	priceCents: z.coerce.number().int().min(0),
	isActive: z.coerce.boolean().default(true),
	sortOrder: z.coerce.number().int().min(0).default(0),
})

export type StyleInput = z.infer<typeof styleSchema>

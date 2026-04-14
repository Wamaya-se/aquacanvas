import { z } from 'zod'

export const faqItemSchema = z.object({
	question: z.string().min(1).max(300),
	answer: z.string().min(1).max(2000),
})

export const productSchema = z.object({
	name: z.string().min(1).max(100),
	slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
	headline: z.string().min(1).max(300),
	description: z.string().max(500).optional().or(z.literal('')),
	body: z.string().max(5000).optional().or(z.literal('')),
	styleId: z.string().uuid(),
	priceCents: z.coerce.number().int().min(0).optional().or(z.literal('')),
	isActive: z.coerce.boolean().default(true),
	sortOrder: z.coerce.number().int().min(0).default(0),
	seoTitle: z.string().max(70).optional().or(z.literal('')),
	seoDescription: z.string().max(160).optional().or(z.literal('')),
})

export type ProductInput = z.infer<typeof productSchema>
export type FaqItem = z.infer<typeof faqItemSchema>

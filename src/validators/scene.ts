import { z } from 'zod'

export const sceneSchema = z.object({
	name: z.string().min(1).max(100),
	description: z.string().max(500).optional().or(z.literal('')),
	isActive: z.coerce.boolean().default(true),
	sortOrder: z.coerce.number().int().min(0).default(0),
})

export type SceneInput = z.infer<typeof sceneSchema>

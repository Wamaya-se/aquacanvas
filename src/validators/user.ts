import { z } from 'zod'

export const createUserSchema = z.object({
	email: z.string().email().max(320),
	password: z.string().min(8).max(128),
	displayName: z.string().max(100).optional().or(z.literal('')),
	role: z.enum(['customer', 'admin']).default('customer'),
})

export const updateUserSchema = z.object({
	id: z.string().uuid(),
	email: z.string().email().max(320),
	displayName: z.string().max(100).optional().or(z.literal('')),
	role: z.enum(['customer', 'admin']),
})

export const resetPasswordSchema = z.object({
	id: z.string().uuid(),
	password: z.string().min(8).max(128),
})

export type CreateUserInput = z.infer<typeof createUserSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>

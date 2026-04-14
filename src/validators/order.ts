import { z } from 'zod'

const MAX_FILE_SIZE = 10 * 1024 * 1024
const ACCEPTED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export const generateArtworkSchema = z.object({
	styleId: z.string().uuid(),
	formatId: z.string().uuid().optional(),
})

export const checkStatusSchema = z.object({
	taskId: z.string().min(1),
	orderId: z.string().uuid(),
})

export function validateFile(file: unknown): {
	valid: true
	file: File
} | {
	valid: false
	error: string
	field: string
} {
	if (!(file instanceof File) || file.size === 0) {
		return { valid: false, error: 'errors.noFileUploaded', field: 'photo' }
	}

	if (file.size > MAX_FILE_SIZE) {
		return { valid: false, error: 'errors.fileTooLarge', field: 'photo' }
	}

	if (!ACCEPTED_MIME_TYPES.includes(file.type)) {
		return { valid: false, error: 'errors.invalidFileType', field: 'photo' }
	}

	return { valid: true, file }
}

export const checkoutSchema = z.object({
	orderId: z.string().uuid(),
	formatId: z.string().uuid().optional(),
})

export type GenerateArtworkInput = z.infer<typeof generateArtworkSchema>
export type CheckStatusInput = z.infer<typeof checkStatusSchema>
export type CheckoutInput = z.infer<typeof checkoutSchema>

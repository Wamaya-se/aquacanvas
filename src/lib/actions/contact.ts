'use server'

import type { ActionResult } from '@/types/actions'
import { contactSchema } from '@/validators/contact'

export async function sendContactMessage(
	formData: FormData
): Promise<ActionResult> {
	const raw = {
		name: formData.get('name'),
		email: formData.get('email'),
		subject: formData.get('subject'),
		message: formData.get('message'),
	}

	const parsed = contactSchema.safeParse(raw)
	if (!parsed.success) {
		return { success: false, error: 'errors.invalidInput' }
	}

	try {
		const { getResendApiKey, getAdminEmail } = await import('@/lib/env')
		const { Resend } = await import('resend')

		const resend = new Resend(getResendApiKey())

		await resend.emails.send({
			from: 'Aquacanvas <noreply@aquacanvas.com>',
			to: getAdminEmail(),
			replyTo: parsed.data.email,
			subject: `[Contact] ${parsed.data.subject}`,
			text: [
				`Name: ${parsed.data.name}`,
				`Email: ${parsed.data.email}`,
				`Subject: ${parsed.data.subject}`,
				'',
				parsed.data.message,
			].join('\n'),
		})

		return { success: true, data: undefined }
	} catch (err) {
		console.error('[sendContactMessage]', err)
		return { success: false, error: 'errors.generic' }
	}
}

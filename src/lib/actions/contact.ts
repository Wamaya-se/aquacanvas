'use server'

import { headers } from 'next/headers'
import type { ActionResult } from '@/types/actions'
import { contactSchema } from '@/validators/contact'
import { checkRateLimit } from '@/lib/rate-limit'

async function getClientIp(): Promise<string> {
	const hdrs = await headers()
	return (
		hdrs.get('x-forwarded-for')?.split(',')[0]?.trim() ??
		hdrs.get('x-real-ip') ??
		'unknown'
	)
}

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

	const rl = await checkRateLimit('contact', await getClientIp())
	if (!rl.allowed) {
		const minutes = Math.max(1, Math.ceil((rl.retryAfterSeconds ?? 0) / 60))
		return {
			success: false,
			error: 'errors.rateLimitedRequests',
			meta: { minutes, maxRequests: rl.maxRequests },
		}
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

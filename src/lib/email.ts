import { Resend } from 'resend'
import { getResendApiKey } from '@/lib/env'

let resendInstance: Resend | null = null

export function getResend(): Resend {
	if (!resendInstance) {
		resendInstance = new Resend(getResendApiKey())
	}
	return resendInstance
}

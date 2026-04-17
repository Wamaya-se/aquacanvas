function getEnvVar(key: string): string {
	const value = process.env[key]
	if (!value) {
		throw new Error(`Missing environment variable: ${key}`)
	}
	return value
}

export function getSiteUrl(): string {
	return getEnvVar('NEXT_PUBLIC_SITE_URL')
}

export function getSupabaseUrl(): string {
	return getEnvVar('NEXT_PUBLIC_SUPABASE_URL')
}

export function getSupabaseAnonKey(): string {
	return getEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

export function getSupabaseServiceRoleKey(): string {
	return getEnvVar('SUPABASE_SERVICE_ROLE_KEY')
}

export function getStripeSecretKey(): string {
	return getEnvVar('STRIPE_SECRET_KEY')
}

export function getStripeWebhookSecret(): string {
	return getEnvVar('STRIPE_WEBHOOK_SECRET')
}

export function getKieApiKey(): string {
	return getEnvVar('KIE_API_KEY')
}

export function getResendApiKey(): string {
	return getEnvVar('RESEND_API_KEY')
}

export function getAdminEmail(): string {
	return process.env.ADMIN_NOTIFICATION_EMAIL ?? 'admin@aquacanvas.com'
}

export function getContactEmail(): string {
	return process.env.CONTACT_EMAIL ?? 'support@aquacanvas.com'
}

export function getSentryDsn(): string | null {
	return process.env.NEXT_PUBLIC_SENTRY_DSN ?? null
}

export function getUpstashRedisUrl(): string | null {
	return process.env.UPSTASH_REDIS_REST_URL ?? null
}

export function getUpstashRedisToken(): string | null {
	return process.env.UPSTASH_REDIS_REST_TOKEN ?? null
}

export const env = {
	get siteUrl() {
		return getSiteUrl()
	},
	get supabaseUrl() {
		return getSupabaseUrl()
	},
	get supabaseAnonKey() {
		return getSupabaseAnonKey()
	},
	get supabaseServiceRoleKey() {
		return getSupabaseServiceRoleKey()
	},
	get stripeSecretKey() {
		return getStripeSecretKey()
	},
	get stripeWebhookSecret() {
		return getStripeWebhookSecret()
	},
	get kieApiKey() {
		return getKieApiKey()
	},
	get resendApiKey() {
		return getResendApiKey()
	},
	get adminEmail() {
		return getAdminEmail()
	},
	get contactEmail() {
		return getContactEmail()
	},
} as const

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

export function getReplicateApiToken(): string {
	return getEnvVar('REPLICATE_API_TOKEN')
}

/**
 * Server-side error reporting helper. No-op when Sentry DSN is unset.
 *
 * Usage:
 *
 *   try { ... } catch (err) {
 *     captureServerError(err, { action: 'createOrder', orderId })
 *     return { success: false, error: 'errors.generic' }
 *   }
 */

type Tags = Record<string, string | number | undefined | null>

export async function captureServerError(
	err: unknown,
	tags?: Tags,
): Promise<void> {
	const dsn = process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN
	if (!dsn) return

	try {
		const Sentry = await import('@sentry/nextjs')
		const cleanTags: Record<string, string> = {}
		for (const [k, v] of Object.entries(tags ?? {})) {
			if (v !== undefined && v !== null) cleanTags[k] = String(v)
		}
		Sentry.captureException(err, {
			tags: cleanTags,
		})
	} catch {
		// Swallow — reporting failure must never break the request.
	}
}

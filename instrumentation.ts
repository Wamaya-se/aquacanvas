/**
 * Next.js instrumentation hook. Registers error reporting (Sentry) on boot.
 *
 * Sentry config files (`sentry.server.config.ts`, `sentry.edge.config.ts`,
 * `sentry.client.config.ts`) short-circuit to no-op when `SENTRY_DSN` is
 * unset, so this file is safe to keep committed without a DSN in dev.
 *
 * Docs: https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */

export async function register() {
	if (process.env.NEXT_RUNTIME === 'nodejs') {
		await import('./sentry.server.config')
	}

	if (process.env.NEXT_RUNTIME === 'edge') {
		await import('./sentry.edge.config')
	}
}

import * as Sentry from '@sentry/nextjs'

export const onRequestError: typeof Sentry.captureRequestError = async (
	err,
	request,
	context,
) => {
	const dsn = process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN
	if (!dsn) return
	Sentry.captureRequestError(err, request, context)
}

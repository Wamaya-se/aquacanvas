import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'
import { withSentryConfig } from '@sentry/nextjs'

const nextConfig: NextConfig = {
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'placehold.co',
			},
			{
				protocol: 'http',
				hostname: '127.0.0.1',
				port: '54321',
				pathname: '/storage/v1/object/public/**',
			},
			{
				protocol: 'https',
				hostname: '**.supabase.co',
				pathname: '/storage/v1/object/public/**',
			},
			{
				protocol: 'https',
				hostname: 'tempfile.aiquickdraw.com',
			},
			{
				protocol: 'https',
				hostname: 'tempfile.redpandaai.co',
			},
		],
	},
	experimental: {
		serverActions: {
			bodySizeLimit: '20mb',
		},
	},
	// Ensure the AdobeRGB ICC profile is bundled with serverless functions on
	// Vercel. Next.js's file-tracing doesn't pick up runtime fs.readFile paths
	// automatically, so we include the folder explicitly.
	outputFileTracingIncludes: {
		'/**/*': ['./src/lib/icc/**/*'],
	},
}

const withNextIntl = createNextIntlPlugin()

const sentryEnabled = Boolean(
	process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN,
)

const intlConfig = withNextIntl(nextConfig)

export default sentryEnabled
	? withSentryConfig(intlConfig, {
			silent: true,
			org: process.env.SENTRY_ORG,
			project: process.env.SENTRY_PROJECT,
			widenClientFileUpload: true,
			tunnelRoute: '/monitoring',
			webpack: {
				treeshake: {
					removeDebugLogging: true,
				},
				automaticVercelMonitors: true,
			},
		})
	: intlConfig

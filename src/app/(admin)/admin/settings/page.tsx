import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { getSiteUrl, getAdminEmail } from '@/lib/env'
import {
	getTestModeEnabled,
	getRateLimitBypassEnabled,
	getUpscaleTrigger,
	getUpscaleMetrics,
	getHeroMockupMetrics,
	getUpscaleEnabled,
	getEnvironmentPreviewsEnabled,
} from '@/lib/actions/admin-settings'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'
import { TestModeToggle } from '@/components/admin/test-mode-toggle'
import { RateLimitToggle } from '@/components/admin/rate-limit-toggle'
import { UpscaleTriggerToggle } from '@/components/admin/upscale-trigger-toggle'
import { PipelineFeatureToggle } from '@/components/admin/pipeline-feature-toggle'

export async function generateMetadata(): Promise<Metadata> {
	const t = await getTranslations('admin.meta')
	return { title: t('settingsTitle') }
}

function isEnvSet(key: string): boolean {
	return !!process.env[key]
}

export default async function AdminSettingsPage() {
	const t = await getTranslations('admin')

	const [
		isTestMode,
		isRateLimitBypassed,
		upscaleTrigger,
		upscaleMetrics,
		heroMockupMetrics,
		upscaleEnabled,
		envPreviewsEnabled,
	] = await Promise.all([
		getTestModeEnabled(),
		getRateLimitBypassEnabled(),
		getUpscaleTrigger(),
		getUpscaleMetrics(),
		getHeroMockupMetrics(),
		getUpscaleEnabled(),
		getEnvironmentPreviewsEnabled(),
	])

	const hasResendKey = isEnvSet('RESEND_API_KEY')
	const hasStripeKey = isEnvSet('STRIPE_SECRET_KEY')
	const hasKieKey = isEnvSet('KIE_API_KEY')

	let adminEmail: string
	try {
		adminEmail = getAdminEmail()
	} catch {
		adminEmail = '—'
	}

	let siteUrl: string
	try {
		siteUrl = getSiteUrl()
	} catch {
		siteUrl = '—'
	}

	const services = [
		{ name: 'Resend (Email)', configured: hasResendKey },
		{ name: 'Stripe (Payments)', configured: hasStripeKey },
		{ name: 'Kie.ai (AI)', configured: hasKieKey },
	]

	const envVars = [
		'NEXT_PUBLIC_SITE_URL',
		'NEXT_PUBLIC_SUPABASE_URL',
		'NEXT_PUBLIC_SUPABASE_ANON_KEY',
		'SUPABASE_SERVICE_ROLE_KEY',
		'STRIPE_SECRET_KEY',
		'STRIPE_WEBHOOK_SECRET',
		'KIE_API_KEY',
		'RESEND_API_KEY',
		'ADMIN_NOTIFICATION_EMAIL',
	]

	return (
		<div>
			<h1 className="mb-8 font-heading text-2xl font-bold tracking-[-0.03em] text-foreground">
				{t('settingsTitle')}
			</h1>

			<div className="mb-8 grid gap-6 lg:grid-cols-2">
				<Card>
					<CardHeader>
						<CardTitle className="font-heading text-lg tracking-[-0.03em]">
							{t('siteSettings')}
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div>
							<p className="font-sans text-xs font-medium text-muted-foreground">
								{t('siteUrl')}
							</p>
							<p className="font-sans text-sm text-foreground">{siteUrl}</p>
						</div>
						<Separator />
						<div>
							<p className="font-sans text-xs font-medium text-muted-foreground">
								{t('adminEmail')}
							</p>
							<p className="font-sans text-sm text-foreground">{adminEmail}</p>
							<p className="mt-1 font-sans text-xs text-muted-foreground">
								{t('adminEmailHint')}
							</p>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle className="font-heading text-lg tracking-[-0.03em]">
							{t('emailSettings')}
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						{services.map((service) => (
							<div key={service.name} className="flex items-center justify-between">
								<p className="font-sans text-sm text-foreground">{service.name}</p>
								<Badge variant={service.configured ? 'default' : 'secondary'}>
									{service.configured ? t('emailConfigured') : t('emailNotConfigured')}
								</Badge>
							</div>
						))}
					</CardContent>
				</Card>
			</div>

			<div className="mb-8 grid gap-6 lg:grid-cols-2">
				<Card>
					<CardHeader>
						<CardTitle className="font-heading text-lg tracking-[-0.03em]">
							{t('testMode')}
						</CardTitle>
					</CardHeader>
					<CardContent>
						<TestModeToggle initialEnabled={isTestMode} />
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle className="font-heading text-lg tracking-[-0.03em]">
							{t('rateLimitBypass')}
						</CardTitle>
					</CardHeader>
					<CardContent>
						<RateLimitToggle initialEnabled={isRateLimitBypassed} />
					</CardContent>
				</Card>
			</div>

			<Card className="mb-8">
				<CardHeader>
					<CardTitle className="font-heading text-lg tracking-[-0.03em]">
						{t('pipeline')}
					</CardTitle>
					<p className="font-sans text-xs text-muted-foreground">
						{t('pipelineDescription')}
					</p>
				</CardHeader>
				<CardContent className="space-y-6">
					<PipelineFeatureToggle
						id="upscaleEnabled"
						kind="upscale"
						label={t('pipelineUpscaleEnabledLabel')}
						description={t('pipelineUpscaleEnabledDescription')}
						pausedHint={t('pipelineUpscalePausedHint')}
						initialEnabled={upscaleEnabled}
					/>
					<Separator />
					<PipelineFeatureToggle
						id="environmentPreviewsEnabled"
						kind="environmentPreviews"
						label={t('pipelineEnvPreviewsEnabledLabel')}
						description={t('pipelineEnvPreviewsEnabledDescription')}
						pausedHint={t('pipelineEnvPreviewsPausedHint')}
						initialEnabled={envPreviewsEnabled}
					/>
					<Separator />
					<UpscaleTriggerToggle initialValue={upscaleTrigger} />
					<Separator />
					<div>
						<p className="mb-3 font-sans text-xs font-medium text-muted-foreground">
							{t('pipelineMetrics')}
						</p>
						{upscaleMetrics.total === 0 ? (
							<p className="font-sans text-sm text-muted-foreground">
								{t('pipelineMetricsNone')}
							</p>
						) : (
							<dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
								<div>
									<dt className="font-sans text-xs text-muted-foreground">
										{t('pipelineMetricsSuccess')}
									</dt>
									<dd className="font-heading text-xl font-semibold text-foreground">
										{upscaleMetrics.success}
									</dd>
								</div>
								<div>
									<dt className="font-sans text-xs text-muted-foreground">
										{t('pipelineMetricsFail')}
									</dt>
									<dd className="font-heading text-xl font-semibold text-foreground">
										{upscaleMetrics.fail}
									</dd>
								</div>
								<div>
									<dt className="font-sans text-xs text-muted-foreground">
										{t('pipelineMetricsProcessing')}
									</dt>
									<dd className="font-heading text-xl font-semibold text-foreground">
										{upscaleMetrics.processing + upscaleMetrics.pending}
									</dd>
								</div>
								<div>
									<dt className="font-sans text-xs text-muted-foreground">
										{t('pipelineMetricsAvgTime')}
									</dt>
									<dd className="font-heading text-xl font-semibold text-foreground">
										{upscaleMetrics.avgCostTimeMs != null
											? `${(upscaleMetrics.avgCostTimeMs / 1000).toFixed(1)}s`
											: '—'}
									</dd>
								</div>
							<div>
								<dt className="font-sans text-xs text-muted-foreground">
									{t('pipelineMetricsAvgDpi')}
								</dt>
								<dd className="font-heading text-xl font-semibold text-foreground">
									{upscaleMetrics.avgPrintDpi ?? '—'}
								</dd>
							</div>
						</dl>
					)}
				</div>
			</CardContent>
		</Card>

		<Card className="mb-8">
				<CardHeader>
					<CardTitle className="font-heading text-lg tracking-[-0.03em]">
						{t('heroMockupPipeline')}
					</CardTitle>
					<p className="font-sans text-xs text-muted-foreground">
						{t('heroMockupPipelineDescription')}
					</p>
				</CardHeader>
				<CardContent>
					{heroMockupMetrics.total === 0 ? (
						<p className="font-sans text-sm text-muted-foreground">
							{t('heroMockupMetricsNone')}
						</p>
					) : (
						<dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
							<div>
								<dt className="font-sans text-xs text-muted-foreground">
									{t('pipelineMetricsSuccess')}
								</dt>
								<dd className="font-heading text-xl font-semibold text-foreground">
									{heroMockupMetrics.success}
								</dd>
							</div>
							<div>
								<dt className="font-sans text-xs text-muted-foreground">
									{t('pipelineMetricsFail')}
								</dt>
								<dd className="font-heading text-xl font-semibold text-foreground">
									{heroMockupMetrics.fail}
								</dd>
							</div>
							<div>
								<dt className="font-sans text-xs text-muted-foreground">
									{t('pipelineMetricsProcessing')}
								</dt>
								<dd className="font-heading text-xl font-semibold text-foreground">
									{heroMockupMetrics.processing}
								</dd>
							</div>
							<div>
								<dt className="font-sans text-xs text-muted-foreground">
									{t('pipelineMetricsAvgTime')}
								</dt>
								<dd className="font-heading text-xl font-semibold text-foreground">
									{heroMockupMetrics.avgCostTimeMs != null
										? `${(heroMockupMetrics.avgCostTimeMs / 1000).toFixed(1)}s`
										: '—'}
								</dd>
							</div>
						</dl>
					)}
				</CardContent>
			</Card>

			<div className="overflow-hidden rounded-xl bg-surface-container">
				<div className="px-6 py-4">
					<h2 className="font-heading text-lg font-semibold tracking-[-0.03em] text-foreground">
						{t('envVariables')}
					</h2>
					<p className="mt-1 font-sans text-sm text-muted-foreground">
						{t('envVariablesDescription')}
					</p>
				</div>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>{t('variableColumn')}</TableHead>
							<TableHead>{t('statusColumn')}</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{envVars.map((key) => (
							<TableRow key={key}>
								<TableCell className="font-mono text-xs">{key}</TableCell>
								<TableCell>
									{isEnvSet(key) ? (
										<span className="font-sans text-xs text-success">{t('envSet')}</span>
									) : (
										<span className="font-sans text-xs text-muted-foreground">{t('envNotSet')}</span>
									)}
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>
		</div>
	)
}

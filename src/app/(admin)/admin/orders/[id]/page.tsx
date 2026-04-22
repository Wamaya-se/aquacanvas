import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { z } from 'zod'
import { ArrowLeft } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { OrderStatusChanger } from '@/components/admin/order-status-changer'
import { UpscaleActionButton } from '@/components/admin/upscale-action-button'
import { HeroMockupActionButton } from '@/components/admin/hero-mockup-action-button'
import { getSceneName } from '@/lib/db-helpers'
import { estimateOrderCredits, USD_PER_CREDIT } from '@/lib/ai-credits'
import type { PreviewStatus, UpscaleStatus } from '@/types/supabase'

export async function generateMetadata(): Promise<Metadata> {
	const t = await getTranslations('admin.meta')
	return { title: t('ordersTitle') }
}

interface OrderDetailPageProps {
	params: Promise<{ id: string }>
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
	const { id } = await params
	const t = await getTranslations('admin')
	const tStatus = await getTranslations('dashboard.orderStatus')

	const idParsed = z.string().uuid().safeParse(id)
	if (!idParsed.success) notFound()

	const supabase = await createClient()

	const { data: order, error } = await supabase
		.from('orders')
		.select('*, styles(name, slug), products(name, slug), print_formats(name)')
		.eq('id', idParsed.data)
		.single()

	if (error || !order) notFound()

	const styleName = (order.styles as { name: string } | null)?.name ?? '—'
	const productName = (order.products as { name: string } | null)?.name ?? null
	const formatName = (order.print_formats as { name: string } | null)?.name ?? null
	const price = order.price_cents
		? `${(order.price_cents / 100).toFixed(0)} SEK`
		: '—'
	const date = new Date(order.created_at).toLocaleDateString('sv-SE', {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
	})

	const originalImageUrl = order.original_image_path
		? supabase.storage.from('images').getPublicUrl(order.original_image_path).data.publicUrl
		: null
	const generatedImageUrl = order.generated_image_path
		? supabase.storage.from('images').getPublicUrl(order.generated_image_path).data.publicUrl
		: null
	const printImageUrl = order.print_image_path
		? supabase.storage.from('images').getPublicUrl(order.print_image_path).data.publicUrl
		: null
	const heroMockupImageUrl = order.hero_mockup_image_path
		? supabase.storage.from('images').getPublicUrl(order.hero_mockup_image_path).data.publicUrl
		: null

	const heroMockupStatus = order.hero_mockup_status as PreviewStatus
	const heroMockupStatusVariant: 'default' | 'secondary' | 'success' | 'warning' | 'destructive' =
		heroMockupStatus === 'success'
			? 'success'
			: heroMockupStatus === 'fail'
				? 'destructive'
				: heroMockupStatus === 'processing'
					? 'warning'
					: 'secondary'
	const heroMockupStatusKey = (
		`heroMockupStatus${heroMockupStatus.charAt(0).toUpperCase()}${heroMockupStatus.slice(1)}`
	) as
		| 'heroMockupStatusPending'
		| 'heroMockupStatusProcessing'
		| 'heroMockupStatusSuccess'
		| 'heroMockupStatusFail'

	const upscaleStatus = (order.upscale_status ?? null) as UpscaleStatus | null
	const printStatusVariant: 'default' | 'secondary' | 'success' | 'warning' | 'destructive' =
		upscaleStatus === 'success'
			? 'success'
			: upscaleStatus === 'fail'
				? 'destructive'
				: upscaleStatus === 'processing' || upscaleStatus === 'pending'
					? 'warning'
					: 'secondary'
	const printStatusKey = upscaleStatus
		? (`printStatus${upscaleStatus.charAt(0).toUpperCase()}${upscaleStatus.slice(1)}` as
				| 'printStatusPending'
				| 'printStatusProcessing'
				| 'printStatusSuccess'
				| 'printStatusFail'
				| 'printStatusSkipped')
		: ('printStatusIdle' as const)

	const { data: envPreviews } = await supabase
		.from('environment_previews')
		.select('id, status, image_path, ai_task_id, ai_cost_time_ms, metadata, environment_scenes!inner(name)')
		.eq('order_id', order.id)

	const environmentPreviews = (envPreviews ?? []).map((ep) => {
		const metadata = (ep.metadata ?? {}) as {
			fail_msg?: string | null
			fail_code?: string | null
			failed_at?: string | null
			stage?: string | null
		}
		return {
			name: getSceneName(ep.environment_scenes),
			status: ep.status,
			imageUrl: ep.image_path
				? supabase.storage.from('images').getPublicUrl(ep.image_path).data.publicUrl
				: null,
			taskId: ep.ai_task_id,
			costTimeMs: ep.ai_cost_time_ms,
			failMsg: metadata.fail_msg ?? null,
			failCode: metadata.fail_code ?? null,
			failStage: metadata.stage ?? null,
			failedAt: metadata.failed_at ?? null,
		}
	})

	const credits = estimateOrderCredits(
		{
			aiModel: order.ai_model,
			aiTaskId: order.ai_task_id,
			generatedImagePath: order.generated_image_path,
			generatedWidthPx: order.generated_width_px,
			generatedHeightPx: order.generated_height_px,
			heroMockupStatus,
			heroMockupTaskId: order.hero_mockup_task_id,
			upscaleStatus,
			upscaleTaskId: order.upscale_task_id,
		},
		environmentPreviews.map((ep) => ({ status: ep.status, taskId: ep.taskId })),
	)
	const estimatedUsdLabel = credits.estimatedUsd.toLocaleString('en-US', {
		style: 'currency',
		currency: 'USD',
		minimumFractionDigits: 2,
		maximumFractionDigits: 3,
	})

	return (
		<div>
			<div className="mb-8">
				<Button variant="ghost" size="sm" asChild className="mb-4">
					<Link href="/admin/orders">
						<ArrowLeft className="mr-2 size-4" aria-hidden="true" />
						{t('allOrders')}
					</Link>
				</Button>
				<div className="flex items-center gap-4">
					<h1 className="font-heading text-2xl font-bold tracking-[-0.03em] text-foreground">
						{t('orderNumber', { id: order.id.slice(0, 8) })}
					</h1>
					<Badge variant={order.status === 'paid' || order.status === 'shipped' ? 'default' : 'secondary'}>
						{tStatus(order.status as 'created')}
					</Badge>
				</div>
			</div>

			<div className="grid gap-6 lg:grid-cols-2">
				<div className="space-y-6">
					<div className="rounded-xl bg-surface-container p-6">
						<h2 className="mb-4 font-heading text-lg font-semibold tracking-[-0.03em] text-foreground">
							{t('orderDetail')}
						</h2>
						<dl className="space-y-3">
							<div className="flex justify-between">
								<dt className="font-sans text-sm text-muted-foreground">{t('orderDate')}</dt>
								<dd className="font-sans text-sm text-foreground">{date}</dd>
							</div>
							<Separator />
							<div className="flex justify-between">
								<dt className="font-sans text-sm text-muted-foreground">{t('orderStyle')}</dt>
								<dd className="font-sans text-sm text-foreground">{styleName}</dd>
							</div>
							<Separator />
							{productName && (
								<>
									<div className="flex justify-between">
										<dt className="font-sans text-sm text-muted-foreground">{t('orderProduct')}</dt>
										<dd className="font-sans text-sm text-foreground">{productName}</dd>
									</div>
									<Separator />
								</>
							)}
							<div className="flex justify-between">
								<dt className="font-sans text-sm text-muted-foreground">{t('orderFormat')}</dt>
								<dd className="font-sans text-sm text-foreground">{formatName ?? t('orderFormatNone')}</dd>
							</div>
							<Separator />
							<div className="flex justify-between">
								<dt className="font-sans text-sm text-muted-foreground">{t('orderPrice')}</dt>
								<dd className="font-heading text-sm font-semibold text-foreground">{price}</dd>
							</div>
							<Separator />
							<div className="flex justify-between">
								<dt className="font-sans text-sm text-muted-foreground">{t('orderCustomerEmail')}</dt>
								<dd className="font-sans text-sm text-foreground">
									{order.customer_email ?? '—'}
								</dd>
							</div>
							{order.stripe_session_id && (
								<>
									<Separator />
									<div className="flex justify-between">
										<dt className="font-sans text-sm text-muted-foreground">{t('stripeLabel')}</dt>
										<dd className="font-mono text-xs text-muted-foreground">
											{order.stripe_session_id.slice(0, 24)}…
										</dd>
									</div>
								</>
							)}
						</dl>
					</div>

					<div className="rounded-xl bg-surface-container p-6">
						<h2 className="mb-4 font-heading text-lg font-semibold tracking-[-0.03em] text-foreground">
							{t('changeStatus')}
						</h2>
						<OrderStatusChanger
							orderId={order.id}
							currentStatus={order.status}
						/>
					</div>
				</div>

				<div className="space-y-6">
					<div className="rounded-xl bg-surface-container p-6">
						<div className="mb-4 flex items-center justify-between gap-3">
							<h2 className="font-heading text-lg font-semibold tracking-[-0.03em] text-foreground">
								{t('printFile')}
							</h2>
							<Badge variant={printStatusVariant}>{t(printStatusKey)}</Badge>
						</div>
						<dl className="space-y-3">
							<div className="flex justify-between">
								<dt className="font-sans text-sm text-muted-foreground">
									{t('printFileDpi')}
								</dt>
								<dd className="font-sans text-sm text-foreground">
									{order.print_dpi ?? '—'}
								</dd>
							</div>
							<Separator />
							<div className="flex justify-between">
								<dt className="font-sans text-sm text-muted-foreground">
									{t('printFileCostTime')}
								</dt>
								<dd className="font-sans text-sm text-foreground">
									{order.upscale_cost_time_ms != null
										? `${(order.upscale_cost_time_ms / 1000).toFixed(1)}s`
										: '—'}
								</dd>
							</div>
							{order.upscale_task_id && (
								<>
									<Separator />
									<div className="flex justify-between">
										<dt className="font-sans text-sm text-muted-foreground">
											{t('printFileTaskId')}
										</dt>
										<dd className="font-mono text-xs text-muted-foreground break-all">
											{order.upscale_task_id.slice(0, 24)}
											{order.upscale_task_id.length > 24 ? '…' : ''}
										</dd>
									</div>
								</>
							)}
						</dl>
						<div className="mt-4 flex flex-col gap-3">
							{printImageUrl ? (
								<Button variant="outline" size="sm" asChild>
									<a href={printImageUrl} target="_blank" rel="noreferrer">
										{t('printFileDownload')}
									</a>
								</Button>
							) : (
								<p className="font-sans text-xs text-muted-foreground">
									{t('printFileNone')}
								</p>
							)}
							<UpscaleActionButton
								orderId={order.id}
								status={upscaleStatus}
								hasGeneratedImage={Boolean(order.generated_image_path)}
							/>
						</div>
					</div>

					<div className="rounded-xl bg-surface-container p-6">
						<div className="mb-4 flex items-center justify-between gap-3">
							<h2 className="font-heading text-lg font-semibold tracking-[-0.03em] text-foreground">
								{t('heroMockupSection')}
							</h2>
							<Badge variant={heroMockupStatusVariant}>
								{t(heroMockupStatusKey)}
							</Badge>
						</div>
						<dl className="space-y-3">
							<div className="flex justify-between">
								<dt className="font-sans text-sm text-muted-foreground">
									{t('heroMockupCostTime')}
								</dt>
								<dd className="font-sans text-sm text-foreground">
									{order.hero_mockup_ai_cost_time_ms != null
										? `${(order.hero_mockup_ai_cost_time_ms / 1000).toFixed(1)}s`
										: '—'}
								</dd>
							</div>
							{order.hero_mockup_task_id && (
								<>
									<Separator />
									<div className="flex justify-between">
										<dt className="font-sans text-sm text-muted-foreground">
											{t('heroMockupTaskId')}
										</dt>
										<dd className="font-mono text-xs text-muted-foreground break-all">
											{order.hero_mockup_task_id.slice(0, 24)}
											{order.hero_mockup_task_id.length > 24 ? '…' : ''}
										</dd>
									</div>
								</>
							)}
						</dl>
						<div className="mt-4 flex flex-col gap-3">
							{heroMockupImageUrl ? (
								<div className="overflow-hidden rounded-lg">
									<Image
										src={heroMockupImageUrl}
										alt={t('heroMockupSection')}
										width={400}
										height={300}
										unoptimized
										className="h-auto w-full object-cover"
									/>
								</div>
							) : (
								<p className="font-sans text-xs text-muted-foreground">
									{t('heroMockupNone')}
								</p>
							)}
							{heroMockupImageUrl && (
								<Button variant="outline" size="sm" asChild>
									<a href={heroMockupImageUrl} target="_blank" rel="noreferrer">
										{t('heroMockupOpen')}
									</a>
								</Button>
							)}
							<HeroMockupActionButton
								orderId={order.id}
								status={heroMockupStatus}
								hasGeneratedImage={Boolean(order.generated_image_path)}
							/>
						</div>
					</div>

					<div className="rounded-xl bg-surface-container p-6">
						<h2 className="mb-1 font-heading text-lg font-semibold tracking-[-0.03em] text-foreground">
							{t('orderCreditsSection')}
						</h2>
						<p className="mb-4 font-sans text-xs text-muted-foreground">
							{t('orderCreditsHint')}
						</p>
						<dl className="space-y-3">
							<div className="flex items-start justify-between gap-4">
								<dt className="font-sans text-sm text-muted-foreground">
									{t('orderCreditsGeneration')}
									<span className="block font-mono text-xs text-muted-foreground/70">
										{credits.generation.model}
									</span>
								</dt>
								<dd className="font-sans text-sm text-foreground text-right">
									{credits.generation.used
										? t('orderCreditsValue', { credits: credits.generation.credits })
										: '—'}
								</dd>
							</div>
							<Separator />
							<div className="flex items-start justify-between gap-4">
								<dt className="font-sans text-sm text-muted-foreground">
									{t('orderCreditsHeroMockup')}
									<span className="block font-mono text-xs text-muted-foreground/70">
										{credits.heroMockup.model}
									</span>
								</dt>
								<dd className="font-sans text-sm text-foreground text-right">
									{credits.heroMockup.used
										? t('orderCreditsValue', { credits: credits.heroMockup.credits })
										: '—'}
								</dd>
							</div>
							<Separator />
							<div className="flex items-start justify-between gap-4">
								<dt className="font-sans text-sm text-muted-foreground">
									{t('orderCreditsUpscale')}
									<span className="block font-mono text-xs text-muted-foreground/70">
										{credits.upscale.model}
										{credits.upscale.tier ? ` · ${credits.upscale.tier}` : ''}
									</span>
								</dt>
								<dd className="font-sans text-sm text-foreground text-right">
									{credits.upscale.used
										? t('orderCreditsValue', { credits: credits.upscale.credits })
										: '—'}
								</dd>
							</div>
							<Separator />
							<div className="flex items-start justify-between gap-4">
								<dt className="font-sans text-sm text-muted-foreground">
									{t('orderCreditsEnvPreviews')}
									<span className="block font-mono text-xs text-muted-foreground/70">
										{credits.environmentPreviews.model}
									</span>
									{credits.environmentPreviews.used && (
										<span className="block font-sans text-xs text-muted-foreground">
											{t('orderCreditsEnvPreviewsCount', {
												total: credits.environmentPreviews.count,
												success: credits.environmentPreviews.successCount,
												fail: credits.environmentPreviews.failCount,
											})}
										</span>
									)}
								</dt>
								<dd className="font-sans text-sm text-foreground text-right">
									{credits.environmentPreviews.used
										? t('orderCreditsValue', {
												credits: credits.environmentPreviews.credits,
											})
										: '—'}
								</dd>
							</div>
							<Separator />
							<div className="flex items-center justify-between gap-4">
								<dt className="font-heading text-sm font-semibold text-foreground">
									{t('orderCreditsTotal')}
								</dt>
								<dd className="font-heading text-base font-semibold text-foreground">
									{t('orderCreditsValue', { credits: credits.totalCredits })}
								</dd>
							</div>
							<div className="flex items-center justify-between gap-4">
								<dt className="font-sans text-xs text-muted-foreground">
									{t('orderCreditsEstimatedUsd')}
								</dt>
								<dd className="font-sans text-xs text-muted-foreground">
									{credits.totalCredits > 0 ? estimatedUsdLabel : '—'}
								</dd>
							</div>
						</dl>
						<p className="mt-4 font-sans text-xs text-muted-foreground">
							{t('orderCreditsDisclaimer', {
								rate: USD_PER_CREDIT.toFixed(3),
							})}
						</p>
					</div>

					{(order.ai_model || order.ai_task_id || order.ai_cost_time_ms) && (
						<div className="rounded-xl bg-surface-container p-6">
							<h2 className="mb-4 font-heading text-lg font-semibold tracking-[-0.03em] text-foreground">
								{t('aiInfo')}
							</h2>
							<dl className="space-y-3">
								{order.ai_model && (
									<div className="flex justify-between">
										<dt className="font-sans text-sm text-muted-foreground">{t('aiModel')}</dt>
										<dd className="font-mono text-xs text-foreground">{order.ai_model}</dd>
									</div>
								)}
								{order.ai_cost_time_ms != null && (
									<>
										<Separator />
										<div className="flex justify-between">
											<dt className="font-sans text-sm text-muted-foreground">{t('aiCostTime')}</dt>
											<dd className="font-sans text-sm text-foreground">
												{(order.ai_cost_time_ms / 1000).toFixed(1)}s
											</dd>
										</div>
									</>
								)}
								{order.ai_task_id && (
									<>
										<Separator />
										<div className="flex justify-between">
											<dt className="font-sans text-sm text-muted-foreground">{t('aiTaskId')}</dt>
											<dd className="font-mono text-xs text-muted-foreground">
												{order.ai_task_id.slice(0, 24)}{order.ai_task_id.length > 24 ? '…' : ''}
											</dd>
										</div>
									</>
								)}
							</dl>
						</div>
					)}

					<div className="rounded-xl bg-surface-container p-6">
						<h2 className="mb-4 font-heading text-lg font-semibold tracking-[-0.03em] text-foreground">
							{t('orderImages')}
						</h2>
						<div className="grid gap-4 sm:grid-cols-2">
							<div>
								<p className="mb-2 font-sans text-xs font-medium text-muted-foreground">
									{t('originalImage')}
								</p>
								{originalImageUrl ? (
									<div className="overflow-hidden rounded-lg">
										<Image
											src={originalImageUrl}
											alt={t('originalImage')}
											width={400}
											height={400}
											unoptimized
											className="h-auto w-full object-cover"
										/>
									</div>
								) : (
									<div className="flex aspect-square items-center justify-center rounded-lg bg-surface-container-high">
										<span className="text-sm text-muted-foreground">—</span>
									</div>
								)}
							</div>
							<div>
								<p className="mb-2 font-sans text-xs font-medium text-muted-foreground">
									{t('generatedImage')}
								</p>
								{generatedImageUrl ? (
									<div className="overflow-hidden rounded-lg">
										<Image
											src={generatedImageUrl}
											alt={t('generatedImage')}
											width={400}
											height={400}
											unoptimized
											className="h-auto w-full object-cover"
										/>
									</div>
								) : (
									<div className="flex aspect-square items-center justify-center rounded-lg bg-surface-container-high">
										<span className="text-sm text-muted-foreground">—</span>
									</div>
								)}
							</div>
						</div>
					</div>

					{environmentPreviews.length > 0 && (
						<div className="rounded-xl bg-surface-container p-6">
							<h2 className="mb-4 font-heading text-lg font-semibold tracking-[-0.03em] text-foreground">
								{t('orderEnvironmentPreviews')}
							</h2>
							<div className="grid gap-4 sm:grid-cols-3">
								{environmentPreviews.map((ep, i) => (
									<div key={i} className="space-y-2">
										<p className="font-sans text-xs font-medium text-muted-foreground">
											{ep.name}
										</p>
										{ep.imageUrl ? (
											<div className="overflow-hidden rounded-lg">
												<Image
													src={ep.imageUrl}
													alt={ep.name}
													width={300}
													height={200}
													unoptimized
													className="h-auto w-full object-cover"
												/>
											</div>
										) : (
											<div className="flex aspect-[3/2] items-center justify-center rounded-lg bg-surface-container-high">
												<Badge variant="secondary">
													{t(`previewStatus${ep.status.charAt(0).toUpperCase()}${ep.status.slice(1)}` as 'previewStatusPending')}
												</Badge>
											</div>
										)}
										{ep.status === 'fail' && (ep.failMsg || ep.failCode || ep.taskId || ep.failStage) && (
											<dl className="space-y-1 rounded-lg bg-destructive/5 p-3 text-xs">
												{ep.failMsg && (
													<div>
														<dt className="font-sans font-medium text-destructive">
															{t('previewFailReason')}
														</dt>
														<dd className="font-sans text-muted-foreground break-words">
															{ep.failMsg}
														</dd>
													</div>
												)}
												{ep.failStage && (
													<div>
														<dt className="font-sans font-medium text-muted-foreground">
															{t('previewFailStage')}
														</dt>
														<dd className="font-mono text-muted-foreground">
															{ep.failStage}
														</dd>
													</div>
												)}
												{ep.failCode && (
													<div>
														<dt className="font-sans font-medium text-muted-foreground">
															{t('previewFailCode')}
														</dt>
														<dd className="font-mono text-muted-foreground">
															{ep.failCode}
														</dd>
													</div>
												)}
												{ep.failedAt && (
													<div>
														<dt className="font-sans font-medium text-muted-foreground">
															{t('previewFailedAt')}
														</dt>
														<dd className="font-mono text-muted-foreground">
															{new Date(ep.failedAt).toLocaleString('sv-SE')}
														</dd>
													</div>
												)}
												{ep.taskId && (
													<div>
														<dt className="font-sans font-medium text-muted-foreground">
															{t('aiTaskId')}
														</dt>
														<dd className="font-mono text-muted-foreground break-all">
															{ep.taskId}
														</dd>
													</div>
												)}
											</dl>
										)}
									</div>
								))}
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	)
}

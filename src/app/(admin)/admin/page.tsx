import type { Metadata } from 'next'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import {
	getUpscaleMetrics,
	getHeroMockupMetrics,
} from '@/lib/actions/admin-settings'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'

export async function generateMetadata(): Promise<Metadata> {
	const t = await getTranslations('admin.meta')
	return { title: t('dashboardTitle') }
}

export default async function AdminDashboardPage() {
	const t = await getTranslations('admin')
	const tStatus = await getTranslations('dashboard.orderStatus')
	const supabase = await createClient()

	const today = new Date()
	today.setHours(0, 0, 0, 0)
	const todayIso = today.toISOString()

	const [
		allOrdersResult,
		paidOrdersResult,
		todayOrdersResult,
		pendingResult,
		recentResult,
		pipelineHealth,
		heroMockupHealth,
	] = await Promise.all([
		supabase.from('orders').select('id', { count: 'exact', head: true }),
		supabase
			.from('orders')
			.select('price_cents')
			.in('status', ['paid', 'shipped']),
		supabase
			.from('orders')
			.select('id', { count: 'exact', head: true })
			.gte('created_at', todayIso),
		supabase
			.from('orders')
			.select('id', { count: 'exact', head: true })
			.in('status', ['created', 'processing', 'generated']),
		supabase
			.from('orders')
			.select('id, status, price_cents, customer_email, created_at, styles(name)')
			.order('created_at', { ascending: false })
			.limit(10),
		getUpscaleMetrics({ days: 7 }),
		getHeroMockupMetrics({ days: 7 }),
	])

	const totalOrders = allOrdersResult.count ?? 0
	const todayCount = todayOrdersResult.count ?? 0
	const pendingCount = pendingResult.count ?? 0
	const totalRevenue = (paidOrdersResult.data ?? []).reduce(
		(sum, o) => sum + (o.price_cents ?? 0),
		0,
	)
	const revenueFormatted = `${(totalRevenue / 100).toLocaleString('sv-SE')} SEK`

	const recentOrders = recentResult.data ?? []

	const stats = [
		{ label: t('totalRevenue'), value: revenueFormatted },
		{ label: t('totalOrders'), value: totalOrders.toString() },
		{ label: t('todayOrders'), value: todayCount.toString() },
		{ label: t('pendingOrders'), value: pendingCount.toString() },
	]

	return (
		<div>
			<h1 className="mb-8 font-heading text-2xl font-bold tracking-[-0.03em] text-foreground">
				{t('dashboard')}
			</h1>

			<div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
				{stats.map((stat) => (
					<Card key={stat.label}>
						<CardHeader className="pb-2">
							<CardTitle className="font-sans text-xs font-medium text-muted-foreground">
								{stat.label}
							</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="font-heading text-2xl font-bold tracking-[-0.03em] text-foreground">
								{stat.value}
							</p>
						</CardContent>
					</Card>
				))}
			</div>

			<Card className="mb-8">
				<CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
					<CardTitle className="font-heading text-lg tracking-[-0.03em]">
						{t('pipelineHealthWeek')}
					</CardTitle>
					<Button variant="ghost" size="sm" asChild>
						<Link href="/admin/settings">{t('viewSettings')}</Link>
					</Button>
				</CardHeader>
				<CardContent>
					{pipelineHealth.total === 0 ? (
						<p className="font-sans text-sm text-muted-foreground">
							{t('pipelineHealthEmpty')}
						</p>
					) : (
						<dl className="grid grid-cols-2 gap-4 sm:grid-cols-5">
							<div>
								<dt className="font-sans text-xs text-muted-foreground">
									{t('pipelineHealthSuccessRate')}
								</dt>
								<dd className="font-heading text-2xl font-semibold text-foreground">
									{pipelineHealth.successRate != null
										? `${Math.round(pipelineHealth.successRate * 100)}%`
										: '—'}
								</dd>
							</div>
							<div>
								<dt className="font-sans text-xs text-muted-foreground">
									{t('pipelineHealthFailed')}
								</dt>
								<dd className="font-heading text-2xl font-semibold text-foreground">
									{pipelineHealth.fail}
								</dd>
							</div>
							<div>
								<dt className="font-sans text-xs text-muted-foreground">
									{t('pipelineHealthInFlight')}
								</dt>
								<dd className="font-heading text-2xl font-semibold text-foreground">
									{pipelineHealth.pending + pipelineHealth.processing}
								</dd>
							</div>
							<div>
								<dt className="font-sans text-xs text-muted-foreground">
									{t('pipelineHealthAvgTime')}
								</dt>
								<dd className="font-heading text-2xl font-semibold text-foreground">
									{pipelineHealth.avgCostTimeMs != null
										? `${(pipelineHealth.avgCostTimeMs / 1000).toFixed(1)}s`
										: '—'}
								</dd>
							</div>
							<div>
								<dt className="font-sans text-xs text-muted-foreground">
									{t('pipelineHealthAvgDpi')}
								</dt>
								<dd className="font-heading text-2xl font-semibold text-foreground">
									{pipelineHealth.avgPrintDpi ?? '—'}
								</dd>
							</div>
						</dl>
					)}
				</CardContent>
			</Card>

			<Card className="mb-8">
				<CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
					<CardTitle className="font-heading text-lg tracking-[-0.03em]">
						{t('heroMockupHealthWeek')}
					</CardTitle>
					<Button variant="ghost" size="sm" asChild>
						<Link href="/admin/settings">{t('viewSettings')}</Link>
					</Button>
				</CardHeader>
				<CardContent>
					{heroMockupHealth.total === 0 ? (
						<p className="font-sans text-sm text-muted-foreground">
							{t('heroMockupHealthEmpty')}
						</p>
					) : (
						<dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
							<div>
								<dt className="font-sans text-xs text-muted-foreground">
									{t('pipelineHealthSuccessRate')}
								</dt>
								<dd className="font-heading text-2xl font-semibold text-foreground">
									{heroMockupHealth.successRate != null
										? `${Math.round(heroMockupHealth.successRate * 100)}%`
										: '—'}
								</dd>
							</div>
							<div>
								<dt className="font-sans text-xs text-muted-foreground">
									{t('pipelineHealthFailed')}
								</dt>
								<dd className="font-heading text-2xl font-semibold text-foreground">
									{heroMockupHealth.fail}
								</dd>
							</div>
							<div>
								<dt className="font-sans text-xs text-muted-foreground">
									{t('pipelineHealthInFlight')}
								</dt>
								<dd className="font-heading text-2xl font-semibold text-foreground">
									{heroMockupHealth.processing}
								</dd>
							</div>
							<div>
								<dt className="font-sans text-xs text-muted-foreground">
									{t('pipelineHealthAvgTime')}
								</dt>
								<dd className="font-heading text-2xl font-semibold text-foreground">
									{heroMockupHealth.avgCostTimeMs != null
										? `${(heroMockupHealth.avgCostTimeMs / 1000).toFixed(1)}s`
										: '—'}
								</dd>
							</div>
						</dl>
					)}
				</CardContent>
			</Card>

		<div className="overflow-x-auto rounded-xl bg-surface-container">
			<div className="flex items-center justify-between px-6 py-4">
					<h2 className="font-heading text-lg font-semibold tracking-[-0.03em] text-foreground">
						{t('recentOrders')}
					</h2>
					<Button variant="ghost" size="sm" asChild>
						<Link href="/admin/orders">{t('viewAll')}</Link>
					</Button>
				</div>
				{recentOrders.length === 0 ? (
					<div className="px-6 pb-6">
						<p className="font-sans text-sm text-muted-foreground">
							{t('noOrders')}
						</p>
					</div>
				) : (
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>{t('orderColumn')}</TableHead>
								<TableHead>{t('orderCustomerEmail')}</TableHead>
								<TableHead>{t('orderStyle')}</TableHead>
								<TableHead>{t('orderStatus')}</TableHead>
								<TableHead>{t('orderPrice')}</TableHead>
								<TableHead>{t('orderDate')}</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{recentOrders.map((order) => {
								const styleName = (order.styles as { name: string } | null)?.name ?? '—'
								const price = order.price_cents
									? `${(order.price_cents / 100).toFixed(0)} SEK`
									: '—'
								const date = new Date(order.created_at).toLocaleDateString('sv-SE')

								return (
									<TableRow key={order.id}>
										<TableCell>
											<Link
												href={`/admin/orders/${order.id}`}
												className="font-mono text-xs font-medium text-brand hover:underline"
											>
												#{order.id.slice(0, 8)}
											</Link>
										</TableCell>
										<TableCell className="text-muted-foreground">
											{order.customer_email ?? '—'}
										</TableCell>
										<TableCell>{styleName}</TableCell>
										<TableCell>
											<Badge
												variant={
													order.status === 'paid' || order.status === 'shipped'
														? 'default'
														: 'secondary'
												}
											>
												{tStatus(order.status as 'created')}
											</Badge>
										</TableCell>
										<TableCell>{price}</TableCell>
										<TableCell className="text-muted-foreground">{date}</TableCell>
									</TableRow>
								)
							})}
						</TableBody>
					</Table>
				)}
			</div>
		</div>
	)
}

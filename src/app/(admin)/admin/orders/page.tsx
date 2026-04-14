import type { Metadata } from 'next'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'
import { OrderStatusFilter } from '@/components/admin/order-status-filter'
import { ExportCsvButton } from '@/components/admin/export-csv-button'
import type { OrderStatus } from '@/types/supabase'

export async function generateMetadata(): Promise<Metadata> {
	const t = await getTranslations('admin.meta')
	return { title: t('ordersTitle') }
}

interface OrdersPageProps {
	searchParams: Promise<{ status?: string }>
}

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'outline'> = {
	created: 'outline',
	processing: 'secondary',
	generated: 'secondary',
	paid: 'default',
	shipped: 'default',
}

export default async function AdminOrdersPage({ searchParams }: OrdersPageProps) {
	const t = await getTranslations('admin')
	const tStatus = await getTranslations('dashboard.orderStatus')
	const params = await searchParams
	const supabase = await createClient()

	let query = supabase
		.from('orders')
		.select('id, status, price_cents, customer_email, guest_session_id, created_at, style_id, product_id, styles(name), products(name)')
		.order('created_at', { ascending: false })
		.limit(100)

	const validStatuses: OrderStatus[] = ['created', 'processing', 'generated', 'paid', 'shipped']
	if (params.status && params.status !== 'all' && validStatuses.includes(params.status as OrderStatus)) {
		query = query.eq('status', params.status as OrderStatus)
	}

	const { data: orders, error } = await query

	if (error) throw new Error('Failed to load orders')

	return (
		<div>
			<div className="mb-8 flex flex-wrap items-center justify-between gap-3">
				<h1 className="font-heading text-2xl font-bold tracking-[-0.03em] text-foreground">
					{t('allOrders')}
				</h1>
				<div className="flex items-center gap-3">
					<ExportCsvButton currentStatus={params.status ?? 'all'} />
					<OrderStatusFilter currentStatus={params.status ?? 'all'} />
				</div>
			</div>

			{!orders || orders.length === 0 ? (
				<div className="flex flex-col items-center justify-center rounded-xl bg-surface-container py-16">
					<p className="font-sans text-sm text-muted-foreground">
						{t('noOrders')}
					</p>
				</div>
			) : (
				<div className="overflow-x-auto rounded-xl bg-surface-container">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>{t('orderColumn')}</TableHead>
								<TableHead>{t('orderCustomerEmail')}</TableHead>
								<TableHead>{t('orderStyle')}</TableHead>
								<TableHead>{t('orderProduct')}</TableHead>
								<TableHead>{t('orderStatus')}</TableHead>
								<TableHead>{t('orderPrice')}</TableHead>
								<TableHead>{t('orderDate')}</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{orders.map((order) => {
								const styleName = (order.styles as { name: string } | null)?.name ?? '—'
								const productName = (order.products as { name: string } | null)?.name ?? '—'
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
										<TableCell>{productName}</TableCell>
										<TableCell>
											<Badge variant={STATUS_VARIANT[order.status] ?? 'outline'}>
												{tStatus(order.status as 'created')}
											</Badge>
										</TableCell>
										<TableCell>{price}</TableCell>
										<TableCell className="text-muted-foreground">
											{date}
										</TableCell>
									</TableRow>
								)
							})}
						</TableBody>
					</Table>
				</div>
			)}
		</div>
	)
}

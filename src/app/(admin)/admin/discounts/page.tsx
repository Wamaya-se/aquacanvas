import type { Metadata } from 'next'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
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
import { ToggleDiscountButton } from '@/components/admin/toggle-discount-button'

export async function generateMetadata(): Promise<Metadata> {
	const t = await getTranslations('admin.meta')
	return { title: t('discountsTitle') }
}

export default async function AdminDiscountsPage() {
	const t = await getTranslations('admin')
	const supabase = await createClient()

	const { data: discounts, error } = await supabase
		.from('discount_codes')
		.select('*')
		.order('created_at', { ascending: false })

	if (error) throw new Error('Failed to load discount codes')

	return (
		<div>
			<div className="mb-8 flex items-center justify-between">
				<h1 className="font-heading text-2xl font-bold tracking-[-0.03em] text-foreground">
					{t('allDiscounts')}
				</h1>
				<Button variant="brand" size="sm" asChild>
					<Link href="/admin/discounts/new">{t('newDiscount')}</Link>
				</Button>
			</div>

			{!discounts || discounts.length === 0 ? (
				<div className="flex flex-col items-center justify-center rounded-xl bg-surface-container py-16">
					<p className="font-sans text-sm text-muted-foreground">
						{t('noDiscounts')}
					</p>
				</div>
			) : (
				<div className="overflow-x-auto rounded-xl bg-surface-container">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>{t('discountCode')}</TableHead>
								<TableHead>{t('discountValue')}</TableHead>
								<TableHead>{t('discountUsage')}</TableHead>
								<TableHead>{t('discountExpires')}</TableHead>
								<TableHead>{t('discountStatus')}</TableHead>
								<TableHead>{t('discountActions')}</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{discounts.map((discount) => {
								const value = discount.discount_percent
									? `${discount.discount_percent}%`
									: discount.discount_amount_cents
										? `${(discount.discount_amount_cents / 100).toFixed(0)} SEK`
										: '—'
								const usage = discount.max_uses
									? `${discount.current_uses} / ${discount.max_uses}`
									: `${discount.current_uses}`
								const expires = discount.expires_at
									? new Date(discount.expires_at).toLocaleDateString('sv-SE')
									: '—'
								const isExpired = discount.expires_at
									? new Date(discount.expires_at) < new Date()
									: false

								return (
									<TableRow key={discount.id}>
										<TableCell>
											<span className="font-mono text-sm font-medium text-foreground">
												{discount.code}
											</span>
										</TableCell>
										<TableCell>{value}</TableCell>
										<TableCell className="text-muted-foreground">{usage}</TableCell>
										<TableCell className="text-muted-foreground">{expires}</TableCell>
										<TableCell>
											{isExpired ? (
												<Badge variant="outline">{t('discountExpired')}</Badge>
											) : discount.is_active ? (
												<Badge variant="default">{t('active')}</Badge>
											) : (
												<Badge variant="secondary">{t('inactive')}</Badge>
											)}
										</TableCell>
										<TableCell>
											<ToggleDiscountButton
												discountId={discount.id}
												isActive={discount.is_active}
											/>
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

import type { Metadata } from 'next'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
	return { title: t('productsTitle') }
}

export default async function AdminProductsPage() {
	const t = await getTranslations('admin')
	const supabase = await createClient()

	const { data: products, error } = await supabase
		.from('products')
		.select('id, name, slug, is_active, sort_order, price_cents, style_id, styles(name)')
		.order('sort_order', { ascending: true })

	if (error) throw new Error('Failed to load products')

	return (
		<div>
			<div className="mb-8 flex items-center justify-between">
				<h1 className="font-heading text-2xl font-bold tracking-[-0.03em] text-foreground">
					{t('allProducts')}
				</h1>
				<Button variant="brand" size="sm" asChild>
					<Link href="/admin/products/new">
						<Plus className="mr-2 size-4" aria-hidden="true" />
						{t('newProduct')}
					</Link>
				</Button>
			</div>

			{!products || products.length === 0 ? (
				<div className="flex flex-col items-center justify-center rounded-xl bg-surface-container py-16">
					<p className="font-sans text-sm text-muted-foreground">
						{t('noProducts')}
					</p>
				</div>
			) : (
				<div className="overflow-x-auto rounded-xl bg-surface-container">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>{t('productName')}</TableHead>
								<TableHead>{t('productSlug')}</TableHead>
								<TableHead>{t('productStyle')}</TableHead>
								<TableHead>{t('productPrice')}</TableHead>
								<TableHead>{t('orderStatus')}</TableHead>
								<TableHead>{t('productSortOrder')}</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{products.map((product) => {
								const styleName = (product.styles as { name: string } | null)?.name ?? '—'
								const price = product.price_cents
									? `${(product.price_cents / 100).toFixed(0)} SEK`
								: t('priceDefault')

							return (
								<TableRow key={product.id}>
									<TableCell>
										<Link
											href={`/admin/products/${product.id}`}
											className="font-medium text-brand hover:underline"
										>
											{product.name}
										</Link>
									</TableCell>
									<TableCell className="text-muted-foreground">
										/p/{product.slug}
									</TableCell>
									<TableCell>{styleName}</TableCell>
									<TableCell>{price}</TableCell>
									<TableCell>
										<Badge variant={product.is_active ? 'default' : 'secondary'}>
											{product.is_active ? t('active') : t('inactive')}
										</Badge>
										</TableCell>
										<TableCell className="text-muted-foreground">
											{product.sort_order}
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

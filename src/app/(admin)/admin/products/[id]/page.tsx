import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { z } from 'zod'
import { getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { ProductForm } from '@/components/admin/product-form'
import { DeleteProductButton } from '@/components/admin/delete-product-button'
import { parseProductRow } from '@/lib/db-helpers'

export async function generateMetadata(): Promise<Metadata> {
	const t = await getTranslations('admin.meta')
	return { title: t('productsTitle') }
}

interface EditProductPageProps {
	params: Promise<{ id: string }>
}

export default async function EditProductPage({ params }: EditProductPageProps) {
	const { id } = await params
	const t = await getTranslations('admin')

	const idParsed = z.string().uuid().safeParse(id)
	if (!idParsed.success) notFound()

	const supabase = await createClient()

	const [productResult, stylesResult] = await Promise.all([
		supabase
			.from('products')
			.select('*')
			.eq('id', idParsed.data)
			.single(),
		supabase
			.from('styles')
			.select('id, name')
			.order('sort_order', { ascending: true }),
	])

	if (productResult.error || !productResult.data) notFound()
	if (stylesResult.error) throw new Error('Failed to load styles')

	return (
		<div>
			<div className="mb-8 flex items-center justify-between">
				<h1 className="font-heading text-2xl font-bold tracking-[-0.03em] text-foreground">
					{t('editProduct')}
				</h1>
				<DeleteProductButton
					productId={productResult.data.id}
					productName={productResult.data.name}
				/>
			</div>
			<div className="rounded-xl bg-surface-container p-6 lg:p-8">
				<ProductForm
					product={parseProductRow(productResult.data)}
					styles={stylesResult.data ?? []}
				/>
			</div>
		</div>
	)
}

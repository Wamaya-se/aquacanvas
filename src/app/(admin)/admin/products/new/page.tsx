import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { ProductForm } from '@/components/admin/product-form'

export async function generateMetadata(): Promise<Metadata> {
	const t = await getTranslations('admin.meta')
	return { title: t('productsTitle') }
}

export default async function NewProductPage() {
	const t = await getTranslations('admin')
	const supabase = await createClient()

	const { data: styles, error } = await supabase
		.from('styles')
		.select('id, name')
		.order('sort_order', { ascending: true })

	if (error) throw new Error('Failed to load styles')

	return (
		<div>
			<h1 className="mb-8 font-heading text-2xl font-bold tracking-[-0.03em] text-foreground">
				{t('newProduct')}
			</h1>
			<div className="rounded-xl bg-surface-container p-6 lg:p-8">
				<ProductForm styles={styles ?? []} />
			</div>
		</div>
	)
}

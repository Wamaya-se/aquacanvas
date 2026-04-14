import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { DiscountForm } from '@/components/admin/discount-form'

export async function generateMetadata(): Promise<Metadata> {
	const t = await getTranslations('admin.meta')
	return { title: t('discountsTitle') }
}

export default async function NewDiscountPage() {
	const t = await getTranslations('admin')

	return (
		<div>
			<div className="mb-8">
				<h1 className="font-heading text-2xl font-bold tracking-[-0.03em] text-foreground">
					{t('newDiscount')}
				</h1>
			</div>
			<div className="rounded-xl bg-surface-container p-6 lg:p-8">
				<DiscountForm />
			</div>
		</div>
	)
}

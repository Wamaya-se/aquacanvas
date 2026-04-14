import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { z } from 'zod'
import { getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { StyleForm } from '@/components/admin/style-form'

export async function generateMetadata(): Promise<Metadata> {
	const t = await getTranslations('admin.meta')
	return { title: t('stylesTitle') }
}

interface EditStylePageProps {
	params: Promise<{ id: string }>
}

export default async function EditStylePage({ params }: EditStylePageProps) {
	const { id } = await params
	const t = await getTranslations('admin')

	const idParsed = z.string().uuid().safeParse(id)
	if (!idParsed.success) notFound()

	const supabase = await createClient()
	const { data: style, error } = await supabase
		.from('styles')
		.select('*')
		.eq('id', idParsed.data)
		.single()

	if (error || !style) notFound()

	return (
		<div>
			<h1 className="mb-8 font-heading text-2xl font-bold tracking-[-0.03em] text-foreground">
				{t('editStyle')}: {style.name}
			</h1>
			<div className="rounded-xl bg-surface-container p-6 lg:p-8">
				<StyleForm style={style} />
			</div>
		</div>
	)
}

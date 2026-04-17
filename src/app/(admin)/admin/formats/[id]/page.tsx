import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { z } from 'zod'
import { ArrowLeft } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { FormatForm } from '@/components/admin/format-form'
import { parseFormatRow } from '@/lib/db-helpers'

export async function generateMetadata(): Promise<Metadata> {
	const t = await getTranslations('admin.meta')
	return { title: t('formatsTitle') }
}

interface EditFormatPageProps {
	params: Promise<{ id: string }>
}

export default async function EditFormatPage({ params }: EditFormatPageProps) {
	const { id } = await params
	const t = await getTranslations('admin')

	const idParsed = z.string().uuid().safeParse(id)
	if (!idParsed.success) notFound()

	const supabase = await createClient()

	const { data: format, error } = await supabase
		.from('print_formats')
		.select('*')
		.eq('id', idParsed.data)
		.single()

	if (error || !format) notFound()

	return (
		<div>
			<div className="mb-8">
				<Button variant="ghost" size="sm" asChild className="mb-4">
					<Link href="/admin/formats">
						<ArrowLeft className="mr-2 size-4" aria-hidden="true" />
						{t('allFormats')}
					</Link>
				</Button>
				<h1 className="font-heading text-2xl font-bold tracking-[-0.03em] text-foreground">
					{t('editFormat')}
				</h1>
			</div>
			<FormatForm format={parseFormatRow(format)} />
		</div>
	)
}

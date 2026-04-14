import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { Button } from '@/components/ui/button'
import { FormatForm } from '@/components/admin/format-form'

export async function generateMetadata(): Promise<Metadata> {
	const t = await getTranslations('admin.meta')
	return { title: t('formatsTitle') }
}

export default async function NewFormatPage() {
	const t = await getTranslations('admin')

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
					{t('newFormat')}
				</h1>
			</div>
			<FormatForm />
		</div>
	)
}

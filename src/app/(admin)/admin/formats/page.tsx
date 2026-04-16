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
	return { title: t('formatsTitle') }
}

export default async function AdminFormatsPage() {
	const t = await getTranslations('admin')
	const supabase = await createClient()

	const { data: formats } = await supabase
		.from('print_formats')
		.select('*')
		.order('sort_order', { ascending: true })

	return (
		<div>
			<div className="mb-8 flex items-center justify-between">
				<h1 className="font-heading text-2xl font-bold tracking-[-0.03em] text-foreground">
					{t('allFormats')}
				</h1>
				<Button variant="brand" size="sm" asChild>
					<Link href="/admin/formats/new">
						<Plus className="size-4" aria-hidden="true" />
						{t('newFormat')}
					</Link>
				</Button>
			</div>

			{!formats?.length ? (
				<div className="rounded-xl bg-surface-container px-6 py-16 text-center">
					<p className="font-sans text-sm text-muted-foreground">
						{t('noFormats')}
					</p>
				</div>
			) : (
				<div className="overflow-x-auto rounded-xl bg-surface-container">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>{t('formatName')}</TableHead>
								<TableHead>{t('formatType')}</TableHead>
								<TableHead>{t('formatOrientation')}</TableHead>
								<TableHead className="text-right">{t('formatWidth')}</TableHead>
								<TableHead className="text-right">{t('formatHeight')}</TableHead>
								<TableHead className="text-right">{t('formatPrice')}</TableHead>
								<TableHead>{t('orderStatus')}</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{formats.map((format) => (
								<TableRow key={format.id}>
									<TableCell>
										<Link
											href={`/admin/formats/${format.id}`}
											className="font-medium text-foreground hover:text-brand"
										>
											{format.name}
										</Link>
									</TableCell>
									<TableCell className="text-muted-foreground">
										{format.format_type}
									</TableCell>
									<TableCell className="text-muted-foreground capitalize">
										{format.orientation}
									</TableCell>
									<TableCell className="text-right text-muted-foreground">
										{format.width_cm}
									</TableCell>
									<TableCell className="text-right text-muted-foreground">
										{format.height_cm}
									</TableCell>
									<TableCell className="text-right font-medium">
										{(format.price_cents / 100).toFixed(0)} SEK
									</TableCell>
									<TableCell>
										<Badge variant={format.is_active ? 'default' : 'secondary'}>
											{format.is_active ? t('active') : t('inactive')}
										</Badge>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>
			)}
		</div>
	)
}

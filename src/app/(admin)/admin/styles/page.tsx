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

export async function generateMetadata(): Promise<Metadata> {
	const t = await getTranslations('admin.meta')
	return { title: t('stylesTitle') }
}

export default async function AdminStylesPage() {
	const t = await getTranslations('admin')
	const supabase = await createClient()

	const { data: styles, error } = await supabase
		.from('styles')
		.select('id, name, slug, is_active, sort_order, price_cents')
		.order('sort_order', { ascending: true })

	if (error) throw new Error('Failed to load styles')

	return (
		<div>
			<h1 className="mb-8 font-heading text-2xl font-bold tracking-[-0.03em] text-foreground">
				{t('allStyles')}
			</h1>

			<div className="overflow-x-auto rounded-xl bg-surface-container">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>{t('styleName')}</TableHead>
							<TableHead>{t('styleSlug')}</TableHead>
							<TableHead>{t('stylePrice')}</TableHead>
							<TableHead>{t('orderStatus')}</TableHead>
							<TableHead>{t('styleSortOrder')}</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{(styles ?? []).map((style) => (
							<TableRow key={style.id}>
								<TableCell>
									<Link
										href={`/admin/styles/${style.id}`}
										className="font-medium text-brand hover:underline"
									>
										{style.name}
									</Link>
								</TableCell>
								<TableCell className="text-muted-foreground">
									{style.slug}
								</TableCell>
								<TableCell>
									{(style.price_cents / 100).toFixed(0)} SEK
								</TableCell>
								<TableCell>
									<Badge variant={style.is_active ? 'default' : 'secondary'}>
										{style.is_active ? t('active') : t('inactive')}
									</Badge>
								</TableCell>
								<TableCell className="text-muted-foreground">
									{style.sort_order}
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>
		</div>
	)
}

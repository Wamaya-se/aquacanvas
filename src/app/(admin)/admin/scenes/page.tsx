import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
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
	return { title: t('scenesTitle') }
}

export default async function AdminScenesPage() {
	const t = await getTranslations('admin')
	const supabase = await createClient()

	const { data: scenes } = await supabase
		.from('environment_scenes')
		.select('*')
		.order('sort_order', { ascending: true })

	return (
		<div>
			<div className="mb-8 flex items-center justify-between">
				<h1 className="font-heading text-2xl font-bold tracking-[-0.03em] text-foreground">
					{t('allScenes')}
				</h1>
				<Button variant="brand" size="sm" asChild>
					<Link href="/admin/scenes/new">
						<Plus className="size-4" aria-hidden="true" />
						{t('newScene')}
					</Link>
				</Button>
			</div>

			{!scenes?.length ? (
				<div className="rounded-xl bg-surface-container px-6 py-16 text-center">
					<p className="font-sans text-sm text-muted-foreground">
						{t('noScenes')}
					</p>
				</div>
			) : (
				<div className="overflow-x-auto rounded-xl bg-surface-container">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead className="w-20">{t('sceneImage')}</TableHead>
								<TableHead>{t('sceneName')}</TableHead>
								<TableHead>{t('sceneDescription')}</TableHead>
								<TableHead className="text-right">{t('sceneSortOrder')}</TableHead>
								<TableHead>{t('orderStatus')}</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{scenes.map((scene) => {
								const imageUrl = scene.image_path
									? supabase.storage.from('images').getPublicUrl(scene.image_path).data.publicUrl
									: null

								return (
									<TableRow key={scene.id}>
										<TableCell>
											{imageUrl && (
												<div className="relative size-12 overflow-hidden rounded-lg">
													<Image
														src={imageUrl}
														alt={scene.name}
														fill
														unoptimized
														className="object-cover"
													/>
												</div>
											)}
										</TableCell>
										<TableCell>
											<Link
												href={`/admin/scenes/${scene.id}`}
												className="font-medium text-foreground hover:text-brand"
											>
												{scene.name}
											</Link>
										</TableCell>
										<TableCell className="max-w-xs truncate text-muted-foreground">
											{scene.description}
										</TableCell>
										<TableCell className="text-right text-muted-foreground">
											{scene.sort_order}
										</TableCell>
										<TableCell>
											<Badge variant={scene.is_active ? 'default' : 'secondary'}>
												{scene.is_active ? t('active') : t('inactive')}
											</Badge>
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

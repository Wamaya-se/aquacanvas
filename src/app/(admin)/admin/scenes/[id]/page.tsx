import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { z } from 'zod'
import { ArrowLeft } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { SceneForm } from '@/components/admin/scene-form'

export async function generateMetadata(): Promise<Metadata> {
	const t = await getTranslations('admin.meta')
	return { title: t('scenesTitle') }
}

interface EditScenePageProps {
	params: Promise<{ id: string }>
}

export default async function EditScenePage({ params }: EditScenePageProps) {
	const { id } = await params
	const t = await getTranslations('admin')

	const idParsed = z.string().uuid().safeParse(id)
	if (!idParsed.success) notFound()

	const supabase = await createClient()

	const { data: scene, error } = await supabase
		.from('environment_scenes')
		.select('*')
		.eq('id', idParsed.data)
		.single()

	if (error || !scene) notFound()

	const imageUrl = scene.image_path
		? supabase.storage.from('images').getPublicUrl(scene.image_path).data.publicUrl
		: null

	return (
		<div>
			<div className="mb-8">
				<Button variant="ghost" size="sm" asChild className="mb-4">
					<Link href="/admin/scenes">
						<ArrowLeft className="mr-2 size-4" aria-hidden="true" />
						{t('allScenes')}
					</Link>
				</Button>
				<h1 className="font-heading text-2xl font-bold tracking-[-0.03em] text-foreground">
					{t('editScene')}
				</h1>
			</div>
			<SceneForm
				scene={{
					id: scene.id,
					name: scene.name,
					description: scene.description,
					image_url: imageUrl,
					is_active: scene.is_active,
					sort_order: scene.sort_order,
				}}
			/>
		</div>
	)
}

import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { Button } from '@/components/ui/button'
import { SceneForm } from '@/components/admin/scene-form'

export async function generateMetadata(): Promise<Metadata> {
	const t = await getTranslations('admin.meta')
	return { title: t('scenesTitle') }
}

export default async function NewScenePage() {
	const t = await getTranslations('admin')

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
					{t('newScene')}
				</h1>
			</div>
			<SceneForm />
		</div>
	)
}

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { z } from 'zod'
import { getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { Separator } from '@/components/ui/separator'
import { UserForm } from '@/components/admin/user-form'
import { ResetPasswordButton } from '@/components/admin/reset-password-button'
import { DeleteUserButton } from '@/components/admin/delete-user-button'

export async function generateMetadata(): Promise<Metadata> {
	const t = await getTranslations('admin.meta')
	return { title: t('usersTitle') }
}

interface EditUserPageProps {
	params: Promise<{ id: string }>
}

export default async function EditUserPage({ params }: EditUserPageProps) {
	const { id } = await params
	const t = await getTranslations('admin')

	const idParsed = z.string().uuid().safeParse(id)
	if (!idParsed.success) notFound()

	const supabase = await createClient()

	const { data: user, error } = await supabase
		.from('profiles')
		.select('id, email, display_name, role')
		.eq('id', idParsed.data)
		.single()

	if (error || !user) notFound()

	return (
		<div>
			<div className="mb-8 flex items-center justify-between">
				<h1 className="font-heading text-2xl font-bold tracking-[-0.03em] text-foreground">
					{t('editUser')}
				</h1>
				<DeleteUserButton userId={user.id} userEmail={user.email} />
			</div>

			<div className="space-y-8">
				<div className="rounded-xl bg-surface-container p-6 lg:p-8">
					<UserForm user={user} />
				</div>

				<div className="rounded-xl bg-surface-container p-6 lg:p-8">
					<h2 className="mb-4 font-heading text-lg font-semibold tracking-[-0.03em] text-foreground">
						{t('resetPassword')}
					</h2>
					<Separator className="mb-6" />
					<ResetPasswordButton userId={user.id} />
				</div>
			</div>
		</div>
	)
}

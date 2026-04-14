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
	return { title: t('usersTitle') }
}

export default async function AdminUsersPage() {
	const t = await getTranslations('admin')
	const supabase = await createClient()

	const { data: users, error } = await supabase
		.from('profiles')
		.select('id, email, display_name, role, created_at')
		.order('created_at', { ascending: false })

	if (error) throw new Error('Failed to load users')

	return (
		<div>
			<div className="mb-8 flex items-center justify-between">
				<h1 className="font-heading text-2xl font-bold tracking-[-0.03em] text-foreground">
					{t('allUsers')}
				</h1>
				<Button variant="brand" size="sm" asChild>
					<Link href="/admin/users/new">
						<Plus className="mr-2 size-4" aria-hidden="true" />
						{t('newUser')}
					</Link>
				</Button>
			</div>

			{!users || users.length === 0 ? (
				<div className="flex flex-col items-center justify-center rounded-xl bg-surface-container py-16">
					<p className="font-sans text-sm text-muted-foreground">
						{t('noUsers')}
					</p>
				</div>
			) : (
				<div className="overflow-x-auto rounded-xl bg-surface-container">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>{t('userName')}</TableHead>
								<TableHead>{t('userEmail')}</TableHead>
								<TableHead>{t('userRole')}</TableHead>
								<TableHead>{t('userJoined')}</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{users.map((user) => (
								<TableRow key={user.id}>
									<TableCell>
										<Link
											href={`/admin/users/${user.id}`}
											className="font-medium text-brand hover:underline"
										>
											{user.display_name || '—'}
										</Link>
									</TableCell>
									<TableCell className="text-muted-foreground">
										{user.email}
									</TableCell>
									<TableCell>
										<Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
											{user.role === 'admin' ? t('roleAdmin') : t('roleCustomer')}
										</Badge>
									</TableCell>
									<TableCell className="text-muted-foreground">
										{new Date(user.created_at).toLocaleDateString('sv-SE')}
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

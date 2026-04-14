'use client'

import { useActionState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { createUser, updateUser } from '@/lib/actions/admin-users'
import type { ActionResult } from '@/types/actions'

interface UserData {
	id: string
	email: string
	display_name: string | null
	role: 'customer' | 'admin'
}

interface UserFormProps {
	user?: UserData
}

export function UserForm({ user }: UserFormProps) {
	const t = useTranslations('admin')
	const tCommon = useTranslations('common')
	const tErrors = useTranslations('errors')
	const router = useRouter()

	const isEditing = !!user

	async function handleAction(
		_prev: ActionResult<{ id: string }> | null,
		formData: FormData,
	): Promise<ActionResult<{ id: string }>> {
		if (isEditing) {
			formData.set('id', user.id)
			const result = await updateUser(formData)
			if (result.success) {
				return { success: true, data: { id: user.id } }
			}
			return { success: false, error: result.error }
		}
		return createUser(formData)
	}

	const [state, formAction, isPending] = useActionState(handleAction, null)

	useEffect(() => {
		if (state?.success) {
			router.push('/admin/users')
		}
	}, [state, router])

	return (
		<form action={formAction} className="space-y-8">
			{state && !state.success && (
				<div
					role="alert"
					className="rounded-lg bg-destructive/10 px-4 py-3 font-sans text-sm text-destructive"
				>
					{tErrors(state.error.replace('errors.', '') as 'generic')}
				</div>
			)}

			<div className="grid gap-6 sm:grid-cols-2">
				<div className="space-y-2">
					<Label htmlFor="email">{t('userEmail')}</Label>
					<Input
						id="email"
						name="email"
						type="email"
						required
						maxLength={320}
						defaultValue={user?.email ?? ''}
						autoComplete="off"
					/>
				</div>

				<div className="space-y-2">
					<Label htmlFor="displayName">{t('userName')}</Label>
					<Input
						id="displayName"
						name="displayName"
						maxLength={100}
						defaultValue={user?.display_name ?? ''}
					/>
				</div>
			</div>

			{!isEditing && (
				<div className="space-y-2">
					<Label htmlFor="password">{t('userPassword')}</Label>
					<Input
						id="password"
						name="password"
						type="password"
						required
						minLength={8}
						maxLength={128}
						autoComplete="new-password"
					/>
				</div>
			)}

			<div className="space-y-2">
				<Label htmlFor="role">{t('userRole')}</Label>
				<Select name="role" defaultValue={user?.role ?? 'customer'} required>
					<SelectTrigger className="w-full sm:w-64">
						<SelectValue placeholder={t('userRole')} />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="customer">{t('roleCustomer')}</SelectItem>
						<SelectItem value="admin">{t('roleAdmin')}</SelectItem>
					</SelectContent>
				</Select>
			</div>

			<div className="flex gap-3">
				<Button type="submit" variant="brand" disabled={isPending}>
					{isPending
						? tCommon('loading')
						: isEditing
							? tCommon('save')
							: t('newUser')}
				</Button>
				<Button
					type="button"
					variant="ghost"
					onClick={() => router.push('/admin/users')}
				>
					{tCommon('cancel')}
				</Button>
			</div>
		</form>
	)
}

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
import { useActionError } from '@/hooks/use-action-error'

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
	const translateError = useActionError()
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
			return result
		}
		return createUser(formData)
	}

	const [state, formAction, isPending] = useActionState(handleAction, null)

	useEffect(() => {
		if (state?.success) {
			router.push('/admin/users')
		}
	}, [state, router])

	const fieldErrors = state && !state.success ? state.fieldErrors ?? {} : {}
	const formError =
		state && !state.success && !Object.keys(fieldErrors).length
			? state.error
			: null

	return (
		<form action={formAction} className="space-y-8">
			{formError && (
				<div
					role="alert"
					className="rounded-lg bg-destructive/10 px-4 py-3 font-sans text-sm text-destructive"
				>
					{translateError(formError)}
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
						aria-invalid={fieldErrors.email ? true : undefined}
						aria-describedby={
							fieldErrors.email ? 'user-email-error' : undefined
						}
					/>
					{fieldErrors.email && (
						<p
							id="user-email-error"
							role="alert"
							className="text-sm text-destructive"
						>
							{translateError(fieldErrors.email)}
						</p>
					)}
				</div>

				<div className="space-y-2">
					<Label htmlFor="displayName">{t('userName')}</Label>
					<Input
						id="displayName"
						name="displayName"
						maxLength={100}
						defaultValue={user?.display_name ?? ''}
						aria-invalid={fieldErrors.displayName ? true : undefined}
						aria-describedby={
							fieldErrors.displayName ? 'user-display-name-error' : undefined
						}
					/>
					{fieldErrors.displayName && (
						<p
							id="user-display-name-error"
							role="alert"
							className="text-sm text-destructive"
						>
							{translateError(fieldErrors.displayName)}
						</p>
					)}
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
						aria-invalid={fieldErrors.password ? true : undefined}
						aria-describedby={
							fieldErrors.password ? 'user-password-error' : undefined
						}
					/>
					{fieldErrors.password && (
						<p
							id="user-password-error"
							role="alert"
							className="text-sm text-destructive"
						>
							{translateError(fieldErrors.password)}
						</p>
					)}
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

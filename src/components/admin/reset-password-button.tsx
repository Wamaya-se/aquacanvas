'use client'

import { useActionState, useRef, useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { KeyRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { resetUserPassword } from '@/lib/actions/admin-users'
import type { ActionResult } from '@/types/actions'

interface ResetPasswordButtonProps {
	userId: string
}

export function ResetPasswordButton({ userId }: ResetPasswordButtonProps) {
	const t = useTranslations('admin')
	const tCommon = useTranslations('common')
	const tErrors = useTranslations('errors')
	const formRef = useRef<HTMLFormElement>(null)
	const [showSuccess, setShowSuccess] = useState(false)

	async function handleAction(
		_prev: ActionResult | null,
		formData: FormData,
	): Promise<ActionResult> {
		formData.set('id', userId)
		return resetUserPassword(formData)
	}

	const [state, formAction, isPending] = useActionState(handleAction, null)

	useEffect(() => {
		if (state?.success) {
			formRef.current?.reset()
			setShowSuccess(true)
			const timer = setTimeout(() => setShowSuccess(false), 3000)
			return () => clearTimeout(timer)
		}
	}, [state])

	return (
		<form ref={formRef} action={formAction} className="space-y-4">
			{state && !state.success && (
				<div
					role="alert"
					className="rounded-lg bg-destructive/10 px-4 py-3 font-sans text-sm text-destructive"
				>
					{tErrors(state.error.replace('errors.', '') as 'generic')}
				</div>
			)}

			{showSuccess && (
				<div
					role="status"
					className="rounded-lg bg-brand/10 px-4 py-3 font-sans text-sm text-brand"
				>
					{t('passwordReset')}
				</div>
			)}

			<div className="space-y-2">
				<Label htmlFor="resetPassword">{t('newPassword')}</Label>
				<Input
					id="resetPassword"
					name="password"
					type="password"
					required
					minLength={8}
					maxLength={128}
					autoComplete="new-password"
				/>
			</div>

			<Button type="submit" variant="secondary" size="sm" disabled={isPending}>
				<KeyRound className="mr-2 size-4" aria-hidden="true" />
				{isPending ? tCommon('loading') : t('resetPassword')}
			</Button>
		</form>
	)
}

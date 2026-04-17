'use client'

import { useActionState } from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { register } from '@/lib/actions/auth'
import { useActionError } from '@/hooks/use-action-error'
import type { ActionResult } from '@/types/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
	Card,
	CardHeader,
	CardTitle,
	CardDescription,
	CardContent,
	CardFooter,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

const initialState: ActionResult = { success: true, data: undefined }

export function RegisterForm() {
	const t = useTranslations('auth')
	const tCommon = useTranslations('common')
	const translateError = useActionError()

	async function handleRegister(
		_prevState: ActionResult,
		formData: FormData,
	): Promise<ActionResult> {
		return await register(formData)
	}

	const [state, formAction, isPending] = useActionState(
		handleRegister,
		initialState,
	)

	const fieldErrors = !state.success ? state.fieldErrors ?? {} : {}
	const formError =
		!state.success && !Object.keys(fieldErrors).length ? state.error : null

	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-2xl">{t('registerTitle')}</CardTitle>
				<CardDescription>{t('registerSubtitle')}</CardDescription>
			</CardHeader>
			<CardContent>
				<form action={formAction} className="flex flex-col gap-4">
					{formError && (
						<p role="alert" className="text-sm text-destructive">
							{translateError(formError)}
						</p>
					)}

					<div className="flex flex-col gap-2">
						<Label htmlFor="email">{t('email')}</Label>
						<Input
							id="email"
							name="email"
							type="email"
							autoComplete="email"
							required
							aria-invalid={fieldErrors.email ? true : undefined}
							aria-describedby={
								fieldErrors.email ? 'register-email-error' : undefined
							}
						/>
						{fieldErrors.email && (
							<p
								id="register-email-error"
								role="alert"
								className="text-sm text-destructive"
							>
								{translateError(fieldErrors.email)}
							</p>
						)}
					</div>

					<div className="flex flex-col gap-2">
						<Label htmlFor="password">{t('password')}</Label>
						<Input
							id="password"
							name="password"
							type="password"
							autoComplete="new-password"
							required
							minLength={8}
							aria-invalid={fieldErrors.password ? true : undefined}
							aria-describedby={
								fieldErrors.password ? 'register-password-error' : undefined
							}
						/>
						{fieldErrors.password && (
							<p
								id="register-password-error"
								role="alert"
								className="text-sm text-destructive"
							>
								{translateError(fieldErrors.password)}
							</p>
						)}
					</div>

					<div className="flex flex-col gap-2">
						<Label htmlFor="confirmPassword">
							{t('confirmPassword')}
						</Label>
						<Input
							id="confirmPassword"
							name="confirmPassword"
							type="password"
							autoComplete="new-password"
							required
							minLength={8}
							aria-invalid={fieldErrors.confirmPassword ? true : undefined}
							aria-describedby={
								fieldErrors.confirmPassword
									? 'register-confirm-password-error'
									: undefined
							}
						/>
						{fieldErrors.confirmPassword && (
							<p
								id="register-confirm-password-error"
								role="alert"
								className="text-sm text-destructive"
							>
								{translateError(fieldErrors.confirmPassword)}
							</p>
						)}
					</div>

					<Button type="submit" className="mt-2 w-full" disabled={isPending}>
						{isPending ? tCommon('loading') : t('registerButton')}
					</Button>
				</form>
			</CardContent>

			<CardFooter className="flex-col gap-4">
				<Separator />
				<p className="text-center text-sm text-muted-foreground">
					{t('hasAccount')}{' '}
					<Link
						href="/login"
						className="text-brand hover:underline"
					>
						{t('loginButton')}
					</Link>
				</p>
			</CardFooter>
		</Card>
	)
}

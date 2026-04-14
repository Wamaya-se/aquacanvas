'use client'

import { useActionState } from 'react'
import { useTranslations } from 'next-intl'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { login } from '@/lib/actions/auth'
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

export function LoginForm() {
	const t = useTranslations('auth')
	const translateError = useActionError()
	const searchParams = useSearchParams()
	const redirect = searchParams.get('redirect') ?? ''

	async function handleLogin(
		_prevState: ActionResult,
		formData: FormData,
	): Promise<ActionResult> {
		return await login(formData)
	}

	const [state, formAction, isPending] = useActionState(
		handleLogin,
		initialState,
	)

	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-2xl">{t('loginTitle')}</CardTitle>
				<CardDescription>{t('loginSubtitle')}</CardDescription>
			</CardHeader>
			<CardContent>
				<form action={formAction} className="flex flex-col gap-4">
					<input type="hidden" name="redirect" value={redirect} />

					{!state.success && state.error && (
						<p role="alert" className="text-sm text-destructive">
							{translateError(state.error)}
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
							aria-invalid={
								!state.success && state.error?.includes('email')
									? true
									: undefined
							}
						/>
					</div>

					<div className="flex flex-col gap-2">
						<div className="flex items-center justify-between">
							<Label htmlFor="password">{t('password')}</Label>
							<Link
								href="/forgot-password"
								className="text-xs text-brand hover:underline"
							>
								{t('forgotPassword')}
							</Link>
						</div>
						<Input
							id="password"
							name="password"
							type="password"
							autoComplete="current-password"
							required
							minLength={8}
						/>
					</div>

					<Button type="submit" className="mt-2 w-full" disabled={isPending}>
						{isPending ? '...' : t('loginButton')}
					</Button>
				</form>
			</CardContent>

			<CardFooter className="flex-col gap-4">
				<Separator />
				<p className="text-center text-sm text-muted-foreground">
					{t('noAccount')}{' '}
					<Link
						href="/register"
						className="text-brand hover:underline"
					>
						{t('registerButton')}
					</Link>
				</p>
			</CardFooter>
		</Card>
	)
}

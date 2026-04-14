'use client'

import { useActionState } from 'react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
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

	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-2xl">{t('registerTitle')}</CardTitle>
				<CardDescription>{t('registerSubtitle')}</CardDescription>
			</CardHeader>
			<CardContent>
				<form action={formAction} className="flex flex-col gap-4">
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
						/>
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
						/>
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
						/>
					</div>

					<Button type="submit" className="mt-2 w-full" disabled={isPending}>
						{isPending ? '...' : t('registerButton')}
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

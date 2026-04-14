'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { sendContactMessage } from '@/lib/actions/contact'
import { useActionError } from '@/hooks/use-action-error'

export function ContactForm() {
	const t = useTranslations('contact')
	const translateError = useActionError()

	const [isPending, setIsPending] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [isSuccess, setIsSuccess] = useState(false)

	async function handleSubmit(formData: FormData) {
		setError(null)
		setIsPending(true)

		try {
			const result = await sendContactMessage(formData)
			if (result.success) {
				setIsSuccess(true)
			} else {
				setError(translateError(result.error))
			}
		} finally {
			setIsPending(false)
		}
	}

	if (isSuccess) {
		return (
			<div className="rounded-xl bg-surface-container p-8 text-center">
				<h3 className="font-heading text-xl font-bold tracking-[-0.03em] text-foreground">
					{t('successTitle')}
				</h3>
				<p className="mt-3 font-sans text-sm leading-[1.7] text-muted-foreground">
					{t('successText')}
				</p>
				<Button
					variant="secondary"
					className="mt-6"
					onClick={() => setIsSuccess(false)}
				>
					{t('sendAnother')}
				</Button>
			</div>
		)
	}

	return (
		<form action={handleSubmit} className="space-y-6">
			{error && (
				<div
					role="alert"
					className="rounded-lg bg-destructive/10 px-4 py-3 font-sans text-sm text-destructive"
				>
					{error}
				</div>
			)}

			<div className="space-y-2">
				<Label htmlFor="contact-name">{t('nameLabel')}</Label>
				<Input
					id="contact-name"
					name="name"
					required
					maxLength={100}
					placeholder={t('namePlaceholder')}
					disabled={isPending}
				/>
			</div>

			<div className="space-y-2">
				<Label htmlFor="contact-email">{t('emailLabel')}</Label>
				<Input
					id="contact-email"
					name="email"
					type="email"
					required
					placeholder={t('emailPlaceholder')}
					disabled={isPending}
				/>
			</div>

			<div className="space-y-2">
				<Label htmlFor="contact-subject">{t('subjectLabel')}</Label>
				<Input
					id="contact-subject"
					name="subject"
					required
					maxLength={200}
					placeholder={t('subjectPlaceholder')}
					disabled={isPending}
				/>
			</div>

			<div className="space-y-2">
				<Label htmlFor="contact-message">{t('messageLabel')}</Label>
				<Textarea
					id="contact-message"
					name="message"
					required
					minLength={10}
					maxLength={5000}
					rows={6}
					placeholder={t('messagePlaceholder')}
					disabled={isPending}
				/>
			</div>

			<Button type="submit" variant="brand" size="lg" disabled={isPending}>
				{isPending ? t('sending') : t('sendButton')}
			</Button>
		</form>
	)
}

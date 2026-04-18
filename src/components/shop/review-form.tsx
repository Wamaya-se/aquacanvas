'use client'

import { useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { submitReview } from '@/lib/actions/reviews'
import { useActionError } from '@/hooks/use-action-error'
import { cn } from '@/lib/utils'

interface ReviewFormProps {
	productId: string
}

export function ReviewForm({ productId }: ReviewFormProps) {
	const t = useTranslations('reviews')
	const locale = useLocale()
	const translateError = useActionError()

	const [rating, setRating] = useState(0)
	const [hoverRating, setHoverRating] = useState(0)
	const [isPending, setIsPending] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
	const [isSuccess, setIsSuccess] = useState(false)

	async function handleSubmit(formData: FormData) {
		setError(null)
		setFieldErrors({})

		if (rating < 1) {
			setFieldErrors({ rating: 'errors.invalidInput' })
			setError(translateError('errors.invalidInput'))
			return
		}

		formData.set('rating', String(rating))
		formData.set('productId', productId)
		formData.set('locale', locale === 'en' ? 'en' : 'sv')

		setIsPending(true)
		try {
			const result = await submitReview(formData)
			if (result.success) {
				setIsSuccess(true)
				setRating(0)
			} else {
				setError(translateError(result.error))
				if (result.fieldErrors) setFieldErrors(result.fieldErrors)
			}
		} finally {
			setIsPending(false)
		}
	}

	if (isSuccess) {
		return (
			<div
				className="rounded-xl bg-surface-container p-6 text-center"
				role="status"
			>
				<h3 className="font-heading text-lg font-semibold tracking-[-0.03em] text-foreground">
					{t('submitSuccessTitle')}
				</h3>
				<p className="mt-2 font-sans text-sm leading-[1.7] text-muted-foreground">
					{t('submitSuccessText')}
				</p>
				<Button
					variant="secondary"
					size="sm"
					className="mt-5"
					onClick={() => setIsSuccess(false)}
				>
					{t('submitAnother')}
				</Button>
			</div>
		)
	}

	const displayRating = hoverRating || rating

	return (
		<form action={handleSubmit} className="space-y-5" noValidate>
			{error && (
				<div
					role="alert"
					className="rounded-lg bg-destructive/10 px-4 py-3 font-sans text-sm text-destructive"
				>
					{error}
				</div>
			)}

			<div className="space-y-2">
				<Label id="review-rating-label">{t('ratingLabel')}</Label>
				<div
					className="flex items-center gap-1"
					role="radiogroup"
					aria-labelledby="review-rating-label"
					aria-invalid={fieldErrors.rating ? true : undefined}
				>
					{[1, 2, 3, 4, 5].map((value) => {
						const active = value <= displayRating
						return (
							<button
								key={value}
								type="button"
								role="radio"
								aria-checked={rating === value}
								aria-label={t('ratingValue', { value })}
								onClick={() => setRating(value)}
								onMouseEnter={() => setHoverRating(value)}
								onMouseLeave={() => setHoverRating(0)}
								onFocus={() => setHoverRating(value)}
								onBlur={() => setHoverRating(0)}
								className={cn(
									'rounded-md p-1 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-brand/60',
									active ? 'text-brand' : 'text-outline-variant/60',
								)}
							>
								<Star
									className="size-7"
									fill={active ? 'currentColor' : 'none'}
									aria-hidden="true"
								/>
							</button>
						)
					})}
				</div>
			</div>

			<div className="grid gap-5 sm:grid-cols-2">
				<div className="space-y-2">
					<Label htmlFor="review-name">{t('nameLabel')}</Label>
					<Input
						id="review-name"
						name="customerName"
						required
						maxLength={60}
						placeholder={t('namePlaceholder')}
						disabled={isPending}
						aria-invalid={fieldErrors.customerName ? true : undefined}
						aria-describedby={
							fieldErrors.customerName ? 'review-name-error' : undefined
						}
					/>
					{fieldErrors.customerName && (
						<p id="review-name-error" className="text-xs text-destructive">
							{translateError(fieldErrors.customerName)}
						</p>
					)}
				</div>
				<div className="space-y-2">
					<Label htmlFor="review-email">{t('emailLabel')}</Label>
					<Input
						id="review-email"
						name="customerEmail"
						type="email"
						required
						placeholder={t('emailPlaceholder')}
						disabled={isPending}
						aria-invalid={fieldErrors.customerEmail ? true : undefined}
						aria-describedby={
							fieldErrors.customerEmail ? 'review-email-error' : undefined
						}
					/>
					{fieldErrors.customerEmail && (
						<p id="review-email-error" className="text-xs text-destructive">
							{translateError(fieldErrors.customerEmail)}
						</p>
					)}
				</div>
			</div>

			<div className="space-y-2">
				<Label htmlFor="review-title">{t('titleLabel')}</Label>
				<Input
					id="review-title"
					name="title"
					maxLength={80}
					placeholder={t('titlePlaceholder')}
					disabled={isPending}
				/>
			</div>

			<div className="space-y-2">
				<Label htmlFor="review-body">{t('bodyLabel')}</Label>
				<Textarea
					id="review-body"
					name="body"
					required
					minLength={10}
					maxLength={1000}
					rows={5}
					placeholder={t('bodyPlaceholder')}
					disabled={isPending}
					aria-invalid={fieldErrors.body ? true : undefined}
					aria-describedby={fieldErrors.body ? 'review-body-error' : undefined}
				/>
				{fieldErrors.body && (
					<p id="review-body-error" className="text-xs text-destructive">
						{translateError(fieldErrors.body)}
					</p>
				)}
			</div>

			<p className="font-sans text-xs text-muted-foreground">
				{t('moderationNote')}
			</p>

			<Button type="submit" variant="brand" disabled={isPending}>
				{isPending ? t('submitting') : t('submitButton')}
			</Button>
		</form>
	)
}

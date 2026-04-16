'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { ImageUploadField } from '@/components/admin/image-upload-field'
import { createProduct, updateProduct } from '@/lib/actions/admin-products'
import type { ActionResult } from '@/types/actions'
import { useActionError } from '@/hooks/use-action-error'

interface FaqItem {
	question: string
	answer: string
}

interface Style {
	id: string
	name: string
}

export interface ProductData {
	id: string
	name: string
	slug: string
	headline: string
	description: string | null
	body: string | null
	hero_image_url: string | null
	example_before: string | null
	example_after: string | null
	style_id: string
	price_cents: number | null
	is_active: boolean
	sort_order: number
	seo_title: string | null
	seo_description: string | null
	faq: FaqItem[] | null
}

interface ProductFormProps {
	product?: ProductData
	styles: Style[]
}

export function ProductForm({ product, styles }: ProductFormProps) {
	const t = useTranslations('admin')
	const tCommon = useTranslations('common')
	const translateError = useActionError()
	const router = useRouter()
	const formRef = useRef<HTMLFormElement>(null)

	const isEditing = !!product

	async function handleAction(
		_prev: ActionResult<{ id: string }> | null,
		formData: FormData,
	): Promise<ActionResult<{ id: string }>> {
		if (isEditing) {
			const result = await updateProduct(product.id, formData)
			if (result.success) {
				return { success: true, data: { id: product.id } }
			}
			return result as ActionResult<{ id: string }>
		}
		return createProduct(formData)
	}

	const [state, formAction, isPending] = useActionState(handleAction, null)

	useEffect(() => {
		if (state?.success) {
			router.push('/admin/products')
		}
	}, [state, router])

	const priceInSek = product?.price_cents
		? (product.price_cents / 100).toFixed(0)
		: ''

	const [faqItems, setFaqItems] = useState<FaqItem[]>(product?.faq ?? [])

	function addFaqItem() {
		setFaqItems((prev) => [...prev, { question: '', answer: '' }])
	}

	function removeFaqItem(index: number) {
		setFaqItems((prev) => prev.filter((_, i) => i !== index))
	}

	function updateFaqItem(index: number, field: keyof FaqItem, value: string) {
		setFaqItems((prev) =>
			prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
		)
	}

	const fieldErrors = state && !state.success ? state.fieldErrors ?? {} : {}
	const formError =
		state && !state.success && !Object.keys(fieldErrors).length
			? state.error
			: null

	return (
		<form ref={formRef} action={formAction} className="space-y-8">
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
					<Label htmlFor="name">{t('productName')}</Label>
					<Input
						id="name"
						name="name"
						required
						maxLength={100}
						defaultValue={product?.name ?? ''}
						aria-invalid={fieldErrors.name ? true : undefined}
						aria-describedby={
							fieldErrors.name ? 'product-name-error' : undefined
						}
					/>
					{fieldErrors.name && (
						<p
							id="product-name-error"
							role="alert"
							className="text-sm text-destructive"
						>
							{translateError(fieldErrors.name)}
						</p>
					)}
				</div>

				<div className="space-y-2">
					<Label htmlFor="slug">{t('productSlug')}</Label>
					<Input
						id="slug"
						name="slug"
						required
						maxLength={100}
						pattern="[a-z0-9-]+"
						defaultValue={product?.slug ?? ''}
						aria-invalid={fieldErrors.slug ? true : undefined}
						aria-describedby={
							fieldErrors.slug ? 'product-slug-error' : undefined
						}
					/>
					{fieldErrors.slug && (
						<p
							id="product-slug-error"
							role="alert"
							className="text-sm text-destructive"
						>
							{translateError(fieldErrors.slug)}
						</p>
					)}
				</div>
			</div>

			<div className="space-y-2">
				<Label htmlFor="headline">{t('productHeadline')}</Label>
				<Input
					id="headline"
					name="headline"
					required
					maxLength={300}
					defaultValue={product?.headline ?? ''}
					aria-invalid={fieldErrors.headline ? true : undefined}
					aria-describedby={
						fieldErrors.headline ? 'product-headline-error' : undefined
					}
				/>
				{fieldErrors.headline && (
					<p
						id="product-headline-error"
						role="alert"
						className="text-sm text-destructive"
					>
						{translateError(fieldErrors.headline)}
					</p>
				)}
			</div>

			<div className="space-y-2">
				<Label htmlFor="description">{t('productDescription')}</Label>
				<Textarea
					id="description"
					name="description"
					maxLength={500}
					rows={3}
					defaultValue={product?.description ?? ''}
				/>
			</div>

			<div className="space-y-2">
				<Label htmlFor="body">{t('productBody')}</Label>
				<Textarea
					id="body"
					name="body"
					maxLength={5000}
					rows={8}
					defaultValue={product?.body ?? ''}
				/>
			</div>

			<div className="grid gap-6 sm:grid-cols-3">
				<ImageUploadField
					name="heroImageUrl"
					label={t('productHeroImage')}
					existingUrl={product?.hero_image_url}
				/>
				<ImageUploadField
					name="exampleBefore"
					label={t('productExampleBefore')}
					existingUrl={product?.example_before}
				/>
				<ImageUploadField
					name="exampleAfter"
					label={t('productExampleAfter')}
					existingUrl={product?.example_after}
				/>
			</div>

			<div className="grid gap-6 sm:grid-cols-3">
				<div className="space-y-2">
					<Label htmlFor="styleId">{t('productStyle')}</Label>
					<Select name="styleId" defaultValue={product?.style_id ?? ''} required>
						<SelectTrigger className="w-full">
							<SelectValue placeholder={t('productStyle')} />
						</SelectTrigger>
						<SelectContent>
							{styles.map((style) => (
								<SelectItem key={style.id} value={style.id}>
									{style.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				<div className="space-y-2">
					<Label htmlFor="priceCents">{t('productPrice')}</Label>
					<Input
						id="priceCents"
						name="priceCents"
						type="number"
						min={0}
						step={1}
						placeholder="349"
						defaultValue={priceInSek}
					/>
					<p className="font-sans text-xs text-muted-foreground">
						{t('productPriceHint')}
					</p>
				</div>

				<div className="space-y-2">
					<Label htmlFor="sortOrder">{t('productSortOrder')}</Label>
					<Input
						id="sortOrder"
						name="sortOrder"
						type="number"
						min={0}
						defaultValue={product?.sort_order ?? 0}
					/>
				</div>
			</div>

			<div className="space-y-4">
				<div className="flex items-center justify-between">
					<Label>{t('productFaq')}</Label>
					<Button
						type="button"
						variant="outline"
						size="sm"
						onClick={addFaqItem}
					>
						<Plus className="mr-1.5 size-4" aria-hidden="true" />
						{t('addFaqItem')}
					</Button>
				</div>
				{faqItems.length === 0 && (
					<p className="font-sans text-sm text-muted-foreground">
						{t('noFaqItems')}
					</p>
				)}
				{faqItems.map((item, index) => (
					<div key={index} className="space-y-3 rounded-lg bg-surface-container p-4">
						<div className="flex items-start justify-between gap-2">
							<div className="flex-1 space-y-3">
								<div className="space-y-1.5">
									<Label htmlFor={`faq_question_${index}`}>
										{t('faqQuestion')} {index + 1}
									</Label>
									<Input
										id={`faq_question_${index}`}
										name={`faq_question_${index}`}
										maxLength={300}
										value={item.question}
										onChange={(e) => updateFaqItem(index, 'question', e.target.value)}
									/>
								</div>
								<div className="space-y-1.5">
									<Label htmlFor={`faq_answer_${index}`}>
										{t('faqAnswer')} {index + 1}
									</Label>
									<Textarea
										id={`faq_answer_${index}`}
										name={`faq_answer_${index}`}
										maxLength={2000}
										rows={3}
										value={item.answer}
										onChange={(e) => updateFaqItem(index, 'answer', e.target.value)}
									/>
								</div>
							</div>
							<Button
								type="button"
								variant="ghost"
								size="sm"
								onClick={() => removeFaqItem(index)}
								aria-label={tCommon('delete')}
							>
								<Trash2 className="size-4 text-destructive" aria-hidden="true" />
							</Button>
						</div>
					</div>
				))}
			</div>

			<div className="grid gap-6 sm:grid-cols-2">
				<div className="space-y-2">
					<Label htmlFor="seoTitle">{t('productSeoTitle')}</Label>
					<Input
						id="seoTitle"
						name="seoTitle"
						maxLength={70}
						defaultValue={product?.seo_title ?? ''}
					/>
				</div>

				<div className="space-y-2">
					<Label htmlFor="seoDescription">{t('productSeoDescription')}</Label>
					<Input
						id="seoDescription"
						name="seoDescription"
						maxLength={160}
						defaultValue={product?.seo_description ?? ''}
					/>
				</div>
			</div>

			<div className="flex items-center gap-3">
				<Switch
					id="isActive"
					name="isActive"
					defaultChecked={product?.is_active ?? true}
				/>
				<Label htmlFor="isActive">{t('productActive')}</Label>
			</div>

			<div className="flex gap-3">
				<Button type="submit" variant="brand" disabled={isPending}>
					{isPending
						? tCommon('loading')
						: isEditing
							? t('saveProduct')
							: t('createProduct')}
				</Button>
				<Button
					type="button"
					variant="ghost"
					onClick={() => router.push('/admin/products')}
				>
					{tCommon('cancel')}
				</Button>
			</div>
		</form>
	)
}

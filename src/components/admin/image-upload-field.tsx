'use client'

import { useState, useRef, useCallback } from 'react'
import Image from 'next/image'
import { Upload, X, ImageIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_FILE_SIZE = 5 * 1024 * 1024

interface ImageUploadFieldProps {
	name: string
	label: string
	existingUrl?: string | null
}

export function ImageUploadField({ name, label, existingUrl }: ImageUploadFieldProps) {
	const t = useTranslations('admin')
	const tErrors = useTranslations('errors')
	const [previewUrl, setPreviewUrl] = useState<string | null>(existingUrl ?? null)
	const [fileName, setFileName] = useState<string | null>(null)
	const [error, setError] = useState<string | null>(null)
	const [isRemoved, setIsRemoved] = useState(false)
	const inputRef = useRef<HTMLInputElement>(null)

	const handleFile = useCallback((file: File) => {
		setError(null)

		if (!ALLOWED_TYPES.includes(file.type)) {
			setError(tErrors('invalidFileType'))
			return
		}
		if (file.size > MAX_FILE_SIZE) {
			setError(tErrors('fileTooLarge', { maxSize: '5' }))
			return
		}

		const url = URL.createObjectURL(file)
		setPreviewUrl(url)
		setFileName(file.name)
		setIsRemoved(false)
	}, [tErrors])

	function handleDrop(e: React.DragEvent) {
		e.preventDefault()
		const file = e.dataTransfer.files[0]
		if (file) {
			handleFile(file)
			if (inputRef.current) {
				const dt = new DataTransfer()
				dt.items.add(file)
				inputRef.current.files = dt.files
			}
		}
	}

	function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
		const file = e.target.files?.[0]
		if (file) handleFile(file)
	}

	function handleRemove() {
		setPreviewUrl(null)
		setFileName(null)
		setIsRemoved(true)
		setError(null)
		if (inputRef.current) inputRef.current.value = ''
	}

	const hasPreview = previewUrl && !isRemoved

	return (
		<div className="space-y-2">
			<p className="font-sans text-sm font-medium text-foreground/70">{label}</p>

			{hasPreview ? (
				<div className="group relative overflow-hidden rounded-xl bg-surface-container-high">
					<div className="relative aspect-video w-full">
						<Image
							src={previewUrl}
							alt={label}
							fill
							unoptimized
							className="object-cover"
						/>
					</div>
					<div className="absolute inset-0 flex items-center justify-center gap-2 bg-surface/60 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
						<Button
							type="button"
							variant="secondary"
							size="sm"
							onClick={() => inputRef.current?.click()}
						>
							<Upload className="mr-1.5 size-3.5" aria-hidden="true" />
							{t('replaceImage')}
						</Button>
						<Button
							type="button"
							variant="destructive"
							size="sm"
							onClick={handleRemove}
						>
							<X className="mr-1.5 size-3.5" aria-hidden="true" />
							{t('removeImage')}
						</Button>
					</div>
					{fileName && (
						<p className="px-3 py-2 font-sans text-xs text-muted-foreground">{fileName}</p>
					)}
				</div>
			) : (
				<button
					type="button"
					onClick={() => inputRef.current?.click()}
					onDragOver={(e) => e.preventDefault()}
					onDrop={handleDrop}
					className={cn(
						'flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed p-6 transition-colors',
						'border-outline-variant/20 hover:border-brand/40 hover:bg-surface-container-high/50',
					)}
				>
					<ImageIcon className="size-8 text-muted-foreground" aria-hidden="true" />
					<span className="font-sans text-sm text-muted-foreground">
						{t('uploadImageDragDrop')}
					</span>
					<span className="font-sans text-xs text-muted-foreground/60">
						{t('uploadImageFormats')}
					</span>
				</button>
			)}

			{error && (
				<p role="alert" className="font-sans text-xs text-destructive">{error}</p>
			)}

			<input
				ref={inputRef}
				type="file"
				name={name}
				accept="image/jpeg,image/png,image/webp"
				onChange={handleChange}
				className="sr-only"
				aria-label={label}
			/>
			{isRemoved && <input type="hidden" name={`${name}__removed`} value="true" />}
		</div>
	)
}

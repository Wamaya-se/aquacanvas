'use client'

import { useCallback, useRef, useState } from 'react'
import Image from 'next/image'
import { Upload, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'

const MAX_FILE_SIZE = 10 * 1024 * 1024
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

interface ImageUploadProps {
	onFileChange: (file: File | null) => void
	file: File | null
}

export function ImageUpload({ onFileChange, file }: ImageUploadProps) {
	const t = useTranslations('shop')
	const tErrors = useTranslations('errors')
	const inputRef = useRef<HTMLInputElement>(null)
	const [isDragging, setIsDragging] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [preview, setPreview] = useState<string | null>(null)

	const validateAndSet = useCallback(
		(selectedFile: File) => {
			setError(null)

			if (!ACCEPTED_TYPES.includes(selectedFile.type)) {
				setError(tErrors('invalidFileType'))
				return
			}

			if (selectedFile.size > MAX_FILE_SIZE) {
				setError(tErrors('fileTooLarge', { maxSize: '10' }))
				return
			}

			const url = URL.createObjectURL(selectedFile)
			setPreview(url)
			onFileChange(selectedFile)
		},
		[onFileChange, tErrors],
	)

	function handleRemove() {
		if (preview) URL.revokeObjectURL(preview)
		setPreview(null)
		setError(null)
		onFileChange(null)
		if (inputRef.current) inputRef.current.value = ''
	}

	function handleDragOver(e: React.DragEvent) {
		e.preventDefault()
		setIsDragging(true)
	}

	function handleDragLeave(e: React.DragEvent) {
		e.preventDefault()
		setIsDragging(false)
	}

	function handleDrop(e: React.DragEvent) {
		e.preventDefault()
		setIsDragging(false)
		const droppedFile = e.dataTransfer.files[0]
		if (droppedFile) validateAndSet(droppedFile)
	}

	function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
		const selectedFile = e.target.files?.[0]
		if (selectedFile) validateAndSet(selectedFile)
	}

	if (preview && file) {
		return (
			<div className="relative overflow-hidden rounded-xl">
				<Image
					src={preview}
					alt={t('uploadedPreviewAlt')}
					width={600}
					height={400}
					className="h-auto w-full rounded-xl object-cover"
				/>
				<Button
					variant="destructive"
					size="icon-sm"
					className="absolute right-3 top-3"
					onClick={handleRemove}
					aria-label={t('removeImage')}
				>
					<X className="size-4" />
				</Button>
			</div>
		)
	}

	return (
		<div>
			<button
				type="button"
				onClick={() => inputRef.current?.click()}
				onDragOver={handleDragOver}
				onDragLeave={handleDragLeave}
				onDrop={handleDrop}
				className={`flex w-full cursor-pointer flex-col items-center gap-4 rounded-xl border-2 border-dashed px-6 py-16 transition-colors ${
					isDragging
						? 'border-brand bg-brand/5'
						: 'border-outline-variant/20 hover:border-outline-variant/40'
				}`}
			>
				<div className="flex size-12 items-center justify-center rounded-xl bg-surface-container-high">
					<Upload className="size-5 text-brand" aria-hidden="true" />
				</div>
				<div className="text-center">
					<p className="font-sans text-sm font-medium text-foreground">
						{t('dragDrop')}
					</p>
					<p className="mt-1 font-sans text-xs text-muted-foreground">
						{t('orBrowse')}
					</p>
				</div>
				<p className="font-sans text-xs text-muted-foreground">
					{t('supportedFormats')}
				</p>
			</button>

			<input
				ref={inputRef}
				type="file"
				accept="image/jpeg,image/png,image/webp"
				onChange={handleInputChange}
				className="hidden"
				aria-label={t('uploadPhoto')}
			/>

			{error && (
				<p role="alert" className="mt-3 text-sm text-destructive">
					{error}
				</p>
			)}
		</div>
	)
}

'use client'

import Image, { type ImageProps } from 'next/image'
import { cn } from '@/lib/utils'

/**
 * Thin wrapper around `next/image` that blocks casual ways to save the
 * image in a browser: right-click "Save image as…", drag-out to desktop,
 * iOS long-press "Save Image", and text selection around the image.
 *
 * It does NOT prevent screenshots or a determined user from opening the
 * Network tab; the goal is to discourage accidental or trivial saving of
 * pre-purchase preview assets.
 */
export function ProtectedImage(props: ImageProps) {
	const { className, alt, ...rest } = props

	return (
		<span
			onContextMenu={(e) => e.preventDefault()}
			onDragStart={(e) => e.preventDefault()}
			className="contents select-none [-webkit-touch-callout:none]"
		>
			<Image
				{...rest}
				alt={alt}
				draggable={false}
				className={cn(
					'pointer-events-none select-none [-webkit-user-drag:none]',
					className,
				)}
			/>
		</span>
	)
}

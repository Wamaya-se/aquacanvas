'use client'

import { useEffect } from 'react'
import Lightbox, {
	type Slide,
	type SlideImage,
	type RenderSlideProps,
} from 'yet-another-react-lightbox'
import Zoom from 'yet-another-react-lightbox/plugins/zoom'
import Fullscreen from 'yet-another-react-lightbox/plugins/fullscreen'
import Thumbnails from 'yet-another-react-lightbox/plugins/thumbnails'
import Counter from 'yet-another-react-lightbox/plugins/counter'
import 'yet-another-react-lightbox/styles.css'
import 'yet-another-react-lightbox/plugins/thumbnails.css'
import 'yet-another-react-lightbox/plugins/counter.css'

interface ImageLightboxProps {
	slides: Slide[]
	open: boolean
	index: number
	onClose: () => void
}

/**
 * Renders a lightbox slide as a non-draggable <img> so browser-level
 * "Save Image" / drag-to-desktop is blocked. The zoom plugin operates
 * on the slide container, so disabling HTML5 drag on the inner <img>
 * does not interfere with pan/zoom.
 */
function renderProtectedSlide({ slide, rect }: RenderSlideProps) {
	const image = slide as SlideImage
	return (
		// eslint-disable-next-line @next/next/no-img-element -- lightbox handles its own sizing/zoom; next/image is unsuitable here
		<img
			src={image.src}
			alt={image.alt ?? ''}
			draggable={false}
			onDragStart={(e) => e.preventDefault()}
			onContextMenu={(e) => e.preventDefault()}
			style={{
				maxWidth: rect.width,
				maxHeight: rect.height,
				objectFit: 'contain',
				userSelect: 'none',
				WebkitUserSelect: 'none',
				WebkitUserDrag: 'none',
				WebkitTouchCallout: 'none',
			} as React.CSSProperties}
		/>
	)
}

export function ImageLightbox({
	slides,
	open,
	index,
	onClose,
}: ImageLightboxProps) {
	useEffect(() => {
		if (!open) return
		const handle = (e: Event) => {
			const target = e.target as HTMLElement | null
			if (target?.closest('.yarl__root')) e.preventDefault()
		}
		document.addEventListener('contextmenu', handle)
		document.addEventListener('dragstart', handle)
		return () => {
			document.removeEventListener('contextmenu', handle)
			document.removeEventListener('dragstart', handle)
		}
	}, [open])

	return (
		<Lightbox
			open={open}
			close={onClose}
			index={index}
			slides={slides}
			plugins={[Zoom, Fullscreen, Thumbnails, Counter]}
			render={{ slide: renderProtectedSlide }}
			zoom={{
				maxZoomPixelRatio: 3,
				scrollToZoom: true,
			}}
			thumbnails={{
				position: 'bottom',
				width: 80,
				height: 60,
				gap: 8,
				borderRadius: 8,
			}}
			counter={{
				container: { style: { top: 'unset', bottom: 0 } },
			}}
			carousel={{
				preload: 2,
			}}
			styles={{
				container: { backgroundColor: 'rgba(0, 0, 0, 0.92)' },
			}}
			animation={{ fade: 250 }}
		/>
	)
}

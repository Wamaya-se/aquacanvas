'use client'

import Lightbox, { type Slide } from 'yet-another-react-lightbox'
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

export function ImageLightbox({
	slides,
	open,
	index,
	onClose,
}: ImageLightboxProps) {
	return (
		<Lightbox
			open={open}
			close={onClose}
			index={index}
			slides={slides}
			plugins={[Zoom, Fullscreen, Thumbnails, Counter]}
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

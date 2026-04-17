import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Aquacanvas — Your artwork is ready'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function CheckoutOpengraphImage() {
	return new ImageResponse(
		(
			<div
				style={{
					height: '100%',
					width: '100%',
					display: 'flex',
					flexDirection: 'column',
					justifyContent: 'center',
					alignItems: 'flex-start',
					background:
						'linear-gradient(135deg, #ffffeb 0%, #f2f2c4 100%)',
					padding: '80px',
					fontFamily: 'serif',
				}}
			>
				<div
					style={{
						fontSize: 28,
						color: '#034f46',
						fontWeight: 600,
						letterSpacing: '0.04em',
						marginBottom: 24,
					}}
				>
					AQUACANVAS
				</div>
				<div
					style={{
						fontSize: 84,
						color: '#1a1a1a',
						fontWeight: 700,
						lineHeight: 1.05,
						letterSpacing: '-0.03em',
						maxWidth: 1000,
					}}
				>
					Your custom canvas
				</div>
				<div
					style={{
						fontSize: 28,
						color: '#5a5a4a',
						marginTop: 32,
						maxWidth: 900,
						lineHeight: 1.4,
					}}
				>
					Hand-stretched, museum-quality prints delivered to your door.
				</div>
			</div>
		),
		{ ...size },
	)
}

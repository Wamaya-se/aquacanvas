import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Aquacanvas — Sign in'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function AuthOpengraphImage() {
	return new ImageResponse(
		(
			<div
				style={{
					height: '100%',
					width: '100%',
					display: 'flex',
					flexDirection: 'column',
					justifyContent: 'center',
					alignItems: 'center',
					background:
						'linear-gradient(135deg, #0c0c08 0%, #14806f 100%)',
					padding: '80px',
					fontFamily: 'serif',
				}}
			>
				<div
					style={{
						fontSize: 28,
						color: '#f5f5e0',
						opacity: 0.75,
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
						color: '#f5f5e0',
						fontWeight: 700,
						lineHeight: 1.05,
						letterSpacing: '-0.03em',
						textAlign: 'center',
					}}
				>
					Welcome back
				</div>
				<div
					style={{
						fontSize: 28,
						color: '#f5f5e0',
						opacity: 0.7,
						marginTop: 24,
						textAlign: 'center',
					}}
				>
					Sign in to continue creating
				</div>
			</div>
		),
		{ ...size },
	)
}

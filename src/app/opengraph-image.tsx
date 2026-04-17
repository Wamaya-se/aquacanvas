import { ImageResponse } from 'next/og'
import { getTranslations } from 'next-intl/server'

export const runtime = 'edge'
export const alt = 'Aquacanvas — Transform Your Photos Into Art'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function OpengraphImage() {
	const t = await getTranslations('metadata')

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
						'linear-gradient(135deg, #ffffeb 0%, #f8f0ff 55%, #f0d7ff 100%)',
					padding: '80px',
					fontFamily: 'serif',
				}}
			>
				<div
					style={{
						fontSize: 28,
						color: '#034f46',
						fontWeight: 600,
						letterSpacing: '0.02em',
						marginBottom: 24,
					}}
				>
					AQUACANVAS
				</div>
				<div
					style={{
						fontSize: 72,
						color: '#1a1a1a',
						fontWeight: 700,
						lineHeight: 1.05,
						letterSpacing: '-0.03em',
						maxWidth: 900,
					}}
				>
					{t('homeTitle')}
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
					{t('homeDescription')}
				</div>
			</div>
		),
		{ ...size },
	)
}

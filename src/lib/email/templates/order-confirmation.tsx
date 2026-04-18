import {
	Body,
	Container,
	Head,
	Heading,
	Hr,
	Html,
	Img,
	Link,
	Preview,
	Section,
	Text,
} from '@react-email/components'

interface OrderConfirmationEmailProps {
	locale: string
	strings: {
		preview: string
		heading: string
		intro: string
		labelOrderNumber: string
		labelStyle: string
		labelFormat: string
		labelTotal: string
		altArtwork: string
		footerQuestions: string
		orderNumberValue: string
		priceLabel: string
	}
	styleName: string
	formatName?: string
	generatedImageUrl?: string | null
	siteUrl: string
}

export function OrderConfirmationEmail({
	locale,
	strings,
	styleName,
	formatName,
	generatedImageUrl,
	siteUrl,
}: OrderConfirmationEmailProps) {
	return (
		<Html lang={locale}>
			<Head />
			<Preview>{strings.preview}</Preview>
			<Body style={main}>
				<Container style={container}>
					<Heading style={heading}>{strings.heading}</Heading>
					<Text style={text}>{strings.intro}</Text>

					<Section style={orderBox}>
						<Text style={label}>{strings.labelOrderNumber}</Text>
						<Text style={value}>{strings.orderNumberValue}</Text>

						<Text style={label}>{strings.labelStyle}</Text>
						<Text style={value}>{styleName}</Text>

						{formatName && (
							<>
								<Text style={label}>{strings.labelFormat}</Text>
								<Text style={value}>{formatName}</Text>
							</>
						)}

						<Text style={label}>{strings.labelTotal}</Text>
						<Text style={value}>{strings.priceLabel}</Text>
					</Section>

					{generatedImageUrl && (
						<Section style={{ textAlign: 'center' as const, marginBottom: '24px' }}>
							<Img
								src={generatedImageUrl}
								alt={strings.altArtwork}
								width={400}
								style={{ borderRadius: '8px', maxWidth: '100%' }}
							/>
						</Section>
					)}

					<Hr style={hr} />

					<Text style={footerText}>
						{strings.footerQuestions}{' '}
						<Link href={siteUrl} style={link}>
							aquacanvas.com
						</Link>
					</Text>
				</Container>
			</Body>
		</Html>
	)
}

const main = {
	backgroundColor: '#0c0f14',
	fontFamily: 'system-ui, -apple-system, sans-serif',
}

const container = {
	maxWidth: '520px',
	margin: '0 auto',
	padding: '40px 24px',
}

const heading = {
	color: '#f0f0f5',
	fontSize: '24px',
	fontWeight: '700' as const,
	marginBottom: '16px',
}

const text = {
	color: '#8a8fa0',
	fontSize: '14px',
	lineHeight: '1.7',
	marginBottom: '24px',
}

const orderBox = {
	backgroundColor: '#1a1e2a',
	borderRadius: '12px',
	padding: '24px',
	marginBottom: '24px',
}

const label = {
	color: '#8a8fa0',
	fontSize: '12px',
	marginBottom: '4px',
}

const value = {
	color: '#f0f0f5',
	fontSize: '14px',
	fontWeight: '600' as const,
	marginBottom: '16px',
}

const hr = {
	borderColor: '#3a3f52',
	margin: '24px 0',
}

const footerText = {
	color: '#8a8fa0',
	fontSize: '12px',
}

const link = {
	color: '#1a9484',
}

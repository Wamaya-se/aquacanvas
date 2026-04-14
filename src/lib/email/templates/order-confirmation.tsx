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
	orderNumber: string
	styleName: string
	formatName?: string
	price: string
	generatedImageUrl?: string | null
	siteUrl: string
}

export function OrderConfirmationEmail({
	orderNumber,
	styleName,
	formatName,
	price,
	generatedImageUrl,
	siteUrl,
}: OrderConfirmationEmailProps) {
	return (
		<Html>
			<Head />
			<Preview>Your Aquacanvas order #{orderNumber} is confirmed!</Preview>
			<Body style={main}>
				<Container style={container}>
					<Heading style={heading}>Thank You for Your Order!</Heading>
					<Text style={text}>
						Your artwork has been ordered and we&apos;ll start preparing your
						print right away.
					</Text>

					<Section style={orderBox}>
						<Text style={label}>Order Number</Text>
						<Text style={value}>#{orderNumber}</Text>

						<Text style={label}>Style</Text>
						<Text style={value}>{styleName}</Text>

						{formatName && (
							<>
								<Text style={label}>Print Format</Text>
								<Text style={value}>{formatName}</Text>
							</>
						)}

						<Text style={label}>Total</Text>
						<Text style={value}>{price} SEK</Text>
					</Section>

					{generatedImageUrl && (
						<Section style={{ textAlign: 'center' as const, marginBottom: '24px' }}>
							<Img
								src={generatedImageUrl}
								alt="Your artwork"
								width={400}
								style={{ borderRadius: '8px', maxWidth: '100%' }}
							/>
						</Section>
					)}

					<Hr style={hr} />

					<Text style={footerText}>
						Questions? Reply to this email or visit{' '}
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

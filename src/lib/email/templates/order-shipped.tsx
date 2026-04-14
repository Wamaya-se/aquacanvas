import {
	Body,
	Container,
	Head,
	Heading,
	Hr,
	Html,
	Link,
	Preview,
	Section,
	Text,
} from '@react-email/components'

interface OrderShippedEmailProps {
	orderNumber: string
	styleName: string
	price: string
	siteUrl: string
}

export function OrderShippedEmail({
	orderNumber,
	styleName,
	price,
	siteUrl,
}: OrderShippedEmailProps) {
	return (
		<Html>
			<Head />
			<Preview>Your Aquacanvas order #{orderNumber} has been shipped!</Preview>
			<Body style={main}>
				<Container style={container}>
					<Heading style={heading}>Your Artwork Has Been Shipped!</Heading>
					<Text style={text}>
						Great news — your artwork print is on its way! You should receive
						it within 3–7 business days.
					</Text>

					<Section style={orderBox}>
						<Text style={label}>Order Number</Text>
						<Text style={value}>#{orderNumber}</Text>

						<Text style={label}>Style</Text>
						<Text style={value}>{styleName}</Text>

						<Text style={label}>Total</Text>
						<Text style={value}>{price} SEK</Text>
					</Section>

					<Hr style={hr} />

					<Text style={footerText}>
						Questions about your delivery? Reply to this email or visit{' '}
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

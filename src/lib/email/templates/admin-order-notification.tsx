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

interface AdminOrderNotificationEmailProps {
	orderNumber: string
	customerEmail: string | null
	styleName: string
	formatName?: string
	price: string
	adminUrl: string
}

export function AdminOrderNotificationEmail({
	orderNumber,
	customerEmail,
	styleName,
	formatName,
	price,
	adminUrl,
}: AdminOrderNotificationEmailProps) {
	return (
		<Html>
			<Head />
			<Preview>New Aquacanvas order #{orderNumber}</Preview>
			<Body style={main}>
				<Container style={container}>
					<Heading style={heading}>New Order Received</Heading>
					<Text style={text}>
						A new order has been paid and is ready for processing.
					</Text>

					<Section style={orderBox}>
						<Text style={label}>Order Number</Text>
						<Text style={value}>#{orderNumber}</Text>

						<Text style={label}>Customer</Text>
						<Text style={value}>{customerEmail ?? 'Guest'}</Text>

						<Text style={label}>Style</Text>
						<Text style={value}>{styleName}</Text>

						{formatName && (
							<>
								<Text style={label}>Print Format</Text>
								<Text style={value}>{formatName}</Text>
							</>
						)}

						<Text style={label}>Amount</Text>
						<Text style={value}>{price} SEK</Text>
					</Section>

					<Link href={adminUrl} style={buttonStyle}>
						View Order in Admin
					</Link>

					<Hr style={hr} />

					<Text style={footerText}>
						Aquacanvas Admin Notification
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

const buttonStyle = {
	display: 'inline-block' as const,
	backgroundColor: '#1a9484',
	color: '#034f46',
	padding: '12px 24px',
	borderRadius: '8px',
	fontSize: '14px',
	fontWeight: '600' as const,
	textDecoration: 'none' as const,
	marginBottom: '24px',
}

const hr = {
	borderColor: '#3a3f52',
	margin: '24px 0',
}

const footerText = {
	color: '#8a8fa0',
	fontSize: '12px',
}

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
	locale: string
	strings: {
		preview: string
		heading: string
		intro: string
		labelOrderNumber: string
		labelCustomer: string
		labelStyle: string
		labelFormat: string
		labelAmount: string
		guestLabel: string
		ctaViewOrder: string
		footer: string
		orderNumberValue: string
		priceLabel: string
	}
	customerEmail: string | null
	styleName: string
	formatName?: string
	adminUrl: string
}

export function AdminOrderNotificationEmail({
	locale,
	strings,
	customerEmail,
	styleName,
	formatName,
	adminUrl,
}: AdminOrderNotificationEmailProps) {
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

						<Text style={label}>{strings.labelCustomer}</Text>
						<Text style={value}>{customerEmail ?? strings.guestLabel}</Text>

						<Text style={label}>{strings.labelStyle}</Text>
						<Text style={value}>{styleName}</Text>

						{formatName && (
							<>
								<Text style={label}>{strings.labelFormat}</Text>
								<Text style={value}>{formatName}</Text>
							</>
						)}

						<Text style={label}>{strings.labelAmount}</Text>
						<Text style={value}>{strings.priceLabel}</Text>
					</Section>

					<Link href={adminUrl} style={buttonStyle}>
						{strings.ctaViewOrder}
					</Link>

					<Hr style={hr} />

					<Text style={footerText}>{strings.footer}</Text>
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

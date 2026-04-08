import type { ReactNode } from 'react'

interface MarketingLayoutProps {
	children: ReactNode
}

export default function MarketingLayout({ children }: MarketingLayoutProps) {
	return (
		<div className="flex min-h-dvh flex-col">
			<main id="main-content" className="flex-1">
				{children}
			</main>
		</div>
	)
}

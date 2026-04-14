import type { ReactNode } from 'react'
import { Header } from '@/components/shared/header'
import { Footer } from '@/components/shared/footer'

interface MarketingLayoutProps {
	children: ReactNode
}

export default function MarketingLayout({ children }: MarketingLayoutProps) {
	return (
		<div className="flex min-h-dvh flex-col">
			<Header />
			<main id="main-content" className="flex-1">
				{children}
			</main>
			<Footer />
		</div>
	)
}

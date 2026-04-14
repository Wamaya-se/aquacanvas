import type { ReactNode } from 'react'
import { Header } from '@/components/shared/header'
import { Footer } from '@/components/shared/footer'

interface ShopLayoutProps {
	children: ReactNode
}

export default function ShopLayout({ children }: ShopLayoutProps) {
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

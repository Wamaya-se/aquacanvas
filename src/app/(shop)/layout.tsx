import type { ReactNode } from 'react'

interface ShopLayoutProps {
	children: ReactNode
}

export default function ShopLayout({ children }: ShopLayoutProps) {
	return (
		<div className="flex min-h-dvh flex-col">
			<main id="main-content" className="flex-1">
				{children}
			</main>
		</div>
	)
}

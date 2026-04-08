import type { ReactNode } from 'react'

interface AdminLayoutProps {
	children: ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
	return (
		<div className="flex min-h-dvh flex-col bg-surface-container-low">
			<main id="main-content" className="flex-1 px-6 py-8">
				<div className="mx-auto max-w-7xl">
					{children}
				</div>
			</main>
		</div>
	)
}

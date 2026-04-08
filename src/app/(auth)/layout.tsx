import type { ReactNode } from 'react'

interface AuthLayoutProps {
	children: ReactNode
}

export default function AuthLayout({ children }: AuthLayoutProps) {
	return (
		<div className="flex min-h-dvh items-center justify-center bg-surface-container-low px-6 py-12">
			<main id="main-content" className="w-full max-w-md">
				{children}
			</main>
		</div>
	)
}

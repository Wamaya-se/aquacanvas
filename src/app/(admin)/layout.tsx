'use client'

import { useState, useCallback, type ReactNode } from 'react'
import { AdminSidebar, AdminMobileHeader } from '@/components/admin/sidebar'

interface AdminLayoutProps {
	children: ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
	const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)
	const handleOpenChange = useCallback((open: boolean) => setIsMobileNavOpen(open), [])

	return (
		<div className="flex min-h-dvh bg-surface-container-low">
			<AdminSidebar />
			<div className="flex flex-1 flex-col overflow-hidden">
				<AdminMobileHeader isOpen={isMobileNavOpen} onOpenChange={handleOpenChange} />
				<main id="main-content" className="flex-1 overflow-y-auto px-4 py-4 md:px-8 md:py-8">
					<div className="mx-auto max-w-6xl">
						{children}
					</div>
				</main>
			</div>
		</div>
	)
}

import { ThemeProvider as NextThemesProvider } from '@wrksz/themes/next'
import type { ReactNode } from 'react'

interface ThemeProviderProps {
	children: ReactNode
}

export async function ThemeProvider({ children }: ThemeProviderProps) {
	return (
		<NextThemesProvider
			attribute="class"
			defaultTheme="light"
			enableSystem
			disableTransitionOnChange
		>
			{children}
		</NextThemesProvider>
	)
}

'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { Moon, Sun, Monitor } from 'lucide-react'
import { Button } from '@/components/ui/button'

const themes = ['light', 'dark', 'system'] as const

export function ThemeToggle() {
	const { theme, setTheme } = useTheme()
	const [mounted, setMounted] = useState(false)

	useEffect(() => {
		setMounted(true)
	}, [])

	if (!mounted) {
		return <Button variant="ghost" size="icon" aria-hidden />
	}

	function handleCycle() {
		const currentIndex = themes.indexOf(
			(theme as (typeof themes)[number]) ?? 'system'
		)
		const nextIndex = (currentIndex + 1) % themes.length
		setTheme(themes[nextIndex])
	}

	const icon =
		theme === 'dark' ? (
			<Moon className="size-4" />
		) : theme === 'light' ? (
			<Sun className="size-4" />
		) : (
			<Monitor className="size-4" />
		)

	return (
		<Button
			variant="ghost"
			size="icon"
			onClick={handleCycle}
			aria-label={`Current theme: ${theme}. Click to switch.`}
		>
			{icon}
		</Button>
	)
}

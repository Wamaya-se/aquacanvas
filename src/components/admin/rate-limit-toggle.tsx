'use client'

import { useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { ShieldOff } from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { toggleRateLimitBypass } from '@/lib/actions/admin-settings'

interface RateLimitToggleProps {
	initialEnabled: boolean
}

export function RateLimitToggle({ initialEnabled }: RateLimitToggleProps) {
	const t = useTranslations('admin')
	const [enabled, setEnabled] = useState(initialEnabled)
	const [isPending, startTransition] = useTransition()

	function handleToggle(checked: boolean) {
		setEnabled(checked)
		startTransition(async () => {
			const result = await toggleRateLimitBypass(checked)
			if (!result.success) {
				setEnabled(!checked)
			}
		})
	}

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-3">
					<Switch
						id="rateLimitBypass"
						checked={enabled}
						onCheckedChange={handleToggle}
						disabled={isPending}
					/>
					<Label htmlFor="rateLimitBypass" className="cursor-pointer">
						{t('rateLimitBypassLabel')}
					</Label>
				</div>
				<Badge variant={enabled ? 'default' : 'secondary'}>
					{enabled ? t('rateLimitBypassEnabled') : t('rateLimitBypassDisabled')}
				</Badge>
			</div>
			<p className="font-sans text-xs text-muted-foreground">
				{t('rateLimitBypassDescription')}
			</p>
			{enabled && (
				<div className="flex items-center gap-2 rounded-lg bg-warning/10 px-3 py-2">
					<ShieldOff className="size-4 shrink-0 text-warning" aria-hidden="true" />
					<p className="font-sans text-xs font-medium text-warning">
						{t('rateLimitBypassEnabled')}
					</p>
				</div>
			)}
		</div>
	)
}

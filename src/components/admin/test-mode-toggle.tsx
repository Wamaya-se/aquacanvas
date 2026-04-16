'use client'

import { useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { FlaskConical } from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { toggleTestMode } from '@/lib/actions/admin-settings'

interface TestModeToggleProps {
	initialEnabled: boolean
}

export function TestModeToggle({ initialEnabled }: TestModeToggleProps) {
	const t = useTranslations('admin')
	const [enabled, setEnabled] = useState(initialEnabled)
	const [isPending, startTransition] = useTransition()

	function handleToggle(checked: boolean) {
		setEnabled(checked)
		startTransition(async () => {
			const result = await toggleTestMode(checked)
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
						id="testMode"
						checked={enabled}
						onCheckedChange={handleToggle}
						disabled={isPending}
					/>
					<Label htmlFor="testMode" className="cursor-pointer">
						{t('testModeLabel')}
					</Label>
				</div>
				<Badge variant={enabled ? 'default' : 'secondary'}>
					{enabled ? t('testModeEnabled') : t('testModeDisabled')}
				</Badge>
			</div>
			<p className="font-sans text-xs text-muted-foreground">
				{t('testModeDescription')}
			</p>
			{enabled && (
				<div className="flex items-center gap-2 rounded-lg bg-warning/10 px-3 py-2">
					<FlaskConical className="size-4 shrink-0 text-warning" aria-hidden="true" />
					<p className="font-sans text-xs font-medium text-warning">
						{t('testModeEnabled')}
					</p>
				</div>
			)}
		</div>
	)
}

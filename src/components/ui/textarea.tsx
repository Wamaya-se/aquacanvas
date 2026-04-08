import * as React from 'react'

import { cn } from '@/lib/utils'

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
	return (
		<textarea
			data-slot="textarea"
			className={cn(
				'flex min-h-[80px] w-full rounded-xl border border-outline-variant/20 bg-surface-dim px-4 py-3 font-sans text-base text-foreground outline-none transition-[border-color,box-shadow] placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
				'focus-visible:border-tertiary focus-visible:ring-2 focus-visible:ring-tertiary/30',
				'aria-invalid:border-destructive aria-invalid:ring-destructive/20',
				className
			)}
			{...props}
		/>
	)
}

export { Textarea }

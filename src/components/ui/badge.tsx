import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Slot } from 'radix-ui'

import { cn } from '@/lib/utils'

const badgeVariants = cva(
	'inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border border-transparent px-2.5 py-0.5 font-sans text-xs font-medium whitespace-nowrap [&>svg]:pointer-events-none [&>svg]:size-3',
	{
		variants: {
			variant: {
				default:
					'bg-brand text-on-brand',
				secondary:
					'bg-secondary-container text-on-secondary-container',
				outline:
					'border-outline-variant/20 text-foreground',
				destructive:
					'bg-destructive text-destructive-foreground',
				success:
					'bg-success/15 text-success',
				warning:
					'bg-warning/15 text-warning',
			},
		},
		defaultVariants: {
			variant: 'default',
		},
	}
)

function Badge({
	className,
	variant = 'default',
	asChild = false,
	...props
}: React.ComponentProps<'span'> &
	VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
	const Comp = asChild ? Slot.Root : 'span'

	return (
		<Comp
			data-slot="badge"
			data-variant={variant}
			className={cn(badgeVariants({ variant }), className)}
			{...props}
		/>
	)
}

export { Badge, badgeVariants }

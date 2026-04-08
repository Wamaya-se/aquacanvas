import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Slot } from 'radix-ui'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
	'inline-flex shrink-0 items-center justify-center gap-2 font-sans text-sm font-medium whitespace-nowrap outline-none transition-transform disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*=\'size-\'])]:size-4',
	{
		variants: {
			variant: {
				brand:
					'bg-gradient-to-r from-brand to-brand-container text-on-brand focus-visible:ring-2 focus-visible:ring-ring hover:brightness-110 active:scale-[0.97]',
				secondary:
					'bg-surface-container-highest text-brand focus-visible:ring-2 focus-visible:ring-ring hover:brightness-110 active:scale-[0.97]',
				ghost:
					'text-foreground hover:bg-surface-container-high focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.97]',
				outline:
					'border border-outline-variant/20 text-foreground hover:bg-surface-container-high focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.97]',
				destructive:
					'bg-destructive text-destructive-foreground focus-visible:ring-2 focus-visible:ring-destructive/50 hover:brightness-110 active:scale-[0.97]',
				link: 'text-brand underline-offset-4 hover:underline',
			},
			size: {
				default: 'h-10 rounded-xl px-5 py-2 has-[>svg]:px-3',
				xs: 'h-7 gap-1 rounded-lg px-2.5 text-xs has-[>svg]:px-1.5 [&_svg:not([class*=\'size-\'])]:size-3',
				sm: 'h-8 gap-1.5 rounded-lg px-3.5 has-[>svg]:px-2.5',
				lg: 'h-12 rounded-xl px-8 text-base has-[>svg]:px-5',
				icon: 'size-10 rounded-xl',
				'icon-sm': 'size-8 rounded-lg',
			},
		},
		defaultVariants: {
			variant: 'brand',
			size: 'default',
		},
	}
)

function Button({
	className,
	variant = 'brand',
	size = 'default',
	asChild = false,
	...props
}: React.ComponentProps<'button'> &
	VariantProps<typeof buttonVariants> & {
		asChild?: boolean
	}) {
	const Comp = asChild ? Slot.Root : 'button'

	return (
		<Comp
			data-slot="button"
			data-variant={variant}
			data-size={size}
			className={cn(buttonVariants({ variant, size, className }))}
			{...props}
		/>
	)
}

export { Button, buttonVariants }

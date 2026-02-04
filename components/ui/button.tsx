import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700 shadow-sm',
        secondary:
          'bg-secondary-500 text-white hover:bg-secondary-600 active:bg-secondary-700 shadow-sm',
        outline:
          'border-2 border-primary-500 text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-950 active:bg-primary-100',
        ghost:
          'text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-950 active:bg-primary-100',
        accent:
          'bg-accent-earth text-white hover:opacity-90 active:opacity-80 shadow-sm',
      },
      size: {
        default: 'h-11 px-6 py-3 text-base',
        sm: 'h-9 px-4 py-2 text-sm',
        lg: 'h-14 px-8 py-4 text-lg',
        icon: 'h-11 w-11',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }

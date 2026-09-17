import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'
export const buttonVariants=cva('inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',{variants:{variant:{default:'bg-primary text-primary-foreground hover:bg-primary-hover',primary:'bg-primary text-primary-foreground hover:bg-primary-hover',outline:'border border-border bg-surface text-foreground hover:bg-surface-elevated',secondary:'border border-border bg-surface text-foreground hover:bg-surface-elevated',ghost:'text-muted-foreground hover:bg-accent hover:text-foreground',link:'text-primary underline-offset-4 hover:underline',destructive:'bg-destructive text-destructive-foreground',danger:'bg-destructive text-destructive-foreground'},size:{sm:'min-h-9 px-3 text-xs',default:'min-h-11 px-4',lg:'min-h-12 px-6 text-base',icon:'size-11 p-0'}},defaultVariants:{variant:'default',size:'default'}})
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>,VariantProps<typeof buttonVariants>{asChild?:boolean}
export const Button=forwardRef<HTMLButtonElement,ButtonProps>(({className,variant,size,asChild=false,...props},ref)=>{const Comp=asChild?Slot:'button';return <Comp ref={ref} className={cn(buttonVariants({variant,size}),className)} {...props}/>})
Button.displayName='Button'

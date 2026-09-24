import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { LoaderCircle } from 'lucide-react'
import type { ComponentProps } from 'react'
import { cn } from '../cn'

export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-control font-medium text-sm whitespace-nowrap transition-colors duration-(--duration-fast) disabled:pointer-events-none disabled:bg-disabled-bg disabled:text-disabled-text aria-busy:cursor-progress',
  {
    variants: {
      variant: {
        primary: 'bg-action-primary text-action-primary-text hover:bg-action-primary-hover',
        secondary: 'border border-border-strong bg-surface text-text hover:bg-surface-muted',
        ghost: 'text-text hover:bg-surface-muted',
        link: 'h-auto p-0 text-text underline underline-offset-3 hover:decoration-2 disabled:bg-transparent',
      },
      size: {
        md: 'h-(--control-height) px-4',
        sm: 'h-(--control-height-sm) px-3',
        icon: 'size-(--control-height) p-0',
        'icon-sm': 'size-(--control-height-sm) p-0',
      },
      block: { true: 'w-full' },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
)

type ButtonProps = ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    /** Renderiza o filho (ex.: <a> ou <Link>) com o estilo do botão. */
    asChild?: boolean
    /** Mostra o spinner, marca aria-busy e bloqueia cliques repetidos. */
    loading?: boolean
  }

export function Button({
  className,
  variant,
  size,
  block,
  asChild = false,
  loading = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const classes = cn(buttonVariants({ variant, size, block }), className)

  if (asChild) {
    return (
      <Slot className={classes} {...props}>
        {children}
      </Slot>
    )
  }

  return (
    <button
      type="button"
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? <LoaderCircle aria-hidden className="size-5 animate-spin" /> : null}
      {children}
    </button>
  )
}

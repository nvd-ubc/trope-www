import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'

type InlineStatusVariant = 'neutral' | 'success' | 'warning' | 'danger' | 'info'

type InlineStatusProps = {
  children: ReactNode
  variant?: InlineStatusVariant
  className?: string
}

const variants: Record<InlineStatusVariant, string> = {
  neutral: 'bg-muted text-muted-foreground',
  success: 'bg-emerald-100 text-emerald-700',
  warning: 'bg-amber-100 text-amber-700',
  danger: 'bg-destructive/10 text-destructive',
  info: 'bg-primary/10 text-primary',
}

export default function InlineStatus({
  children,
  variant = 'neutral',
  className,
}: InlineStatusProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  )
}

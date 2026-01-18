import type { HTMLAttributes } from 'react'

type BadgeVariant = 'neutral' | 'success' | 'warning' | 'danger' | 'info'

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant
}

const variants: Record<BadgeVariant, string> = {
  neutral: 'bg-slate-100 text-slate-600 border-slate-200',
  success: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  warning: 'bg-amber-50 text-amber-700 border-amber-100',
  danger: 'bg-rose-50 text-rose-700 border-rose-100',
  info: 'bg-blue-50 text-blue-700 border-blue-100',
}

export default function Badge({
  variant = 'neutral',
  className,
  ...props
}: BadgeProps) {
  const classes = [
    'inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-wide',
    variants[variant],
    className,
  ]
    .filter(Boolean)
    .join(' ')
  return <span className={classes} {...props} />
}

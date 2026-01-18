import type { ButtonHTMLAttributes } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline'
type ButtonSize = 'sm' | 'md'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  size?: ButtonSize
}

const base =
  'inline-flex items-center justify-center gap-2 rounded-full font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--trope-accent)]/40 disabled:cursor-not-allowed disabled:opacity-60'

const variants: Record<ButtonVariant, string> = {
  primary:
    'bg-[color:var(--trope-accent)] text-white shadow-sm hover:bg-[color:var(--trope-accent)]/90',
  secondary:
    'bg-slate-100 text-slate-700 hover:bg-slate-200',
  ghost:
    'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
  outline:
    'border border-slate-200 text-slate-700 hover:border-slate-300 hover:text-slate-900',
}

const sizes: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
}

export default function Button({
  variant = 'primary',
  size = 'md',
  className,
  ...props
}: ButtonProps) {
  const classes = [base, variants[variant], sizes[size], className]
    .filter(Boolean)
    .join(' ')
  return <button className={classes} {...props} />
}

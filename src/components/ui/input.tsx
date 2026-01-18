import type { InputHTMLAttributes } from 'react'

type InputProps = InputHTMLAttributes<HTMLInputElement>

export default function Input({ className, ...props }: InputProps) {
  const classes = [
    'w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-[color:var(--trope-accent)]/20',
    className,
  ]
    .filter(Boolean)
    .join(' ')
  return <input className={classes} {...props} />
}

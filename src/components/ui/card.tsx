import type { HTMLAttributes } from 'react'

type CardProps = HTMLAttributes<HTMLDivElement>

export default function Card({ className, ...props }: CardProps) {
  const classes = [
    'rounded-2xl border border-slate-200 bg-white shadow-sm',
    className,
  ]
    .filter(Boolean)
    .join(' ')
  return <div className={classes} {...props} />
}

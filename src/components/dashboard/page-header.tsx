import Link from 'next/link'
import { type ReactNode } from 'react'
import Button from '@/components/ui/button'
import { cn } from '@/lib/utils'

type PageHeaderProps = {
  title: ReactNode
  description?: ReactNode
  eyebrow?: ReactNode
  badges?: ReactNode
  actions?: ReactNode
  backHref?: string
  backLabel?: string
  className?: string
}

export default function PageHeader({
  title,
  description,
  eyebrow,
  badges,
  actions,
  backHref,
  backLabel = 'Back',
  className,
}: PageHeaderProps) {
  return (
    <div className={cn('flex flex-wrap items-start justify-between gap-3', className)}>
      <div className="space-y-1">
        {eyebrow && (
          <div className="text-xs tracking-[0.12em] uppercase text-muted-foreground">{eyebrow}</div>
        )}
        <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
        {badges && <div className="flex flex-wrap items-center gap-2">{badges}</div>}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {actions}
        {backHref && (
          <Button asChild variant="ghost" size="sm">
            <Link href={backHref}>{backLabel}</Link>
          </Button>
        )}
      </div>
    </div>
  )
}

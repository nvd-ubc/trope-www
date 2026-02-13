import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'

type DataToolbarProps = {
  summary?: ReactNode
  filters?: ReactNode
  actions?: ReactNode
  className?: string
}

export default function DataToolbar({
  summary,
  filters,
  actions,
  className,
}: DataToolbarProps) {
  return (
    <div className={cn('flex flex-wrap items-center justify-between gap-3', className)}>
      <div className="text-sm text-muted-foreground">{summary}</div>
      <div className="flex flex-wrap items-center gap-2">
        {filters}
        {actions}
      </div>
    </div>
  )
}

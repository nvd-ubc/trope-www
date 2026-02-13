import { type ReactNode } from 'react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

type MetricCardProps = {
  label: ReactNode
  value: ReactNode
  helper?: ReactNode
  badgeLabel?: ReactNode
  badgeVariant?: 'neutral' | 'info' | 'success' | 'warning' | 'danger'
  className?: string
}

export default function MetricCard({
  label,
  value,
  helper,
  badgeLabel,
  badgeVariant = 'neutral',
  className,
}: MetricCardProps) {
  return (
    <Card className={cn('gap-4', className)}>
      <CardHeader className="pb-0">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
          {badgeLabel && <Badge variant={badgeVariant}>{badgeLabel}</Badge>}
        </div>
      </CardHeader>
      <CardContent className="space-y-1">
        <div className="text-2xl font-semibold text-foreground">{value}</div>
        {helper && <div className="text-xs text-muted-foreground">{helper}</div>}
      </CardContent>
    </Card>
  )
}

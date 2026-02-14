import Card, { CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { type ReactNode } from 'react'

export function PageHeaderSkeleton({
  title,
  description,
  eyebrow,
  className,
  withActions = true,
  withBadges = false,
}: {
  title?: ReactNode
  description?: ReactNode
  eyebrow?: ReactNode
  className?: string
  withActions?: boolean
  withBadges?: boolean
}) {
  return (
    <div className={cn('flex flex-wrap items-start justify-between gap-3', className)}>
      <div className="space-y-2">
        {eyebrow ? (
          <div className="text-xs tracking-[0.12em] uppercase text-muted-foreground">{eyebrow}</div>
        ) : null}
        {title ? <h1 className="text-2xl font-semibold text-foreground">{title}</h1> : <Skeleton className="h-8 w-52" />}
        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : (
          <Skeleton className="h-4 w-72 max-w-[80vw]" />
        )}
        {withBadges ? (
          <div className="flex items-center gap-2 pt-1">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
        ) : null}
      </div>
      {withActions && (
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-28" />
          <Skeleton className="h-9 w-24" />
        </div>
      )}
    </div>
  )
}

export function MetricGridSkeleton({
  count = 3,
  className,
}: {
  count?: number
  className?: string
}) {
  return (
    <div className={cn('grid gap-4 md:grid-cols-3', className)}>
      {Array.from({ length: count }).map((_, index) => (
        <Card key={`metric-skeleton-${index}`} className="gap-4">
          <CardHeader className="pb-0">
            <Skeleton className="h-4 w-24" />
          </CardHeader>
          <CardContent className="space-y-2">
            <Skeleton className="h-8 w-36" />
            <Skeleton className="h-3 w-40" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export function SectionCardSkeleton({
  rows = 3,
  className,
}: {
  rows?: number
  className?: string
}) {
  return (
    <Card className={cn('gap-0', className)}>
      <CardHeader className="space-y-2">
        <Skeleton className="h-5 w-36" />
        <Skeleton className="h-4 w-80 max-w-[80vw]" />
      </CardHeader>
      <CardContent className="space-y-3">
        {Array.from({ length: rows }).map((_, index) => (
          <Skeleton key={`section-row-skeleton-${index}`} className="h-10 w-full" />
        ))}
      </CardContent>
    </Card>
  )
}

export function DataTableSkeleton({
  rows = 6,
  columns = 7,
  className,
}: {
  rows?: number
  columns?: number
  className?: string
}) {
  return (
    <Card className={cn('gap-0 overflow-hidden', className)}>
      <CardHeader className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-9 w-36" />
          <Skeleton className="h-9 w-36" />
          <Skeleton className="h-9 w-40" />
        </div>
      </CardHeader>
      <CardContent className="space-y-0 px-0">
        <div className="grid grid-cols-1 gap-0">
          <div className="border-y border-border px-6 py-4">
            <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
              {Array.from({ length: columns }).map((_, index) => (
                <Skeleton key={`header-skeleton-${index}`} className="h-4 w-20" />
              ))}
            </div>
          </div>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <div key={`row-skeleton-${rowIndex}`} className="border-b border-border px-6 py-4">
              <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
                {Array.from({ length: columns }).map((_, colIndex) => (
                  <Skeleton key={`cell-skeleton-${rowIndex}-${colIndex}`} className="h-4 w-full" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export function DashboardHomeSkeleton() {
  return (
    <div className="space-y-6">
      <MetricGridSkeleton />
      <SectionCardSkeleton rows={4} />
      <SectionCardSkeleton rows={3} />
      <SectionCardSkeleton rows={1} />
    </div>
  )
}

export function WorkspaceOverviewSkeleton() {
  return (
    <div className="space-y-6">
      <PageHeaderSkeleton
        title="Workspace"
        description="Loading workspace overview."
      />
      <SectionCardSkeleton rows={3} />
      <div className="grid gap-4 md:grid-cols-2">
        <SectionCardSkeleton rows={4} />
        <SectionCardSkeleton rows={4} />
      </div>
      <SectionCardSkeleton rows={3} />
    </div>
  )
}

export function WorkflowDetailSkeleton({ workflowId }: { workflowId?: string }) {
  return (
    <div className="space-y-6">
      <PageHeaderSkeleton
        title="Workflow details"
        description={
          workflowId ? (
            <>
              Loading details for <span className="font-mono">{workflowId}</span>.
            </>
          ) : (
            'Loading operational health, governance, settings, versions, and guide preview.'
          )
        }
        withBadges
      />

      <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-foreground">Operational health</h2>
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {Array.from({ length: 7 }).map((_, index) => (
              <div key={`workflow-health-field-${index}`} className="space-y-2">
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
          <Skeleton className="mt-4 h-3 w-72 max-w-[80vw]" />
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-foreground">Governance</h2>
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 sm:gap-x-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={`workflow-governance-field-${index}`} className="space-y-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-4 w-28" />
              </div>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Skeleton className="h-9 w-28" />
            <Skeleton className="h-9 w-24" />
          </div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
        <div className="space-y-4">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-foreground">Settings</h2>
              <Skeleton className="h-4 w-24" />
            </div>
            <div className="mt-4 space-y-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={`workflow-settings-input-${index}`} className="space-y-2">
                  <Skeleton className="h-3 w-28" />
                  <Skeleton className="h-10 w-full rounded-xl" />
                </div>
              ))}
              <div className="space-y-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-20 w-full rounded-xl" />
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <Skeleton className="h-9 w-32" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-foreground">Run history</h2>
              <Skeleton className="h-4 w-20" />
            </div>
            <Skeleton className="mt-4 h-12 w-full rounded-xl" />
            <div className="mt-4 space-y-2">
              <Skeleton className="h-4 w-full" />
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={`workflow-runs-row-${index}`} className="h-10 w-full" />
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="p-6">
            <h2 className="text-base font-semibold text-foreground">Versions</h2>
            <div className="mt-4 space-y-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={`workflow-version-${index}`} className="h-14 w-full rounded-xl" />
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <h2 className="text-base font-semibold text-foreground">Guide preview</h2>
                <Skeleton className="h-4 w-16" />
              </div>
              <Skeleton className="h-4 w-36" />
            </div>
            <div className="mt-4 space-y-4">
              {Array.from({ length: 2 }).map((_, index) => (
                <div key={`workflow-guide-step-${index}`} className="space-y-3 rounded-2xl border p-4">
                  <div className="flex items-center justify-between gap-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-5 w-20 rounded-full" />
                  </div>
                  <Skeleton className="h-36 w-full rounded-xl" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

export function GuidePageSkeleton() {
  return (
    <div className="space-y-6">
      <PageHeaderSkeleton
        title="Workflow guide"
        description="Loading guide details."
        eyebrow="Workflow guide"
      />
      <SectionCardSkeleton rows={1} />
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <SectionCardSkeleton rows={5} />
        <SectionCardSkeleton rows={6} />
      </div>
    </div>
  )
}

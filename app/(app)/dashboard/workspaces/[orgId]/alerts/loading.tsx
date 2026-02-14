import { DataTableSkeleton, PageHeaderSkeleton } from '@/components/dashboard'

export default function AlertsLoading() {
  return (
    <div className="space-y-6">
      <PageHeaderSkeleton
        title="Alerts"
        description="Resolve staleness, failures, and governance risks."
      />
      <DataTableSkeleton rows={7} columns={7} />
    </div>
  )
}

import { DataTableSkeleton, PageHeaderSkeleton } from '@/components/dashboard'

export default function RunsLoading() {
  return (
    <div className="space-y-6">
      <PageHeaderSkeleton />
      <DataTableSkeleton rows={8} columns={8} />
    </div>
  )
}


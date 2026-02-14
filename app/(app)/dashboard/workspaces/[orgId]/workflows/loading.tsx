import { DataTableSkeleton, PageHeaderSkeleton } from '@/components/dashboard'

export default function WorkflowsLoading() {
  return (
    <div className="space-y-6">
      <PageHeaderSkeleton />
      <DataTableSkeleton rows={8} columns={9} />
    </div>
  )
}


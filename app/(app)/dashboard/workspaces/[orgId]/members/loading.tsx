import { DataTableSkeleton, PageHeaderSkeleton } from '@/components/dashboard'

export default function MembersLoading() {
  return (
    <div className="space-y-6">
      <PageHeaderSkeleton />
      <DataTableSkeleton rows={7} columns={6} />
    </div>
  )
}


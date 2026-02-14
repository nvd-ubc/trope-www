import { DataTableSkeleton, PageHeaderSkeleton } from '@/components/dashboard'

export default function InvitesLoading() {
  return (
    <div className="space-y-6">
      <PageHeaderSkeleton />
      <DataTableSkeleton rows={6} columns={6} />
    </div>
  )
}


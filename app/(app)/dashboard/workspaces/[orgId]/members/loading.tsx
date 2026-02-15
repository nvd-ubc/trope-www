import { DataTableSkeleton, PageHeaderSkeleton } from '@/components/dashboard'

export default function MembersLoading() {
  return (
    <div className="space-y-6">
      <PageHeaderSkeleton
        title="Members"
        description="Manage access and roles for this workspace."
      />
      <DataTableSkeleton rows={7} columns={6} />
    </div>
  )
}

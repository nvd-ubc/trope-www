import { DataTableSkeleton, PageHeaderSkeleton } from '@/components/dashboard'

export default function WorkspacesLoading() {
  return (
    <div className="space-y-6">
      <PageHeaderSkeleton
        title="Workspaces"
        description="Choose defaults and manage team workspaces."
      />
      <DataTableSkeleton rows={5} columns={5} />
    </div>
  )
}

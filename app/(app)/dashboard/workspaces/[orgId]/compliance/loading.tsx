import { DataTableSkeleton, PageHeaderSkeleton } from '@/components/dashboard'

export default function ComplianceLoading() {
  return (
    <div className="space-y-6">
      <PageHeaderSkeleton
        title="Compliance"
        description="Track required SOP completion across your workspace."
      />
      <DataTableSkeleton rows={7} columns={8} />
    </div>
  )
}

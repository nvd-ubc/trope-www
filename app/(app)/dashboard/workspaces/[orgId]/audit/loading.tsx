import { DataTableSkeleton, PageHeaderSkeleton } from '@/components/dashboard'

export default function AuditLoading() {
  return (
    <div className="space-y-6">
      <PageHeaderSkeleton
        title="Audit log"
        description="Track membership changes, invite actions, and governance updates."
      />
      <DataTableSkeleton rows={7} columns={6} />
    </div>
  )
}

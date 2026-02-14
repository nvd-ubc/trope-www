import { DataTableSkeleton, PageHeaderSkeleton } from '@/components/dashboard'

export default function InvitesLoading() {
  return (
    <div className="space-y-6">
      <PageHeaderSkeleton
        title="Invites"
        description="Invite teammates and track onboarding status."
      />
      <DataTableSkeleton rows={6} columns={6} />
    </div>
  )
}

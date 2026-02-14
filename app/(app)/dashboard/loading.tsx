import { DashboardHomeSkeleton, PageHeaderSkeleton } from '@/components/dashboard'

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <PageHeaderSkeleton
        title="Dashboard"
        description="Account health, usage, and onboarding status."
        withBadges
      />
      <DashboardHomeSkeleton />
    </div>
  )
}

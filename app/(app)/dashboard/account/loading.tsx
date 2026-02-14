import { PageHeaderSkeleton, SectionCardSkeleton } from '@/components/dashboard'

export default function AccountLoading() {
  return (
    <div className="space-y-6">
      <PageHeaderSkeleton
        title="Account"
        description="Manage your profile, plan, and security settings."
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCardSkeleton rows={5} />
        <SectionCardSkeleton rows={4} />
      </div>
      <SectionCardSkeleton rows={1} />
    </div>
  )
}

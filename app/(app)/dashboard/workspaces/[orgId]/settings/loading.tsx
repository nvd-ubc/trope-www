import { PageHeaderSkeleton, SectionCardSkeleton } from '@/components/dashboard'

export default function SettingsLoading() {
  return (
    <div className="space-y-6">
      <PageHeaderSkeleton />
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <SectionCardSkeleton rows={8} />
        <SectionCardSkeleton rows={5} />
      </div>
      <SectionCardSkeleton rows={2} />
    </div>
  )
}


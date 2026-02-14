import Link from 'next/link'
import Badge from '@/components/ui/badge'
import Button from '@/components/ui/button'
import { EmptyState, PageHeader, SectionCard } from '@/components/dashboard'

export const dynamic = 'force-dynamic'

export default async function WorkspaceCommunityPage({
  params,
}: {
  params: Promise<{ orgId: string }>
}) {
  const { orgId } = await params

  return (
    <div className="space-y-6">
      <PageHeader
        title="Community"
        description="Templates and examples to accelerate documentation rollouts."
        backHref={`/dashboard/workspaces/${encodeURIComponent(orgId)}/home`}
        backLabel="Back to home"
        badges={<Badge variant="info">Template gallery</Badge>}
      />

      <SectionCard title="Coming next" description="Cloneable templates and curated workflow examples.">
        <EmptyState
          title="Template gallery is rolling out"
          description="Use existing workflow sharing for now. Community template cloning lands in the next increment."
        />
        <Button asChild variant="outline" size="sm">
          <Link href={`/dashboard/workspaces/${encodeURIComponent(orgId)}/workflows`}>Browse workflows</Link>
        </Button>
      </SectionCard>
    </div>
  )
}

import WorkspaceOverviewClient from './workspace-overview-client'

export const dynamic = 'force-dynamic'

export default async function WorkspaceOverviewPage({
  params,
}: {
  params: Promise<{ orgId: string }>
}) {
  const { orgId } = await params
  return <WorkspaceOverviewClient orgId={orgId} />
}

import InsightsClient from './insights-client'

export const dynamic = 'force-dynamic'

export default async function WorkspaceInsightsPage({
  params,
}: {
  params: Promise<{ orgId: string }>
}) {
  const { orgId } = await params
  return <InsightsClient orgId={orgId} />
}

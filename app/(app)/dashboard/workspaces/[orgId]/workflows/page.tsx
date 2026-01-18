import WorkflowsClient from './workflows-client'

export const dynamic = 'force-dynamic'

export default async function WorkflowsPage({
  params,
}: {
  params: Promise<{ orgId: string }>
}) {
  const { orgId } = await params
  return <WorkflowsClient orgId={orgId} />
}

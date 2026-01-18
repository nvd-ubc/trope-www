import WorkflowDetailClient from './workflow-detail-client'

export const dynamic = 'force-dynamic'

export default async function WorkflowDetailPage({
  params,
}: {
  params: Promise<{ orgId: string; workflowId: string }>
}) {
  const { orgId, workflowId } = await params
  return <WorkflowDetailClient orgId={orgId} workflowId={workflowId} />
}

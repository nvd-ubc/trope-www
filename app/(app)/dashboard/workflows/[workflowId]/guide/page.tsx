import WorkflowGuideClient from './guide-client'

export const dynamic = 'force-dynamic'

export default async function WorkflowGuidePage({
  params,
}: {
  params: Promise<{ workflowId: string }>
}) {
  const { workflowId } = await params
  return <WorkflowGuideClient workflowId={workflowId} />
}


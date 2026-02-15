import TasksClient from './tasks-client'

export const dynamic = 'force-dynamic'

export default async function WorkspaceTasksPage({
  params,
}: {
  params: Promise<{ orgId: string }>
}) {
  const { orgId } = await params
  return <TasksClient orgId={orgId} />
}

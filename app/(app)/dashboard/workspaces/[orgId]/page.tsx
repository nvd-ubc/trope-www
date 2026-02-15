import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function WorkspaceOverviewPage({
  params,
}: {
  params: Promise<{ orgId: string }>
}) {
  const { orgId } = await params
  redirect(`/dashboard/workspaces/${encodeURIComponent(orgId)}/home`)
}

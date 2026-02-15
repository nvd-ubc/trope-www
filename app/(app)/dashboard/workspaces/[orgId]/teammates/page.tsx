import TeammatesClient from './teammates-client'

export const dynamic = 'force-dynamic'

export default async function WorkspaceTeammatesPage({
  params,
}: {
  params: Promise<{ orgId: string }>
}) {
  const { orgId } = await params
  return <TeammatesClient orgId={orgId} />
}

import HomeClient from './home-client'

export const dynamic = 'force-dynamic'

export default async function WorkspaceHomePage({
  params,
}: {
  params: Promise<{ orgId: string }>
}) {
  const { orgId } = await params
  return <HomeClient orgId={orgId} />
}

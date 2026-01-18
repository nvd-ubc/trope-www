import RunsClient from './runs-client'

export default async function RunsPage({
  params,
}: {
  params: Promise<{ orgId: string }>
}) {
  const { orgId } = await params
  return <RunsClient orgId={orgId} />
}

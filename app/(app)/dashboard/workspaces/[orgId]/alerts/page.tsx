import AlertsClient from './alerts-client'

export default async function AlertsPage({
  params,
}: {
  params: Promise<{ orgId: string }>
}) {
  const { orgId } = await params
  return <AlertsClient orgId={orgId} />
}

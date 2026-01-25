import InvitesClient from './invites-client'

export const dynamic = 'force-dynamic'

export default async function InvitesPage({
  params,
}: {
  params: Promise<{ orgId: string }>
}) {
  const { orgId } = await params
  return <InvitesClient orgId={orgId} />
}

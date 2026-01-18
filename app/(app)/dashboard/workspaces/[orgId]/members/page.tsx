import MembersClient from './members-client'

export const dynamic = 'force-dynamic'

export default async function MembersPage({
  params,
}: {
  params: Promise<{ orgId: string }>
}) {
  const { orgId } = await params
  return <MembersClient orgId={orgId} />
}

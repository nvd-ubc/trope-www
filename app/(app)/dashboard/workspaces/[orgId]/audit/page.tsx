import AuditClient from './audit-client'

export const dynamic = 'force-dynamic'

export default async function AuditPage({
  params,
}: {
  params: Promise<{ orgId: string }>
}) {
  const { orgId } = await params
  return <AuditClient orgId={orgId} />
}

import ComplianceClient from './compliance-client'

export default async function CompliancePage({ params }: { params: Promise<{ orgId: string }> }) {
  const { orgId } = await params
  return <ComplianceClient orgId={orgId} />
}

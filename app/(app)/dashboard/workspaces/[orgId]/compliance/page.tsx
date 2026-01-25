import ComplianceClient from './compliance-client'

export default function CompliancePage({ params }: { params: { orgId: string } }) {
  return <ComplianceClient orgId={params.orgId} />
}

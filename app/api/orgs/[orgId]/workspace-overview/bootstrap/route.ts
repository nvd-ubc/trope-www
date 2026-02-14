import { NextResponse } from 'next/server'
import {
  applyBootstrapMeta,
  fetchInternalJson,
  firstFailedResult,
} from '@/lib/server/internal-api-bootstrap'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ orgId: string }> }
) {
  const { orgId } = await params
  const encodedOrgId = encodeURIComponent(orgId)

  const [orgResult, workflowsResult, alertsResult] = await Promise.all([
    fetchInternalJson(request, `/api/orgs/${encodedOrgId}`),
    fetchInternalJson(request, `/api/orgs/${encodedOrgId}/workflows`),
    fetchInternalJson(request, `/api/orgs/${encodedOrgId}/alerts?status=open`),
  ])

  const failed = firstFailedResult(orgResult, workflowsResult, alertsResult)
  if (failed) {
    const response = NextResponse.json(
      { error: failed.status === 401 ? 'unauthorized' : 'Unable to load workspace bootstrap.' },
      { status: failed.status === 401 ? 401 : failed.status }
    )
    applyBootstrapMeta(response, orgResult, workflowsResult, alertsResult)
    return response
  }

  const response = NextResponse.json({
    org: orgResult.data,
    workflows: workflowsResult.data,
    alerts: alertsResult.data,
  })
  applyBootstrapMeta(response, orgResult, workflowsResult, alertsResult)
  return response
}


import { NextResponse } from 'next/server'
import {
  applyBootstrapMeta,
  fetchInternalJson,
  firstFailedResult,
} from '@/lib/server/internal-api-bootstrap'

type AlertsPayload = {
  alerts?: unknown[]
}

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ orgId: string }> }
) {
  const { orgId } = await params
  const encodedOrgId = encodeURIComponent(orgId)
  const searchParams = new URL(request.url).searchParams
  const status = (searchParams.get('status') ?? '').trim()
  const alertsQuery = new URLSearchParams()
  if (status) {
    alertsQuery.set('status', status)
  }

  const [alertsResult, workflowsResult, meResult, membersResult] = await Promise.all([
    fetchInternalJson<AlertsPayload>(
      request,
      `/api/orgs/${encodedOrgId}/alerts${alertsQuery.toString() ? `?${alertsQuery.toString()}` : ''}`
    ),
    fetchInternalJson(request, `/api/orgs/${encodedOrgId}/workflows`),
    fetchInternalJson(request, '/api/me'),
    fetchInternalJson(request, `/api/orgs/${encodedOrgId}/members`),
  ])

  const failed = firstFailedResult(alertsResult, meResult)
  if (failed) {
    const response = NextResponse.json(
      { error: failed.status === 401 ? 'unauthorized' : 'Unable to load alerts bootstrap.' },
      { status: failed.status === 401 ? 401 : failed.status }
    )
    applyBootstrapMeta(response, alertsResult, workflowsResult, meResult, membersResult)
    return response
  }

  const response = NextResponse.json({
    alerts: alertsResult.data,
    workflows: workflowsResult.ok ? workflowsResult.data : { workflows: [] },
    me: meResult.ok ? meResult.data : null,
    members: membersResult.ok ? membersResult.data : { members: [] },
  })
  applyBootstrapMeta(response, alertsResult, workflowsResult, meResult, membersResult)
  return response
}


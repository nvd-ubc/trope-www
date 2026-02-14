import { NextResponse } from 'next/server'
import {
  applyBootstrapMeta,
  fetchInternalJson,
  firstFailedResult,
  type InternalJsonFetchResult,
} from '@/lib/server/internal-api-bootstrap'

type OrgPayload = {
  membership?: {
    role?: string | null
  } | null
}

type MembersPayload = {
  members?: unknown[]
}

const emptyMembersResult = (): InternalJsonFetchResult<MembersPayload> => ({
  ok: true,
  status: 200,
  data: { members: [] },
  requestId: null,
  serverTiming: null,
})

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ orgId: string; workflowId: string }> }
) {
  const { orgId, workflowId } = await params
  const encodedOrgId = encodeURIComponent(orgId)
  const encodedWorkflowId = encodeURIComponent(workflowId)

  const [detailResult, versionsResult, orgResult, runsResult] = await Promise.all([
    fetchInternalJson(request, `/api/orgs/${encodedOrgId}/workflows/${encodedWorkflowId}`),
    fetchInternalJson(request, `/api/orgs/${encodedOrgId}/workflows/${encodedWorkflowId}/versions`),
    fetchInternalJson(request, `/api/orgs/${encodedOrgId}`),
    fetchInternalJson(
      request,
      `/api/orgs/${encodedOrgId}/workflows/${encodedWorkflowId}/runs?limit=10`
    ),
  ])

  const failed = firstFailedResult(detailResult)
  if (failed) {
    const response = NextResponse.json(
      { error: failed.status === 401 ? 'unauthorized' : 'Unable to load workflow bootstrap.' },
      { status: failed.status === 401 ? 401 : failed.status }
    )
    applyBootstrapMeta(response, detailResult, versionsResult, orgResult, runsResult)
    return response
  }

  const role = ((orgResult.data ?? {}) as OrgPayload).membership?.role ?? null
  const isAdmin = role === 'org_owner' || role === 'org_admin'

  let membersResult = emptyMembersResult()
  if (isAdmin) {
    const fetchedMembers = await fetchInternalJson<MembersPayload>(
      request,
      `/api/orgs/${encodedOrgId}/members`
    )
    if (fetchedMembers.ok) {
      membersResult = fetchedMembers
    }
  }

  const response = NextResponse.json({
    detail: detailResult.data,
    versions: versionsResult.ok ? versionsResult.data : { versions: [] },
    org: orgResult.ok ? orgResult.data : null,
    members: membersResult.data,
    runs: runsResult.ok ? runsResult.data : { runs: [] },
    runsError: runsResult.ok ? null : 'Unable to load runs.',
    runsRequestId: runsResult.ok ? null : runsResult.requestId,
  })
  applyBootstrapMeta(response, detailResult, versionsResult, orgResult, membersResult, runsResult)
  return response
}


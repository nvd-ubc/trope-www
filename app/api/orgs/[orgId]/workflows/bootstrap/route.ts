import { NextResponse } from 'next/server'
import {
  applyBootstrapMeta,
  fetchInternalJson,
  firstFailedResult,
  type InternalJsonFetchResult,
} from '@/lib/server/internal-api-bootstrap'

type WorkflowSummary = {
  workflow_id: string
}

type WorkflowListPayload = {
  workflows?: WorkflowSummary[]
}

type OrgPayload = {
  membership?: {
    role?: string | null
  } | null
}

type WorkflowDetailPayload = {
  latest_version?: unknown
}

const emptyResult = (): InternalJsonFetchResult<{ members: unknown[] }> => ({
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
  { params }: { params: Promise<{ orgId: string }> }
) {
  const { orgId } = await params
  const encodedOrgId = encodeURIComponent(orgId)

  const [workflowsResult, orgResult] = await Promise.all([
    fetchInternalJson(request, `/api/orgs/${encodedOrgId}/workflows`),
    fetchInternalJson(request, `/api/orgs/${encodedOrgId}`),
  ])

  const baseFailure = firstFailedResult(workflowsResult, orgResult)
  if (baseFailure) {
    const response = NextResponse.json(
      { error: baseFailure.status === 401 ? 'unauthorized' : 'Unable to load workflows bootstrap.' },
      { status: baseFailure.status === 401 ? 401 : baseFailure.status }
    )
    applyBootstrapMeta(response, workflowsResult, orgResult)
    return response
  }

  const orgPayload = (orgResult.data ?? {}) as OrgPayload
  const isAdmin =
    orgPayload.membership?.role === 'org_owner' || orgPayload.membership?.role === 'org_admin'

  let membersResult = emptyResult()
  if (isAdmin) {
    const fetchedMembersResult = await fetchInternalJson<{ members: unknown[] }>(
      request,
      `/api/orgs/${encodedOrgId}/members`
    )
    if (fetchedMembersResult.ok) {
      membersResult = fetchedMembersResult
    }
  }

  const workflowsPayload = (workflowsResult.data ?? {}) as WorkflowListPayload
  const workflowList = workflowsPayload.workflows ?? []

  const detailResults = await Promise.all(
    workflowList.map(async (workflow) => {
      const detailResult = await fetchInternalJson<WorkflowDetailPayload>(
        request,
        `/api/orgs/${encodedOrgId}/workflows/${encodeURIComponent(workflow.workflow_id)}`
      )
      return {
        workflowId: workflow.workflow_id,
        latest: detailResult.ok ? detailResult.data?.latest_version ?? null : null,
      }
    })
  )

  const latestVersions: Record<string, unknown> = {}
  for (const detail of detailResults) {
    latestVersions[detail.workflowId] = detail.latest
  }

  const response = NextResponse.json({
    workflows: workflowsResult.data,
    org: orgResult.data,
    members: membersResult.data,
    latestVersions,
  })
  applyBootstrapMeta(response, workflowsResult, orgResult, membersResult)
  return response
}

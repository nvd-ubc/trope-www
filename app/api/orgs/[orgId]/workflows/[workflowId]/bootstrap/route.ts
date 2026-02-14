import { NextResponse } from 'next/server'
import {
  applyBootstrapMeta,
  fetchInternalJson,
  firstFailedResult,
  type InternalJsonFetchResult,
} from '@/lib/server/internal-api-bootstrap'

type MembershipPayload = {
  membership?: {
    role?: string | null
  } | null
}

type WorkflowVersionPayload = {
  version_id?: string | null
  [key: string]: unknown
}

type WorkflowSummaryPayload = {
  membership?: MembershipPayload['membership']
  workflow?: Record<string, unknown> | null
  versions?: WorkflowVersionPayload[] | null
  recent_runs?: unknown[] | null
  next_runs_cursor?: string | null
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

  const summaryResult = await fetchInternalJson<WorkflowSummaryPayload>(
    request,
    `/api/orgs/${encodedOrgId}/workflow-summary/${encodedWorkflowId}`,
    { timeoutMs: 1200 }
  )

  const failed = firstFailedResult(summaryResult)
  if (failed) {
    const response = NextResponse.json(
      { error: failed.status === 401 ? 'unauthorized' : 'Unable to load workflow bootstrap.' },
      { status: failed.status === 401 ? 401 : failed.status }
    )
    applyBootstrapMeta(response, summaryResult)
    return response
  }

  const summary = (summaryResult.data ?? {}) as WorkflowSummaryPayload
  const workflow = summary.workflow
  if (!workflow || typeof workflow !== 'object') {
    const response = NextResponse.json(
      { error: 'Unable to load workflow bootstrap.' },
      { status: 502 }
    )
    applyBootstrapMeta(response, summaryResult)
    return response
  }

  const versions = Array.isArray(summary.versions) ? summary.versions : []
  const latestVersionId =
    typeof workflow.latest_version_id === 'string' && workflow.latest_version_id.trim().length > 0
      ? workflow.latest_version_id
      : null
  const latestVersion =
    versions.find(
      (version) => typeof version.version_id === 'string' && version.version_id === latestVersionId
    ) ?? versions[0] ?? null

  const role = summary.membership?.role ?? null
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
    detail: {
      workflow,
      latest_version: latestVersion,
    },
    versions: { versions },
    org: {
      membership: summary.membership ?? null,
    },
    members: membersResult.data,
    runs: {
      runs: Array.isArray(summary.recent_runs) ? summary.recent_runs : [],
      next_cursor: summary.next_runs_cursor ?? null,
    },
    runsError: null,
    runsRequestId: null,
  })
  applyBootstrapMeta(response, summaryResult, membersResult)
  return response
}

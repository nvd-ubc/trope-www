import { NextResponse } from 'next/server'
import {
  applyBootstrapMeta,
  fetchInternalJson,
  firstFailedResult,
} from '@/lib/server/internal-api-bootstrap'

type ResolvePayload = {
  org_id?: string | null
}

type WorkflowPayload = {
  latest_version?: {
    version_id?: string | null
  } | null
}

type VersionsPayload = {
  versions?: Array<{
    version_id: string
    created_at: string
  }>
}

type OrgPayload = {
  membership?: {
    role?: string | null
  } | null
}

type VersionDetailPayload = {
  version?: unknown
}

const sortVersionsByDate = (versions: Array<{ version_id: string; created_at: string }>) =>
  [...versions].sort((a, b) => {
    const aTime = new Date(a.created_at).getTime()
    const bTime = new Date(b.created_at).getTime()
    return bTime - aTime
  })

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ workflowId: string }> }
) {
  const { workflowId } = await params
  const encodedWorkflowId = encodeURIComponent(workflowId)
  const searchParams = new URL(request.url).searchParams
  const requestedVersionId = (searchParams.get('versionId') ?? '').trim()

  const resolveResult = await fetchInternalJson<ResolvePayload>(
    request,
    `/api/workflows/${encodedWorkflowId}/resolve`
  )
  const resolveFailure = firstFailedResult(resolveResult)
  if (resolveFailure || !resolveResult.data?.org_id) {
    const response = NextResponse.json(
      {
        error:
          resolveFailure?.status === 401
            ? 'unauthorized'
            : 'Workflow not found or you do not have access.',
      },
      { status: resolveFailure?.status ?? 404 }
    )
    applyBootstrapMeta(response, resolveResult)
    return response
  }

  const orgId = resolveResult.data.org_id
  const encodedOrgId = encodeURIComponent(orgId)

  const [workflowResult, versionsResult, orgResult] = await Promise.all([
    fetchInternalJson<WorkflowPayload>(
      request,
      `/api/orgs/${encodedOrgId}/workflows/${encodedWorkflowId}`
    ),
    fetchInternalJson<VersionsPayload>(
      request,
      `/api/orgs/${encodedOrgId}/workflows/${encodedWorkflowId}/versions`
    ),
    fetchInternalJson<OrgPayload>(request, `/api/orgs/${encodedOrgId}`),
  ])

  const baseFailure = firstFailedResult(workflowResult, versionsResult)
  if (baseFailure) {
    const response = NextResponse.json(
      { error: baseFailure.status === 401 ? 'unauthorized' : 'Unable to load workflow guide bootstrap.' },
      { status: baseFailure.status === 401 ? 401 : baseFailure.status }
    )
    applyBootstrapMeta(response, resolveResult, workflowResult, versionsResult, orgResult)
    return response
  }

  const sortedVersions = sortVersionsByDate(versionsResult.data?.versions ?? [])
  const selectedVersionId =
    (requestedVersionId && sortedVersions.some((version) => version.version_id === requestedVersionId)
      ? requestedVersionId
      : null) ||
    workflowResult.data?.latest_version?.version_id ||
    sortedVersions[0]?.version_id ||
    null

  let specResult: Awaited<ReturnType<typeof fetchInternalJson>> | null = null
  let versionDetailResult: Awaited<ReturnType<typeof fetchInternalJson<VersionDetailPayload>>> | null = null
  if (selectedVersionId) {
    const encodedVersionId = encodeURIComponent(selectedVersionId)
    const [guideSpecResponse, versionResponse] = await Promise.all([
      fetchInternalJson(
        request,
        `/api/orgs/${encodedOrgId}/workflows/${encodedWorkflowId}/versions/${encodedVersionId}/guide-spec`,
        { timeoutMs: 1500 }
      ),
      fetchInternalJson<VersionDetailPayload>(
        request,
        `/api/orgs/${encodedOrgId}/workflows/${encodedWorkflowId}/versions/${encodedVersionId}`,
        { timeoutMs: 1500 }
      ),
    ])
    specResult = guideSpecResponse
    versionDetailResult = versionResponse
  }

  const specError = (() => {
    if (!specResult) return null
    if (specResult.ok && versionDetailResult?.ok !== false) return null
    if (specResult.timedOut || versionDetailResult?.timedOut) {
      return 'Guide preview is taking longer than expected.'
    }
    if (versionDetailResult && !versionDetailResult.ok) {
      return 'Version detail is unavailable for this release.'
    }
    return 'Guide spec is not available for this version.'
  })()

  const response = NextResponse.json({
    orgId,
    workflow: workflowResult.data,
    versions: sortedVersions,
    membershipRole: orgResult.ok ? orgResult.data?.membership?.role ?? null : null,
    selectedVersionId,
    spec: specResult?.ok ? specResult.data : null,
    versionDetail: versionDetailResult?.ok ? versionDetailResult.data?.version ?? null : null,
    specError,
  })
  applyBootstrapMeta(
    response,
    resolveResult,
    workflowResult,
    versionsResult,
    orgResult,
    ...(specResult ? [specResult] : []),
    ...(versionDetailResult ? [versionDetailResult] : [])
  )
  return response
}

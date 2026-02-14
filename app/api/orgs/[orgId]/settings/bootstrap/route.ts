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
  { params }: { params: Promise<{ orgId: string }> }
) {
  const { orgId } = await params
  const encodedOrgId = encodeURIComponent(orgId)

  const orgResult = await fetchInternalJson<OrgPayload>(request, `/api/orgs/${encodedOrgId}`)
  const baseFailure = firstFailedResult(orgResult)
  if (baseFailure) {
    const response = NextResponse.json(
      { error: baseFailure.status === 401 ? 'unauthorized' : 'Unable to load settings bootstrap.' },
      { status: baseFailure.status === 401 ? 401 : baseFailure.status }
    )
    applyBootstrapMeta(response, orgResult)
    return response
  }

  const role = orgResult.data?.membership?.role ?? null
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
    org: orgResult.data,
    members: membersResult.data,
  })
  applyBootstrapMeta(response, orgResult, membersResult)
  return response
}


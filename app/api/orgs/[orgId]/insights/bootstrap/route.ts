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
  const url = new URL(request.url)
  const query = url.searchParams.toString()
  const suffix = query ? `?${query}` : ''

  const [teamResult, myResult] = await Promise.all([
    fetchInternalJson(request, `/api/orgs/${encodedOrgId}/insights${suffix}`),
    fetchInternalJson(request, `/api/orgs/${encodedOrgId}/insights/me${suffix}`),
  ])

  const failed = firstFailedResult(teamResult, myResult)
  if (failed) {
    const response = NextResponse.json(
      { error: failed.status === 401 ? 'unauthorized' : 'Unable to load insights bootstrap.' },
      { status: failed.status === 401 ? 401 : failed.status }
    )
    applyBootstrapMeta(response, teamResult, myResult)
    return response
  }

  const response = NextResponse.json({
    teamInsights: teamResult.data,
    myInsights: myResult.data,
  })
  applyBootstrapMeta(response, teamResult, myResult)
  return response
}

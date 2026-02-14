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

  const [membersResult, meResult] = await Promise.all([
    fetchInternalJson(request, `/api/orgs/${encodedOrgId}/members`),
    fetchInternalJson(request, '/api/me'),
  ])

  const failed = firstFailedResult(membersResult, meResult)
  if (failed) {
    const response = NextResponse.json(
      { error: failed.status === 401 ? 'unauthorized' : 'Unable to load members bootstrap.' },
      { status: failed.status === 401 ? 401 : failed.status }
    )
    applyBootstrapMeta(response, membersResult, meResult)
    return response
  }

  const response = NextResponse.json({
    members: membersResult.data,
    me: meResult.data,
  })
  applyBootstrapMeta(response, membersResult, meResult)
  return response
}


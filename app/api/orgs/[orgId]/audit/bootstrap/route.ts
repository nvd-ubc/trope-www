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
  const searchParams = new URL(request.url).searchParams
  const query = new URLSearchParams()
  query.set('limit', searchParams.get('limit') ?? '25')
  const cursor = (searchParams.get('cursor') ?? '').trim()
  if (cursor) {
    query.set('cursor', cursor)
  }

  const [auditResult, membersResult] = await Promise.all([
    fetchInternalJson(request, `/api/orgs/${encodedOrgId}/audit?${query.toString()}`),
    fetchInternalJson(request, `/api/orgs/${encodedOrgId}/members`),
  ])

  const failed = firstFailedResult(auditResult)
  if (failed) {
    const response = NextResponse.json(
      {
        error:
          failed.status === 401
            ? 'unauthorized'
            : failed.status === 403
              ? 'forbidden'
              : 'Unable to load audit bootstrap.',
      },
      { status: failed.status }
    )
    applyBootstrapMeta(response, auditResult, membersResult)
    return response
  }

  const response = NextResponse.json({
    audit: auditResult.data,
    members: membersResult.ok ? membersResult.data : { members: [] },
  })
  applyBootstrapMeta(response, auditResult, membersResult)
  return response
}


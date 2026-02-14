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

  const teammatesResult = await fetchInternalJson(request, `/api/orgs/${encodedOrgId}/teammates`)

  const failed = firstFailedResult(teammatesResult)
  if (failed) {
    const response = NextResponse.json(
      { error: failed.status === 401 ? 'unauthorized' : 'Unable to load teammates bootstrap.' },
      { status: failed.status === 401 ? 401 : failed.status }
    )
    applyBootstrapMeta(response, teammatesResult)
    return response
  }

  const response = NextResponse.json({
    teammates: teammatesResult.data,
  })
  applyBootstrapMeta(response, teammatesResult)
  return response
}

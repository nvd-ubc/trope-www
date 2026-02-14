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

  const summaryResult = await fetchInternalJson(
    request,
    `/api/orgs/${encodedOrgId}/dashboard-summary`
  )

  const failed = firstFailedResult(summaryResult)
  if (failed) {
    const response = NextResponse.json(
      { error: failed.status === 401 ? 'unauthorized' : 'Unable to load workspace bootstrap.' },
      { status: failed.status === 401 ? 401 : failed.status }
    )
    applyBootstrapMeta(response, summaryResult)
    return response
  }

  const response = NextResponse.json({
    summary: summaryResult.data,
  })
  applyBootstrapMeta(response, summaryResult)
  return response
}

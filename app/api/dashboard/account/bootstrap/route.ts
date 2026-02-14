import { NextResponse } from 'next/server'
import {
  applyBootstrapMeta,
  fetchInternalJson,
  firstFailedResult,
} from '@/lib/server/internal-api-bootstrap'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type DashboardSummaryPayload = {
  me?: unknown
  orgs?: unknown
}

export async function GET(request: Request) {
  const summaryResult = await fetchInternalJson<DashboardSummaryPayload>(request, '/api/dashboard/summary')

  const failed = firstFailedResult(summaryResult)
  if (failed) {
    const response = NextResponse.json(
      { error: failed.status === 401 ? 'unauthorized' : 'Unable to load account bootstrap.' },
      { status: failed.status === 401 ? 401 : failed.status }
    )
    applyBootstrapMeta(response, summaryResult)
    return response
  }

  const summary = (summaryResult.data ?? {}) as DashboardSummaryPayload
  const response = NextResponse.json({
    me: summary.me ?? null,
    orgs: summary.orgs ?? null,
  })
  applyBootstrapMeta(response, summaryResult)
  return response
}

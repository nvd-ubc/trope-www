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
  usage?: unknown
  orgs?: unknown
  invites?: unknown
}

export async function GET(request: Request) {
  const summaryResult = await fetchInternalJson<DashboardSummaryPayload>(request, '/api/dashboard/summary')

  const failed = firstFailedResult(summaryResult)
  if (failed) {
    const response = NextResponse.json(
      { error: failed.status === 401 ? 'unauthorized' : 'Unable to load dashboard bootstrap.' },
      { status: failed.status === 401 ? 401 : failed.status }
    )
    applyBootstrapMeta(response, summaryResult)
    return response
  }

  const summary = (summaryResult.data ?? {}) as DashboardSummaryPayload
  const invites = Array.isArray(summary.invites) ? summary.invites : []
  const response = NextResponse.json({
    me: summary.me ?? null,
    usage: summary.usage ?? null,
    orgs: summary.orgs ?? { orgs: [] },
    invites,
  })
  applyBootstrapMeta(response, summaryResult)
  return response
}

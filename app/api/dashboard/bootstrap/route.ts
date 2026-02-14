import { NextResponse } from 'next/server'
import {
  applyBootstrapMeta,
  fetchInternalJson,
  firstFailedResult,
} from '@/lib/server/internal-api-bootstrap'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const [meResult, usageResult, orgsResult, invitesResult] = await Promise.all([
    fetchInternalJson(request, '/api/me'),
    fetchInternalJson(request, '/api/usage'),
    fetchInternalJson(request, '/api/orgs'),
    fetchInternalJson(request, '/api/me/invites'),
  ])

  const failed = firstFailedResult(meResult, usageResult, orgsResult, invitesResult)
  if (failed) {
    const response = NextResponse.json(
      { error: failed.status === 401 ? 'unauthorized' : 'Unable to load dashboard bootstrap.' },
      { status: failed.status === 401 ? 401 : failed.status }
    )
    applyBootstrapMeta(response, meResult, usageResult, orgsResult, invitesResult)
    return response
  }

  const invitesPayload = (invitesResult.data ?? {}) as { invites?: unknown[] }
  const response = NextResponse.json({
    me: meResult.data,
    usage: usageResult.data,
    orgs: orgsResult.data,
    invites: invitesPayload.invites ?? [],
  })
  applyBootstrapMeta(response, meResult, usageResult, orgsResult, invitesResult)
  return response
}


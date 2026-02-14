import { NextResponse } from 'next/server'
import {
  applyBootstrapMeta,
  fetchInternalJson,
  firstFailedResult,
} from '@/lib/server/internal-api-bootstrap'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const [meResult, orgsResult] = await Promise.all([
    fetchInternalJson(request, '/api/me'),
    fetchInternalJson(request, '/api/orgs'),
  ])

  const failed = firstFailedResult(meResult, orgsResult)
  if (failed) {
    const response = NextResponse.json(
      { error: failed.status === 401 ? 'unauthorized' : 'Unable to load account bootstrap.' },
      { status: failed.status === 401 ? 401 : failed.status }
    )
    applyBootstrapMeta(response, meResult, orgsResult)
    return response
  }

  const response = NextResponse.json({
    me: meResult.data,
    orgs: orgsResult.data,
  })
  applyBootstrapMeta(response, meResult, orgsResult)
  return response
}


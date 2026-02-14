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

  const [homeResult, notificationsResult] = await Promise.all([
    fetchInternalJson(request, `/api/orgs/${encodedOrgId}/home`),
    fetchInternalJson(request, '/api/me/notifications?status=unread&limit=10'),
  ])

  const failed = firstFailedResult(homeResult, notificationsResult)
  if (failed) {
    const response = NextResponse.json(
      { error: failed.status === 401 ? 'unauthorized' : 'Unable to load home bootstrap.' },
      { status: failed.status === 401 ? 401 : failed.status }
    )
    applyBootstrapMeta(response, homeResult, notificationsResult)
    return response
  }

  const response = NextResponse.json({
    home: homeResult.data,
    notifications: notificationsResult.data,
  })
  applyBootstrapMeta(response, homeResult, notificationsResult)
  return response
}

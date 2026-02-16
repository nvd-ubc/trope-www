import { NextResponse } from 'next/server'
import {
  applyBootstrapMeta,
  fetchInternalJson,
  mergeCookieHeader,
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

  const homeResult = await fetchInternalJson(request, `/api/orgs/${encodedOrgId}/home`, {
    timeoutMs: 10_000,
  })

  const failed = firstFailedResult(homeResult)
  if (failed) {
    const response = NextResponse.json(
      { error: failed.status === 401 ? 'unauthorized' : 'Unable to load home bootstrap.' },
      { status: failed.status === 401 ? 401 : failed.status }
    )
    applyBootstrapMeta(response, homeResult)
    return response
  }

  const notificationsPath = '/api/me/notifications?status=unread&limit=10'
  const refreshedCookieHeader = mergeCookieHeader(
    request.headers.get('cookie'),
    homeResult.setCookies
  )

  let notificationsResult = await fetchInternalJson(request, notificationsPath, {
    timeoutMs: 8_000,
    cookieHeader: refreshedCookieHeader,
  })

  if (!notificationsResult.ok) {
    notificationsResult = await fetchInternalJson(request, notificationsPath, {
      timeoutMs: 8_000,
      cookieHeader: refreshedCookieHeader,
    })
  }

  if (!notificationsResult.ok) {
    console.warn('home.bootstrap.notifications_failed', {
      orgId,
      status: notificationsResult.status,
      requestId: notificationsResult.requestId,
      timedOut: notificationsResult.timedOut ?? false,
      error: notificationsResult.error ?? null,
    })
  }

  const response = NextResponse.json({
    home: homeResult.data,
    notifications: notificationsResult.ok ? notificationsResult.data : { notifications: [] },
  })
  applyBootstrapMeta(response, homeResult, notificationsResult)
  return response
}

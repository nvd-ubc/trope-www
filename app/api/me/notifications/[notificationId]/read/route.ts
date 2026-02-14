import { proxyBackendRequest } from '@/lib/server/backend'
import { csrfErrorResponse, validateCsrf } from '@/lib/server/csrf'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(
  request: Request,
  context: { params: Promise<{ notificationId: string }> }
) {
  const csrfFailure = await validateCsrf(request)
  if (csrfFailure) {
    return csrfErrorResponse(csrfFailure)
  }

  const { notificationId } = await context.params

  return proxyBackendRequest(`/v1/me/notifications/${encodeURIComponent(notificationId)}/read`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({}),
  })
}

import { proxyBackendRequest } from '@/lib/server/backend'
import { csrfErrorResponse, validateCsrf } from '@/lib/server/csrf'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(
  request: Request,
  context: { params: Promise<{ orgId: string; alertId: string }> }
) {
  const csrfFailure = await validateCsrf(request)
  if (csrfFailure) {
    return csrfErrorResponse(csrfFailure)
  }

  const { orgId, alertId } = await context.params
  let payload: unknown
  try {
    payload = await request.json()
  } catch {
    payload = {}
  }

  return proxyBackendRequest(
    `/v1/orgs/${encodeURIComponent(orgId)}/alerts/${encodeURIComponent(alertId)}`,
    {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload ?? {}),
    }
  )
}

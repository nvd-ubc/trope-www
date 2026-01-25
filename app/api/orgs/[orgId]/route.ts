import { proxyBackendRequest } from '@/lib/server/backend'
import { csrfErrorResponse, validateCsrf } from '@/lib/server/csrf'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(
  _request: Request,
  context: { params: Promise<{ orgId: string }> }
) {
  const { orgId } = await context.params
  return proxyBackendRequest(`/v1/orgs/${encodeURIComponent(orgId)}`)
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ orgId: string }> }
) {
  const csrfFailure = await validateCsrf(request)
  if (csrfFailure) {
    return csrfErrorResponse(csrfFailure)
  }

  let payload: unknown
  try {
    payload = await request.json()
  } catch {
    payload = {}
  }

  const { orgId } = await context.params
  return proxyBackendRequest(`/v1/orgs/${encodeURIComponent(orgId)}`, {
    method: 'PATCH',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload ?? {}),
  })
}

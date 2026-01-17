import { proxyBackendRequest } from '@/lib/server/backend'
import { csrfErrorResponse, validateCsrf } from '@/lib/server/csrf'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(
  request: Request,
  context: { params: Promise<{ orgId: string }> }
) {
  const { orgId } = await context.params
  const url = new URL(request.url)
  const query = url.searchParams.toString()
  const path = `/v1/orgs/${encodeURIComponent(orgId)}/invites${query ? `?${query}` : ''}`
  return proxyBackendRequest(path)
}

export async function POST(
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
  return proxyBackendRequest(`/v1/orgs/${encodeURIComponent(orgId)}/invites`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload ?? {}),
  })
}

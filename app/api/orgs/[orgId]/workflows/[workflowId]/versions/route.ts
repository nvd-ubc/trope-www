import { proxyBackendRequest } from '@/lib/server/backend'
import { csrfErrorResponse, validateCsrf } from '@/lib/server/csrf'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(
  _request: Request,
  context: { params: Promise<{ orgId: string; workflowId: string }> }
) {
  const { orgId, workflowId } = await context.params
  return proxyBackendRequest(
    `/v1/orgs/${encodeURIComponent(orgId)}/workflows/${encodeURIComponent(workflowId)}/versions`
  )
}

export async function POST(
  request: Request,
  context: { params: Promise<{ orgId: string; workflowId: string }> }
) {
  const csrfFailure = await validateCsrf(request)
  if (csrfFailure) {
    return csrfErrorResponse(csrfFailure)
  }

  const { orgId, workflowId } = await context.params

  let payload: unknown
  try {
    payload = await request.json()
  } catch {
    payload = {}
  }

  return proxyBackendRequest(
    `/v1/orgs/${encodeURIComponent(orgId)}/workflows/${encodeURIComponent(workflowId)}/versions`,
    {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload ?? {}),
    }
  )
}

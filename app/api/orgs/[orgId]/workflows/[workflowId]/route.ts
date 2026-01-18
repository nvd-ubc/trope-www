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
    `/v1/orgs/${encodeURIComponent(orgId)}/workflows/${encodeURIComponent(workflowId)}`
  )
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ orgId: string; workflowId: string }> }
) {
  const csrfFailure = await validateCsrf(request)
  if (csrfFailure) {
    return csrfErrorResponse(csrfFailure)
  }

  const { orgId, workflowId } = await context.params
  return proxyBackendRequest(
    `/v1/orgs/${encodeURIComponent(orgId)}/workflows/${encodeURIComponent(workflowId)}`,
    { method: 'DELETE' }
  )
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ orgId: string; workflowId: string }> }
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

  const { orgId, workflowId } = await context.params
  return proxyBackendRequest(
    `/v1/orgs/${encodeURIComponent(orgId)}/workflows/${encodeURIComponent(workflowId)}`,
    {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload ?? {}),
    }
  )
}

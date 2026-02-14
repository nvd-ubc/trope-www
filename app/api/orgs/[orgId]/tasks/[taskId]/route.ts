import { proxyBackendRequest } from '@/lib/server/backend'
import { csrfErrorResponse, validateCsrf } from '@/lib/server/csrf'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function PATCH(
  request: Request,
  context: { params: Promise<{ orgId: string; taskId: string }> }
) {
  const csrfFailure = await validateCsrf(request)
  if (csrfFailure) {
    return csrfErrorResponse(csrfFailure)
  }

  const { orgId, taskId } = await context.params

  let payload: unknown
  try {
    payload = await request.json()
  } catch {
    payload = {}
  }

  return proxyBackendRequest(
    `/v1/orgs/${encodeURIComponent(orgId)}/tasks/${encodeURIComponent(taskId)}`,
    {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload ?? {}),
    }
  )
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ orgId: string; taskId: string }> }
) {
  const csrfFailure = await validateCsrf(request)
  if (csrfFailure) {
    return csrfErrorResponse(csrfFailure)
  }

  const { orgId, taskId } = await context.params

  return proxyBackendRequest(
    `/v1/orgs/${encodeURIComponent(orgId)}/tasks/${encodeURIComponent(taskId)}`,
    {
      method: 'DELETE',
    }
  )
}

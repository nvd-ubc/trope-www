import { proxyBackendRequest } from '@/lib/server/backend'
import { csrfErrorResponse, validateCsrf } from '@/lib/server/csrf'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ orgId: string; docId: string }> }
) {
  const csrfFailure = await validateCsrf(request)
  if (csrfFailure) {
    return csrfErrorResponse(csrfFailure)
  }

  const { orgId, docId } = await params
  return proxyBackendRequest(`/v1/orgs/${encodeURIComponent(orgId)}/docs/${encodeURIComponent(docId)}/saved`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: '{}',
  })
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ orgId: string; docId: string }> }
) {
  const csrfFailure = await validateCsrf(request)
  if (csrfFailure) {
    return csrfErrorResponse(csrfFailure)
  }

  const { orgId, docId } = await params
  return proxyBackendRequest(`/v1/orgs/${encodeURIComponent(orgId)}/docs/${encodeURIComponent(docId)}/saved`, {
    method: 'DELETE',
  })
}

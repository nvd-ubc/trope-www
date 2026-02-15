import { proxyBackendRequest } from '@/lib/server/backend'
import { csrfErrorResponse, validateCsrf } from '@/lib/server/csrf'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ orgId: string; collectionId: string }> }
) {
  const { orgId, collectionId } = await params
  const url = new URL(request.url)
  const query = url.searchParams.toString()
  const suffix = query ? `?${query}` : ''
  return proxyBackendRequest(
    `/v1/orgs/${encodeURIComponent(orgId)}/collections/${encodeURIComponent(collectionId)}/items${suffix}`
  )
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ orgId: string; collectionId: string }> }
) {
  const csrfFailure = await validateCsrf(request)
  if (csrfFailure) {
    return csrfErrorResponse(csrfFailure)
  }

  const { orgId, collectionId } = await params
  let payload: unknown
  try {
    payload = await request.json()
  } catch {
    payload = {}
  }

  return proxyBackendRequest(
    `/v1/orgs/${encodeURIComponent(orgId)}/collections/${encodeURIComponent(collectionId)}/items`,
    {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload ?? {}),
    }
  )
}

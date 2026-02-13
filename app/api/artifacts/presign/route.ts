import { proxyBackendRequest } from '@/lib/server/backend'
import { csrfErrorResponse, validateCsrf } from '@/lib/server/csrf'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type PresignPayload = {
  org_id?: string
  artifacts?: Array<{
    name?: string
    filename?: string
    content_type?: string
  }>
}

export async function POST(request: Request) {
  const csrfFailure = await validateCsrf(request)
  if (csrfFailure) {
    return csrfErrorResponse(csrfFailure)
  }

  let payload: PresignPayload = {}
  try {
    payload = (await request.json()) as PresignPayload
  } catch {
    payload = {}
  }

  const orgId = (payload.org_id ?? '').trim()
  if (!orgId) {
    return Response.json(
      { error: 'missing_org_id', message: 'org_id is required.' },
      { status: 400 }
    )
  }

  const artifacts = Array.isArray(payload.artifacts) ? payload.artifacts : []
  if (artifacts.length === 0) {
    return Response.json(
      { error: 'missing_artifacts', message: 'artifacts list is required.' },
      { status: 400 }
    )
  }

  return proxyBackendRequest('/v1/artifacts/presign', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-trope-org': orgId,
    },
    body: JSON.stringify({ artifacts }),
  })
}

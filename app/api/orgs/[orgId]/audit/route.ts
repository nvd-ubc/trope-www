import { proxyBackendRequest } from '@/lib/server/backend'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(
  request: Request,
  context: { params: Promise<{ orgId: string }> }
) {
  const { orgId } = await context.params
  const url = new URL(request.url)
  const query = url.searchParams.toString()
  const path = `/v1/orgs/${encodeURIComponent(orgId)}/audit${query ? `?${query}` : ''}`
  return proxyBackendRequest(path)
}

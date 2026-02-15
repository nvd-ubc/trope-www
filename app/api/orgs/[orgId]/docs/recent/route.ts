import { proxyBackendRequest } from '@/lib/server/backend'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(
  _request: Request,
  context: { params: Promise<{ orgId: string }> }
) {
  const { orgId } = await context.params
  return proxyBackendRequest(`/v1/orgs/${encodeURIComponent(orgId)}/docs/recent`)
}

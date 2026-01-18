import { proxyBackendRequest } from '@/lib/server/backend'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(
  request: Request,
  context: { params: Promise<{ orgId: string; workflowId: string }> }
) {
  const { orgId, workflowId } = await context.params
  const url = new URL(request.url)
  const query = url.searchParams.toString()
  const suffix = query ? `?${query}` : ''
  return proxyBackendRequest(
    `/v1/orgs/${encodeURIComponent(orgId)}/workflows/${encodeURIComponent(
      workflowId
    )}/runs${suffix}`
  )
}

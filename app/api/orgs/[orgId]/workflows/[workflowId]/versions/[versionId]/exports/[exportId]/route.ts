import { proxyBackendRequest } from '@/lib/server/backend'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(
  _request: Request,
  context: { params: Promise<{ orgId: string; workflowId: string; versionId: string; exportId: string }> }
) {
  const { orgId, workflowId, versionId, exportId } = await context.params
  return proxyBackendRequest(
    `/v1/orgs/${encodeURIComponent(orgId)}/workflows/${encodeURIComponent(
      workflowId
    )}/versions/${encodeURIComponent(versionId)}/exports/${encodeURIComponent(exportId)}`
  )
}

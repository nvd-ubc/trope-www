import { NextResponse } from 'next/server'
import {
  applyBootstrapMeta,
  fetchInternalJson,
  firstFailedResult,
} from '@/lib/server/internal-api-bootstrap'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ orgId: string }> }
) {
  const { orgId } = await params
  const encodedOrgId = encodeURIComponent(orgId)
  const searchParams = new URL(request.url).searchParams

  const runQuery = new URLSearchParams()
  runQuery.set('limit', searchParams.get('limit') ?? '25')
  const workflowId = (searchParams.get('workflow_id') ?? '').trim()
  const cursor = (searchParams.get('cursor') ?? '').trim()
  if (workflowId) {
    runQuery.set('workflow_id', workflowId)
  }
  if (cursor) {
    runQuery.set('cursor', cursor)
  }

  const [runsResult, workflowsResult] = await Promise.all([
    fetchInternalJson(request, `/api/orgs/${encodedOrgId}/runs?${runQuery.toString()}`),
    fetchInternalJson(request, `/api/orgs/${encodedOrgId}/workflows`),
  ])

  const failed = firstFailedResult(runsResult, workflowsResult)
  if (failed) {
    const response = NextResponse.json(
      { error: failed.status === 401 ? 'unauthorized' : 'Unable to load runs bootstrap.' },
      { status: failed.status === 401 ? 401 : failed.status }
    )
    applyBootstrapMeta(response, runsResult, workflowsResult)
    return response
  }

  const response = NextResponse.json({
    runs: runsResult.data,
    workflows: workflowsResult.data,
  })
  applyBootstrapMeta(response, runsResult, workflowsResult)
  return response
}


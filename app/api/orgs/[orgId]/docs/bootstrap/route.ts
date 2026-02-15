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

  const [libraryResult, tasksResult] = await Promise.all([
    fetchInternalJson(request, `/api/orgs/${encodedOrgId}/docs/library`),
    fetchInternalJson(request, `/api/orgs/${encodedOrgId}/tasks/assigned-to-me?status=open`),
  ])

  const failed = firstFailedResult(libraryResult, tasksResult)
  if (failed) {
    const response = NextResponse.json(
      { error: failed.status === 401 ? 'unauthorized' : 'Unable to load docs bootstrap.' },
      { status: failed.status === 401 ? 401 : failed.status }
    )
    applyBootstrapMeta(response, libraryResult, tasksResult)
    return response
  }

  const response = NextResponse.json({
    library: libraryResult.data,
    myAssignments: tasksResult.data,
  })
  applyBootstrapMeta(response, libraryResult, tasksResult)
  return response
}

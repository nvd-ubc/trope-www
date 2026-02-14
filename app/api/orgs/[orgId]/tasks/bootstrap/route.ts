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

  const [tasksResult, myAssignmentsResult, teammatesResult] = await Promise.all([
    fetchInternalJson(request, `/api/orgs/${encodedOrgId}/tasks`),
    fetchInternalJson(request, `/api/orgs/${encodedOrgId}/tasks/assigned-to-me`),
    fetchInternalJson(request, `/api/orgs/${encodedOrgId}/teammates`),
  ])

  const failed = firstFailedResult(tasksResult, myAssignmentsResult, teammatesResult)
  if (failed) {
    const response = NextResponse.json(
      { error: failed.status === 401 ? 'unauthorized' : 'Unable to load tasks bootstrap.' },
      { status: failed.status === 401 ? 401 : failed.status }
    )
    applyBootstrapMeta(response, tasksResult, myAssignmentsResult, teammatesResult)
    return response
  }

  const response = NextResponse.json({
    tasks: tasksResult.data,
    myAssignments: myAssignmentsResult.data,
    teammates: teammatesResult.data,
  })
  applyBootstrapMeta(response, tasksResult, myAssignmentsResult, teammatesResult)
  return response
}

import { NextResponse } from 'next/server'
import { publicBackendRequest } from '@/lib/server/backend'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const orgId = url.searchParams.get('org_id')?.trim() ?? ''
  const inviteId = url.searchParams.get('invite_id')?.trim() ?? ''

  if (!orgId || !inviteId) {
    return NextResponse.json({ error: 'missing_params' }, { status: 400 })
  }

  return publicBackendRequest(
    `/v1/orgs/${encodeURIComponent(orgId)}/invites/${encodeURIComponent(inviteId)}`
  )
}

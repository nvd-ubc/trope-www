import { publicBackendRequest } from '@/lib/server/backend'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(
  request: Request,
  context: { params: Promise<{ shareId: string }> }
) {
  const { shareId } = await context.params
  const body = await request.text()
  return publicBackendRequest(`/v1/shares/${encodeURIComponent(shareId)}/events`, {
    method: 'POST',
    body: body || null,
    headers: { 'content-type': 'application/json' },
  })
}

import { publicBackendRequest } from '@/lib/server/backend'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(
  _request: Request,
  context: { params: Promise<{ shareId: string }> }
) {
  const { shareId } = await context.params
  return publicBackendRequest(`/v1/shares/${encodeURIComponent(shareId)}`)
}

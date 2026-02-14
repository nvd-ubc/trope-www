import { proxyBackendRequest } from '@/lib/server/backend'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  return proxyBackendRequest('/v1/dashboard/bootstrap', {
    tokenType: 'id',
    timingLabel: 'dashboard_summary',
  })
}

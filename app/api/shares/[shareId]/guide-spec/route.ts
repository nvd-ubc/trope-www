import { NextResponse } from 'next/server'
import { publicBackendRequest } from '@/lib/server/backend'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(
  _request: Request,
  context: { params: Promise<{ shareId: string }> }
) {
  const { shareId } = await context.params

  const shareResponse = await publicBackendRequest(`/v1/shares/${encodeURIComponent(shareId)}`)
  if (!shareResponse.ok) {
    return shareResponse
  }

  const payload = (await shareResponse.json().catch(() => null)) as any
  const downloadUrl = payload?.version?.guide_spec?.download_url
  if (!downloadUrl) {
    return NextResponse.json(
      { error: 'guide_spec_unavailable', message: 'Guide spec is not available.' },
      { status: 404 }
    )
  }

  const artifactResponse = await fetch(downloadUrl, { cache: 'no-store' })
  if (!artifactResponse.ok) {
    const next = NextResponse.json(
      { error: 'guide_spec_download_failed', message: 'Unable to download guide spec.' },
      { status: 502 }
    )
    const requestId = shareResponse.headers.get('X-Trope-Request-Id')
    if (requestId) {
      next.headers.set('X-Trope-Request-Id', requestId)
    }
    return next
  }

  const headers = new Headers()
  headers.set('cache-control', 'no-store')
  headers.set(
    'content-type',
    artifactResponse.headers.get('content-type') || 'application/json; charset=utf-8'
  )
  const requestId = shareResponse.headers.get('X-Trope-Request-Id')
  if (requestId) {
    headers.set('X-Trope-Request-Id', requestId)
  }

  return new Response(artifactResponse.body ?? null, { status: 200, headers })
}


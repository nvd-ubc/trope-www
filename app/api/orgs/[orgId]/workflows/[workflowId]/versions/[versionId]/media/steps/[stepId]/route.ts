import { NextResponse } from 'next/server'
import { proxyBackendRequest } from '@/lib/server/backend'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(
  _request: Request,
  context: {
    params: Promise<{ orgId: string; workflowId: string; versionId: string; stepId: string }>
  }
) {
  const { orgId, workflowId, versionId, stepId } = await context.params

  const versionResponse = await proxyBackendRequest(
    `/v1/orgs/${encodeURIComponent(orgId)}/workflows/${encodeURIComponent(
      workflowId
    )}/versions/${encodeURIComponent(versionId)}`
  )

  if (!versionResponse.ok) {
    return versionResponse
  }

  const payload = (await versionResponse.json().catch(() => null)) as any
  const images = payload?.version?.guide_media?.step_images
  const match = Array.isArray(images)
    ? images.find((entry: any) => entry?.step_id === stepId)
    : null
  const downloadUrl = match?.download_url
  if (!downloadUrl) {
    return NextResponse.json(
      { error: 'step_image_unavailable', message: 'Step image is not available.' },
      { status: 404 }
    )
  }

  const artifactResponse = await fetch(downloadUrl, { cache: 'no-store' })
  if (!artifactResponse.ok) {
    const next = NextResponse.json(
      { error: 'step_image_download_failed', message: 'Unable to download step image.' },
      { status: 502 }
    )
    const requestId = versionResponse.headers.get('X-Trope-Request-Id')
    if (requestId) {
      next.headers.set('X-Trope-Request-Id', requestId)
    }
    return next
  }

  const headers = new Headers()
  headers.set('cache-control', 'no-store')
  headers.set(
    'content-type',
    artifactResponse.headers.get('content-type') || match?.content_type || 'image/jpeg'
  )
  const requestId = versionResponse.headers.get('X-Trope-Request-Id')
  if (requestId) {
    headers.set('X-Trope-Request-Id', requestId)
  }

  return new Response(artifactResponse.body ?? null, { status: 200, headers })
}


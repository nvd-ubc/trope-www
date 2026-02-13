import { NextResponse } from 'next/server'
import { publicBackendRequest } from '@/lib/server/backend'
import {
  resolveStepImageVariant,
  type GuideMediaStepImage,
  type RequestedGuideMediaVariant,
} from '@/lib/guide-media'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(
  request: Request,
  context: {
    params: Promise<{ shareId: string; stepId: string }>
  }
) {
  const { shareId, stepId } = await context.params
  const url = new URL(request.url)
  const variantParam = (url.searchParams.get('variant') ?? '').toLowerCase()
  const requestedVariant: RequestedGuideMediaVariant =
    variantParam === 'preview' || variantParam === 'full' ? variantParam : 'auto'

  const shareResponse = await publicBackendRequest(`/v1/shares/${encodeURIComponent(shareId)}`)
  if (!shareResponse.ok) {
    return shareResponse
  }

  const payload = (await shareResponse.json().catch(() => null)) as unknown
  const version =
    payload && typeof payload === 'object' && !Array.isArray(payload)
      ? (payload as { version?: unknown }).version
      : null
  const guideMedia =
    version && typeof version === 'object' && !Array.isArray(version)
      ? (version as { guide_media?: unknown }).guide_media
      : null
  const images =
    guideMedia && typeof guideMedia === 'object' && !Array.isArray(guideMedia)
      ? (guideMedia as { step_images?: unknown }).step_images
      : null
  const match = (Array.isArray(images)
    ? images.find((entry) => {
        if (!entry || typeof entry !== 'object' || Array.isArray(entry)) return false
        return (entry as { step_id?: unknown }).step_id === stepId
      })
    : null) as GuideMediaStepImage | null

  const resolved = match
    ? resolveStepImageVariant(match, {
        requestedVariant,
        surface: requestedVariant === 'full' ? 'detail' : 'card',
      })
    : null
  const downloadUrl = resolved?.downloadUrl ?? null
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
    artifactResponse.headers.get('content-type') || resolved?.contentType || 'image/jpeg'
  )
  const requestId = shareResponse.headers.get('X-Trope-Request-Id')
  if (requestId) {
    headers.set('X-Trope-Request-Id', requestId)
  }

  return new Response(artifactResponse.body ?? null, { status: 200, headers })
}

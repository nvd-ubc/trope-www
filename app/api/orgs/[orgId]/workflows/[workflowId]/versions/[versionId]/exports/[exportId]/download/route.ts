import { NextResponse } from 'next/server'
import { proxyBackendRequest } from '@/lib/server/backend'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type DownloadDescriptor = {
  download_url?: string
  filename?: string
  content_type?: string
  message?: string
}

const safeFilename = (value?: string | null) => {
  const trimmed = (value ?? '').trim()
  if (!trimmed) return 'workflow-guide-export'
  return trimmed.replace(/[^\w.\-]+/g, '-')
}

export async function GET(
  _request: Request,
  context: {
    params: Promise<{ orgId: string; workflowId: string; versionId: string; exportId: string }>
  }
) {
  const { orgId, workflowId, versionId, exportId } = await context.params
  const descriptorResponse = await proxyBackendRequest(
    `/v1/orgs/${encodeURIComponent(orgId)}/workflows/${encodeURIComponent(
      workflowId
    )}/versions/${encodeURIComponent(versionId)}/exports/${encodeURIComponent(exportId)}/download`
  )

  const descriptor = (await descriptorResponse.clone().json().catch(() => null)) as DownloadDescriptor | null
  if (!descriptorResponse.ok || !descriptor?.download_url) {
    return NextResponse.json(
      {
        error: 'export_download_unavailable',
        message: descriptor?.message || 'Export download is unavailable.',
      },
      { status: descriptorResponse.status }
    )
  }

  const upstream = await fetch(descriptor.download_url, {
    method: 'GET',
    cache: 'no-store',
  })
  if (!upstream.ok || !upstream.body) {
    return NextResponse.json(
      { error: 'export_fetch_failed', message: 'Unable to fetch export artifact.' },
      { status: 502 }
    )
  }

  const headers = new Headers()
  headers.set(
    'content-type',
    descriptor.content_type || upstream.headers.get('content-type') || 'application/octet-stream'
  )
  headers.set('cache-control', 'no-store')
  headers.set('content-disposition', `attachment; filename="${safeFilename(descriptor.filename)}"`)
  const requestId = descriptorResponse.headers.get('x-trope-request-id')
  if (requestId) {
    headers.set('x-trope-request-id', requestId)
  }

  return new NextResponse(upstream.body, {
    status: 200,
    headers,
  })
}

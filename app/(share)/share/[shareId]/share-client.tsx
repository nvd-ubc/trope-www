'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import Badge from '@/components/ui/badge'
import Button from '@/components/ui/button'
import Card from '@/components/ui/card'
import Logo from '@/components/ui/logo'
import { getRadarPercent } from '@/lib/guide-editor'
import {
  formatCaptureTimestamp,
  resolveStepImageVariant,
  type GuideMediaStepImage as StepImage,
} from '@/lib/guide-media'

type ShareRecord = {
  share_id: string
  workflow_id: string
  version_id: string
  created_at: string
  expires_at?: number | null
  created_by?: string | null
}

type WorkflowDefinition = {
  workflow_id: string
  title: string
  org_id: string
}

type WorkflowVersion = {
  version_id: string
  created_at: string
  created_by?: string
  steps_count?: number | null
  guide_spec?: { download_url?: string | null } | null
  guide_media?: GuideMedia | null
}

type GuideMedia = {
  step_images: StepImage[]
}

type ShareResponse = {
  share: ShareRecord
  workflow: WorkflowDefinition
  version: WorkflowVersion
}

type GuideSpec = {
  workflow_title: string
  app: string
  version: string
  variables?: Array<{
    id: string
    label: string
    sensitive: boolean
    type?: string
    description?: string
  }>
  steps: Array<GuideStep>
}

type GuideStep = {
  id: string
  title: string
  why?: string
  instructions: string
  kind?: string
  anchors?: {
    text?: Array<{ string?: string; area_hint?: string }>
    icons?: Array<{ description?: string }>
    layout?: Array<{ region?: string; relative_to?: string; position_hint?: string }>
  }
}

const formatDate = (value?: string | null) => {
  if (!value) return 'Unknown'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

const formatDateTime = (value?: string | null) => {
  if (!value) return 'Unknown'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

const formatKind = (kind?: string | null) => {
  if (!kind) return null
  return kind.replace(/_/g, ' ')
}

export default function ShareClient({ shareId }: { shareId: string }) {
  const searchParams = useSearchParams()
  const embedMode = searchParams.get('embed') === '1' || searchParams.get('embed') === 'true'
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [requestId, setRequestId] = useState<string | null>(null)
  const [share, setShare] = useState<ShareRecord | null>(null)
  const [workflow, setWorkflow] = useState<WorkflowDefinition | null>(null)
  const [version, setVersion] = useState<WorkflowVersion | null>(null)
  const [spec, setSpec] = useState<GuideSpec | null>(null)
  const [specError, setSpecError] = useState<string | null>(null)
  const [shareUrl, setShareUrl] = useState<string | null>(null)
  const [trackedView, setTrackedView] = useState(false)

  useEffect(() => {
    if (!shareId) return
    let active = true

    const load = async () => {
      setLoading(true)
      setError(null)
      setRequestId(null)
      try {
        const response = await fetch(`/api/shares/${encodeURIComponent(shareId)}`, { cache: 'no-store' })
        const payload = (await response.json().catch(() => null)) as ShareResponse | null
        if (!response.ok || !payload) {
          setRequestId(response.headers.get('x-trope-request-id'))
          throw new Error('Share link could not be loaded.')
        }
        if (!active) return
        setShare(payload.share)
        setWorkflow(payload.workflow)
        setVersion(payload.version)

        const specResponse = await fetch(`/api/shares/${encodeURIComponent(shareId)}/guide-spec`, {
          cache: 'no-store',
        })
        if (specResponse.ok) {
          const specJson = (await specResponse.json().catch(() => null)) as GuideSpec | null
          if (!specJson) {
            throw new Error('Guide spec is empty.')
          }
          if (!active) return
          setSpec(specJson)
        } else {
          setSpecError('Guide spec is unavailable.')
        }
        setLoading(false)
      } catch (err) {
        if (!active) return
        setError(err instanceof Error ? err.message : 'Share link could not be loaded.')
        setLoading(false)
      }
    }

    load()
    return () => {
      active = false
    }
  }, [shareId])

  useEffect(() => {
    if (!shareId || !share || trackedView) return
    setTrackedView(true)
    fetch(`/api/shares/${encodeURIComponent(shareId)}/events`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ event_type: 'workflow_viewed' }),
    }).catch(() => {
      // ignore tracking failures
    })
  }, [share, shareId, trackedView])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setShareUrl(`${window.location.origin}/share/${shareId}`)
    }
  }, [shareId])

  const copyShareLink = async () => {
    if (!shareUrl) return
    try {
      await navigator.clipboard.writeText(shareUrl)
    } catch {
      // ignore
    }
  }

  const stepImageMap = useMemo(() => {
    const map: Record<string, StepImage> = {}
    const images = version?.guide_media?.step_images ?? []
    for (const image of images) {
      if (image?.step_id) {
        map[image.step_id] = image
      }
    }
    return map
  }, [version?.guide_media?.step_images])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="p-6 text-sm text-slate-600">Loading shared workflow…</Card>
      </div>
    )
  }

  if (error || !share || !workflow || !version) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <Card className="border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
          {error ?? 'Share link could not be loaded.'}
          {requestId && (
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-rose-600">
              <span>Request ID: {requestId}</span>
              <button
                onClick={() => navigator.clipboard.writeText(requestId)}
                className="rounded-full border border-rose-200 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-rose-600"
              >
                Copy
              </button>
            </div>
          )}
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {!embedMode && (
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-6 py-6">
          <Logo />
          <div className="flex flex-wrap items-center gap-2">
            {shareUrl && (
              <Button variant="outline" size="sm" onClick={copyShareLink}>
                Copy share link
              </Button>
            )}
            <Link href="/signin" className="text-xs font-semibold text-[color:var(--trope-accent)]">
              Open Trope
            </Link>
          </div>
        </header>
      )}

      <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-10">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="info">Shared workflow</Badge>
            {share.expires_at && (
              <Badge variant="warning">Expires {formatDate(new Date(share.expires_at * 1000).toISOString())}</Badge>
            )}
          </div>
          <h1 className="mt-3 text-3xl font-semibold text-slate-900">
            {workflow.title || workflow.workflow_id}
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Version {version.version_id} · Published {formatDate(version.created_at)}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="p-5">
            <div className="text-xs uppercase tracking-wide text-slate-400">Workflow details</div>
            <div className="mt-3 space-y-2 text-sm text-slate-700">
              <div>
                <span className="font-semibold text-slate-900">Workflow ID:</span> {workflow.workflow_id}
              </div>
              <div>
                <span className="font-semibold text-slate-900">Steps:</span>{' '}
                {typeof version.steps_count === 'number' ? version.steps_count : '-'}
              </div>
              <div>
                <span className="font-semibold text-slate-900">Shared:</span> {formatDateTime(share.created_at)}
              </div>
            </div>
          </Card>
          <Card className="p-5">
            <div className="text-xs uppercase tracking-wide text-slate-400">How to use</div>
            <div className="mt-3 text-sm text-slate-600">
              Follow the SOP below in your browser or desktop app. If you want interactive guidance,
              open Trope and run the workflow in guided mode.
            </div>
          </Card>
        </div>

        {specError && (
          <Card className="border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            {specError}
          </Card>
        )}

        {spec && (
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Guide steps</h2>
              <span className="text-xs text-slate-500">{spec.steps.length} steps</span>
            </div>

            {spec.variables && spec.variables.length > 0 && (
              <div className="mt-6">
                <div className="text-xs uppercase tracking-wide text-slate-400">Variables</div>
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  {spec.variables.map((variable) => (
                    <div
                      key={variable.id}
                      className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700"
                    >
                      <div className="font-semibold text-slate-900">{variable.label}</div>
                      <div className="text-slate-500">{variable.id}</div>
                      {variable.sensitive && (
                        <div className="mt-1 text-[10px] uppercase tracking-wide text-rose-500">Sensitive</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 space-y-4">
              {spec.steps.map((step, index) => {
                const kindLabel = formatKind(step.kind)
                const image = stepImageMap[step.id] ?? null
                const previewImage = image
                  ? resolveStepImageVariant(image, { surface: 'card', requestedVariant: 'preview' })
                  : null
                const radar = image?.radar ?? null
                const radarWidth = previewImage?.width ?? image?.width ?? null
                const radarHeight = previewImage?.height ?? image?.height ?? null
                const radarPercent = getRadarPercent(radar, radarWidth, radarHeight)
                const imageAspectRatio =
                  typeof radarWidth === 'number' &&
                  Number.isFinite(radarWidth) &&
                  radarWidth > 0 &&
                  typeof radarHeight === 'number' &&
                  Number.isFinite(radarHeight) &&
                  radarHeight > 0
                    ? `${radarWidth} / ${radarHeight}`
                    : undefined
                const previewSrc = image
                  ? `/api/shares/${encodeURIComponent(shareId)}/media/steps/${encodeURIComponent(
                      step.id
                    )}?variant=preview`
                  : null
                const fullSrc = image
                  ? `/api/shares/${encodeURIComponent(shareId)}/media/steps/${encodeURIComponent(
                      step.id
                    )}?variant=full`
                  : null
                const hasImage = Boolean(previewSrc && (previewImage?.downloadUrl || image?.download_url))
                const captureTimestamp = formatCaptureTimestamp(image?.capture_t_s)
                return (
                  <div key={step.id} className="rounded-2xl border border-slate-200 bg-white p-5">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <div className="text-xs uppercase tracking-wide text-slate-400">Step {index + 1}</div>
                        <div className="text-sm font-semibold text-slate-900">{step.title}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        {kindLabel && (
                          <Badge variant="info" className="text-[10px]">
                            {kindLabel}
                          </Badge>
                        )}
                        {captureTimestamp && (
                          <Badge variant="neutral" className="text-[10px]">
                            t={captureTimestamp}
                          </Badge>
                        )}
                      </div>
                    </div>
                    {hasImage && previewSrc && fullSrc && (
                      <a
                        href={fullSrc}
                        target="_blank"
                        rel="noreferrer"
                        className="group mt-3 block overflow-hidden rounded-xl border border-slate-200 bg-slate-50"
                      >
                        <div
                          className="relative mx-auto w-full overflow-hidden bg-slate-100"
                          style={imageAspectRatio ? { aspectRatio: imageAspectRatio } : undefined}
                        >
                          <img
                            src={previewSrc}
                            alt={step.title}
                            loading="lazy"
                            className="block max-h-[22rem] w-full object-contain transition group-hover:scale-[1.01]"
                          />
                          {radarPercent && (
                            <div className="pointer-events-none absolute inset-0">
                              <div
                                className="absolute -translate-x-1/2 -translate-y-1/2"
                                style={{ left: `${radarPercent.left}%`, top: `${radarPercent.top}%` }}
                              >
                                <div className="relative h-5 w-5">
                                  <div className="absolute inset-0 rounded-full bg-[color:var(--trope-accent)] opacity-25" />
                                  <div className="absolute inset-[5px] rounded-full bg-[color:var(--trope-accent)] shadow-sm" />
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </a>
                    )}
                    {!hasImage && (
                      <div className="mt-3 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500">
                        No screenshot available for this step.
                      </div>
                    )}
                    <p className="mt-3 text-sm text-slate-700">{step.instructions}</p>
                    {step.why && <p className="mt-2 text-xs text-slate-500">{step.why}</p>}
                  </div>
                )
              })}
            </div>
          </Card>
        )}
      </main>
    </div>
  )
}

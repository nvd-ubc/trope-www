'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import Badge from '@/components/ui/badge'
import Button from '@/components/ui/button'
import Card from '@/components/ui/card'
import { useCsrfToken } from '@/lib/client/use-csrf-token'

type ResolveResponse = {
  org_id: string
  workflow_id: string
  status?: string | null
}

type WorkflowDefinition = {
  org_id: string
  workflow_id: string
  title: string
  status: string
  created_at: string
  created_by: string
  updated_at: string
  latest_version_id?: string | null
}

type WorkflowVersionSummary = {
  version_id: string
  created_at: string
  created_by?: string | null
  steps_count?: number | null
  status?: string | null
}

type WorkflowDetailResponse = {
  workflow: WorkflowDefinition
  latest_version?: (WorkflowVersionSummary & {
    guide_media?: GuideMedia | null
  }) | null
}

type VersionsResponse = {
  versions: WorkflowVersionSummary[]
}

type Radar = {
  x: number
  y: number
  coordinate_space: string
  confidence?: number | null
  reason_code?: string | null
}

type StepImage = {
  step_id: string
  content_type?: string | null
  width?: number | null
  height?: number | null
  radar?: Radar | null
}

type GuideMedia = {
  step_images: StepImage[]
}

type VersionDetailResponse = {
  version: WorkflowVersionSummary & {
    guide_media?: GuideMedia | null
  }
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

const formatKind = (kind?: string | null) => {
  if (!kind) return null
  return kind.replace(/_/g, ' ')
}

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value)

const StepImageCard = ({
  orgId,
  workflowId,
  versionId,
  step,
  index,
  image,
}: {
  orgId: string
  workflowId: string
  versionId: string
  step: GuideStep
  index: number
  image: StepImage | null
}) => {
  const kindLabel = formatKind(step.kind)
  const anchorText = step.anchors?.text
    ?.map((anchor) => anchor.string)
    .filter((value): value is string => Boolean(value))
  const iconText = step.anchors?.icons
    ?.map((icon) => icon.description)
    .filter((value): value is string => Boolean(value))
  const layoutText = step.anchors?.layout
    ?.map((layout) => layout.region || layout.relative_to || layout.position_hint)
    .filter((value): value is string => Boolean(value))

  const imgSrc = image
    ? `/api/orgs/${encodeURIComponent(orgId)}/workflows/${encodeURIComponent(
        workflowId
      )}/versions/${encodeURIComponent(versionId)}/media/steps/${encodeURIComponent(step.id)}`
    : null

  const radar = image?.radar ?? null
  const width = image?.width ?? null
  const height = image?.height ?? null
  const radarPercent = useMemo(() => {
    if (!radar || radar.coordinate_space !== 'step_image_pixels_v1') {
      return null
    }
    if (!isFiniteNumber(radar.x) || !isFiniteNumber(radar.y)) {
      return null
    }
    if (!isFiniteNumber(width) || !isFiniteNumber(height) || width <= 0 || height <= 0) {
      return null
    }
    return {
      left: (radar.x / width) * 100,
      top: (radar.y / height) * 100,
    }
  }, [height, radar, width])

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <div className="text-xs uppercase tracking-wide text-slate-400">Step {index + 1}</div>
          <div className="text-base font-semibold text-slate-900">{step.title}</div>
        </div>
        {kindLabel && (
          <Badge variant="info" className="text-[10px]">
            {kindLabel}
          </Badge>
        )}
      </div>

      {imgSrc && (
        <a
          href={imgSrc}
          target="_blank"
          rel="noreferrer"
          className="group mt-4 block overflow-hidden rounded-xl border border-slate-200 bg-slate-50"
        >
          <div className="relative">
            <img
              src={imgSrc}
              alt={step.title}
              loading="lazy"
              className="block h-auto w-full transition group-hover:scale-[1.01]"
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

      <p className="mt-4 text-sm text-slate-700">{step.instructions}</p>
      {step.why && <p className="mt-2 text-xs text-slate-500">{step.why}</p>}

      {(anchorText?.length || iconText?.length || layoutText?.length) && (
        <div className="mt-4 space-y-2 text-xs text-slate-500">
          {anchorText && anchorText.length > 0 && (
            <div>
              <span className="font-semibold text-slate-600">Text anchors:</span> {anchorText.join(', ')}
            </div>
          )}
          {iconText && iconText.length > 0 && (
            <div>
              <span className="font-semibold text-slate-600">Icon anchors:</span> {iconText.join(', ')}
            </div>
          )}
          {layoutText && layoutText.length > 0 && (
            <div>
              <span className="font-semibold text-slate-600">Layout anchors:</span> {layoutText.join(', ')}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function WorkflowGuideClient({ workflowId }: { workflowId: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { token: csrfToken } = useCsrfToken()

  const versionIdParam = (searchParams.get('versionId') ?? '').trim()

  const [orgId, setOrgId] = useState<string | null>(null)
  const [resolveError, setResolveError] = useState<string | null>(null)

  const [workflow, setWorkflow] = useState<WorkflowDefinition | null>(null)
  const [versions, setVersions] = useState<WorkflowVersionSummary[]>([])
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null)
  const [versionDetail, setVersionDetail] = useState<VersionDetailResponse['version'] | null>(null)

  const [spec, setSpec] = useState<GuideSpec | null>(null)
  const [loading, setLoading] = useState(true)
  const [specLoading, setSpecLoading] = useState(false)
  const [specError, setSpecError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    const resolve = async () => {
      setLoading(true)
      setResolveError(null)
      setOrgId(null)
      try {
        const response = await fetch(`/api/workflows/${encodeURIComponent(workflowId)}/resolve`, {
          cache: 'no-store',
        })
        const payload = (await response.json().catch(() => null)) as ResolveResponse | null
        if (!response.ok || !payload?.org_id) {
          throw new Error('Workflow not found or you do not have access.')
        }
        if (!active) return
        setOrgId(payload.org_id)
      } catch (err) {
        if (!active) return
        setResolveError(err instanceof Error ? err.message : 'Unable to resolve workflow.')
      } finally {
        if (active) setLoading(false)
      }
    }
    resolve()
    return () => {
      active = false
    }
  }, [workflowId])

  useEffect(() => {
    if (!orgId) return
    let active = true
    const load = async () => {
      setLoading(true)
      try {
        const [workflowResponse, versionsResponse] = await Promise.all([
          fetch(
            `/api/orgs/${encodeURIComponent(orgId)}/workflows/${encodeURIComponent(workflowId)}`,
            { cache: 'no-store' }
          ),
          fetch(
            `/api/orgs/${encodeURIComponent(orgId)}/workflows/${encodeURIComponent(workflowId)}/versions`,
            { cache: 'no-store' }
          ),
        ])

        const workflowPayload = (await workflowResponse.json().catch(() => null)) as
          | WorkflowDetailResponse
          | null
        const versionsPayload = (await versionsResponse.json().catch(() => null)) as
          | VersionsResponse
          | null

        if (!workflowResponse.ok || !workflowPayload?.workflow) {
          throw new Error('Unable to load workflow.')
        }
        if (!versionsResponse.ok || !versionsPayload?.versions) {
          throw new Error('Unable to load versions.')
        }
        if (!active) return

        setWorkflow(workflowPayload.workflow)
        setVersions(versionsPayload.versions ?? [])

        const defaultVersion =
          (versionIdParam && versionsPayload.versions.some((v) => v.version_id === versionIdParam)
            ? versionIdParam
            : null) ||
          (workflowPayload.latest_version?.version_id ?? null) ||
          (versionsPayload.versions[0]?.version_id ?? null)

        setSelectedVersionId(defaultVersion)
      } catch (err) {
        if (!active) return
        setResolveError(err instanceof Error ? err.message : 'Unable to load workflow.')
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [orgId, versionIdParam, workflowId])

  useEffect(() => {
    if (!csrfToken || !orgId) return
    const sendView = async () => {
      try {
        await fetch(
          `/api/orgs/${encodeURIComponent(orgId)}/workflows/${encodeURIComponent(workflowId)}/events`,
          {
            method: 'POST',
            headers: {
              'content-type': 'application/json',
              'x-csrf-token': csrfToken,
            },
            body: JSON.stringify({ event_type: 'workflow_viewed', surface: 'web_guide_doc' }),
          }
        )
      } catch {
        // Ignore view tracking failures.
      }
    }
    sendView()
  }, [csrfToken, orgId, workflowId])

  useEffect(() => {
    if (!orgId || !selectedVersionId) {
      setSpec(null)
      setVersionDetail(null)
      return
    }

    let active = true
    const loadSpec = async () => {
      setSpecLoading(true)
      setSpecError(null)
      try {
        const [specResponse, versionResponse] = await Promise.all([
          fetch(
            `/api/orgs/${encodeURIComponent(orgId)}/workflows/${encodeURIComponent(
              workflowId
            )}/versions/${encodeURIComponent(selectedVersionId)}/guide-spec`,
            { cache: 'no-store' }
          ),
          fetch(
            `/api/orgs/${encodeURIComponent(orgId)}/workflows/${encodeURIComponent(
              workflowId
            )}/versions/${encodeURIComponent(selectedVersionId)}`,
            { cache: 'no-store' }
          ),
        ])

        if (!versionResponse.ok) {
          throw new Error('Unable to load version details.')
        }
        const versionPayload = (await versionResponse.json().catch(() => null)) as
          | VersionDetailResponse
          | null
        if (!versionPayload?.version) {
          throw new Error('Unable to load version details.')
        }

        if (!specResponse.ok) {
          throw new Error('Guide spec is not available for this version.')
        }
        const specJson = (await specResponse.json().catch(() => null)) as GuideSpec | null
        if (!specJson) {
          throw new Error('Guide spec is empty.')
        }

        if (!active) return
        setVersionDetail(versionPayload.version)
        setSpec(specJson)
      } catch (err) {
        if (!active) return
        setSpec(null)
        setVersionDetail(null)
        setSpecError(err instanceof Error ? err.message : 'Unable to load guide spec.')
      } finally {
        if (active) setSpecLoading(false)
      }
    }

    loadSpec()
    return () => {
      active = false
    }
  }, [orgId, selectedVersionId, workflowId])

  const stepImageMap = useMemo(() => {
    const map: Record<string, StepImage> = {}
    const images = versionDetail?.guide_media?.step_images ?? []
    for (const image of images) {
      if (image?.step_id) {
        map[image.step_id] = image
      }
    }
    return map
  }, [versionDetail?.guide_media?.step_images])

  const onSelectVersion = (versionId: string) => {
    setSelectedVersionId(versionId)
    const params = new URLSearchParams(searchParams.toString())
    params.set('versionId', versionId)
    router.replace(`/dashboard/workflows/${encodeURIComponent(workflowId)}/guide?${params.toString()}`)
  }

  if (loading && !orgId) {
    return (
      <div className="flex items-center justify-center">
        <Card className="p-6 text-sm text-slate-600">Loading guide…</Card>
      </div>
    )
  }

  if (resolveError || !orgId) {
    return (
      <div className="flex items-center justify-center">
        <Card className="border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
          {resolveError ?? 'Workflow not found or you do not have access.'}
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="text-xs uppercase tracking-wide text-slate-400">Workflow guide</div>
          <h1 className="text-2xl font-semibold text-slate-900">{workflow?.title ?? workflowId}</h1>
          <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
            <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-xs text-slate-500">
              Workspace: {orgId}
            </span>
            <Link
              href={`/dashboard/workspaces/${encodeURIComponent(orgId)}/workflows/${encodeURIComponent(workflowId)}`}
              className="text-[color:var(--trope-accent)] hover:underline"
            >
              View workflow
            </Link>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(window.location.href)
              } catch {
                // ignore
              }
            }}
          >
            Copy link
          </Button>
        </div>
      </div>

      <Card className="p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm font-semibold text-slate-900">Version</div>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedVersionId ?? ''}
              onChange={(e) => onSelectVersion(e.target.value)}
              className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 shadow-sm"
            >
              {versions.map((version) => (
                <option key={version.version_id} value={version.version_id}>
                  {version.version_id} ({formatDate(version.created_at)})
                </option>
              ))}
            </select>
            {selectedVersionId && (
              <span className="text-xs text-slate-500">
                {versions.find((v) => v.version_id === selectedVersionId)?.steps_count
                  ? `${versions.find((v) => v.version_id === selectedVersionId)?.steps_count} steps`
                  : ''}
              </span>
            )}
          </div>
        </div>
      </Card>

      {specLoading && <div className="text-sm text-slate-500">Loading guide…</div>}

      {specError && (
        <Card className="border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">{specError}</Card>
      )}

      {spec && selectedVersionId && (
        <div className="space-y-8">
          {spec.variables && spec.variables.length > 0 && (
            <Card className="p-6">
              <div className="text-xs uppercase tracking-wide text-slate-400">Variables</div>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {spec.variables.map((variable) => (
                  <div
                    key={variable.id}
                    className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700"
                  >
                    <div className="font-semibold text-slate-900">{variable.label}</div>
                    <div className="text-slate-500">{variable.id}</div>
                    {variable.sensitive && (
                      <div className="mt-1 text-[10px] uppercase tracking-wide text-rose-500">
                        Sensitive
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}

          <div className="space-y-6">
            {spec.steps.map((step, index) => (
              <StepImageCard
                key={step.id}
                orgId={orgId}
                workflowId={workflowId}
                versionId={selectedVersionId}
                step={step}
                index={index}
                image={stepImageMap[step.id] ?? null}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

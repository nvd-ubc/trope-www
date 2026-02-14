'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import Badge from '@/components/ui/badge'
import Button from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'
import Card from '@/components/ui/card'
import { InputGroup, InputGroupInput } from '@/components/ui/input-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useCsrfToken } from '@/lib/client/use-csrf-token'
import { ErrorNotice, GuidePageSkeleton, PageHeader } from '@/components/dashboard'
import {
  buildSaveFingerprint,
  createDraftStep,
  getRadarPercent,
  normalizeSpecForPublish,
} from '@/lib/guide-editor'
import {
  formatCaptureTimestamp,
  resolveStepImageVariant,
  shouldRenderStepRadar,
  type GuideMediaStepImage as StepImage,
} from '@/lib/guide-media'

type ResolveResponse = {
  org_id: string
  workflow_id: string
  status?: string | null
}

type OrgProfileResponse = {
  membership?: {
    role?: string | null
  } | null
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

type GuideMedia = {
  step_images: StepImage[]
}

type VersionDetailResponse = {
  version: WorkflowVersionSummary & {
    guide_media?: GuideMedia | null
  }
}

type GuideVariable = {
  id: string
  label: string
  sensitive: boolean
  type?: string
  description?: string
}

type GuideStep = {
  id: string
  title: string
  why?: string
  instructions: string
  kind?: string
  video_ranges?: unknown[]
  anchors?: {
    text?: unknown[]
    icons?: unknown[]
    layout?: unknown[]
    [key: string]: unknown
  }
  [key: string]: unknown
}

type GuideSpec = {
  workflow_title: string
  app: string
  version: string
  variables?: GuideVariable[]
  steps: GuideStep[]
  [key: string]: unknown
}

type ArtifactsPresignResponse = {
  artifacts?: Array<{
    name?: string
    key?: string
    upload_url?: string
    content_type?: string
  }>
}

type VersionsCreateResponse = {
  version?: WorkflowVersionSummary
  error?: string
  message?: string
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

const sortVersionsByDate = (versions: WorkflowVersionSummary[]) =>
  [...versions].sort((a, b) => {
    const aTime = new Date(a.created_at).getTime()
    const bTime = new Date(b.created_at).getTime()
    return bTime - aTime
  })

const cloneSpec = (spec: GuideSpec): GuideSpec => JSON.parse(JSON.stringify(spec)) as GuideSpec

const StepImageCard = ({
  orgId,
  workflowId,
  versionId,
  step,
  index,
  image,
  isEditing,
  canMoveUp,
  canMoveDown,
  canDelete,
  onMoveUp,
  onMoveDown,
  onDelete,
  onInsertAfter,
  onStepTitleChange,
  onStepInstructionChange,
}: {
  orgId: string
  workflowId: string
  versionId: string
  step: GuideStep
  index: number
  image: StepImage | null
  isEditing: boolean
  canMoveUp: boolean
  canMoveDown: boolean
  canDelete: boolean
  onMoveUp: () => void
  onMoveDown: () => void
  onDelete: () => void
  onInsertAfter: () => void
  onStepTitleChange: (value: string) => void
  onStepInstructionChange: (value: string) => void
}) => {
  const kindLabel = formatKind(step.kind)
  const anchorText = (step.anchors?.text ?? [])
    .map((anchor) => {
      if (anchor && typeof anchor === 'object' && !Array.isArray(anchor)) {
        const record = anchor as { string?: string }
        return record.string
      }
      return undefined
    })
    .filter((value): value is string => Boolean(value))
  const iconText = (step.anchors?.icons ?? [])
    .map((icon) => {
      if (icon && typeof icon === 'object' && !Array.isArray(icon)) {
        const record = icon as { description?: string }
        return record.description
      }
      return undefined
    })
    .filter((value): value is string => Boolean(value))
  const layoutText = (step.anchors?.layout ?? [])
    .map((layout) => {
      if (layout && typeof layout === 'object' && !Array.isArray(layout)) {
        const record = layout as { region?: string; relative_to?: string; position_hint?: string }
        return record.region || record.relative_to || record.position_hint
      }
      return undefined
    })
    .filter((value): value is string => Boolean(value))

  const cardImage = useMemo(
    () =>
      image
        ? resolveStepImageVariant(image, { surface: 'card', requestedVariant: 'preview' })
        : null,
    [image]
  )
  const fullImage = useMemo(
    () =>
      image
        ? resolveStepImageVariant(image, { surface: 'detail', requestedVariant: 'full' })
        : null,
    [image]
  )

  const imgSrc = image
    ? `/api/orgs/${encodeURIComponent(orgId)}/workflows/${encodeURIComponent(
        workflowId
      )}/versions/${encodeURIComponent(versionId)}/media/steps/${encodeURIComponent(
        step.id
      )}?variant=preview`
    : null
  const openImageHref = image
    ? `/api/orgs/${encodeURIComponent(orgId)}/workflows/${encodeURIComponent(
        workflowId
      )}/versions/${encodeURIComponent(versionId)}/media/steps/${encodeURIComponent(
        step.id
      )}?variant=full`
    : null

  const radar = image?.radar ?? null
  const width = image?.width ?? cardImage?.width ?? null
  const height = image?.height ?? cardImage?.height ?? null
  const radarPercent = useMemo(
    () =>
      shouldRenderStepRadar({
        step,
        radar,
        width,
        height,
      })
        ? getRadarPercent(radar, width, height)
        : null,
    [height, radar, step, width]
  )
  const captureTimestamp = formatCaptureTimestamp(image?.capture_t_s)
  const hasImage = Boolean(imgSrc && (cardImage?.downloadUrl || fullImage?.downloadUrl || image?.download_url))

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <div className="text-xs uppercase tracking-wide text-slate-400">Step {index + 1}</div>
          {isEditing ? (
            <InputGroup className="mt-1">
              <InputGroupInput
                value={step.title}
                onChange={(event) => onStepTitleChange(event.target.value)}
                className="text-base font-semibold text-slate-900"
                placeholder={`Step ${index + 1}`}
              />
            </InputGroup>
          ) : (
            <div className="text-base font-semibold text-slate-900">{step.title}</div>
          )}
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
          {isEditing && (
            <ButtonGroup>
              <Button variant="outline" size="sm" onClick={onMoveUp} disabled={!canMoveUp}>
                Up
              </Button>
              <Button variant="outline" size="sm" onClick={onMoveDown} disabled={!canMoveDown}>
                Down
              </Button>
              <Button variant="outline" size="sm" onClick={onInsertAfter}>
                + Step
              </Button>
              <Button variant="outline" size="sm" onClick={onDelete} disabled={!canDelete}>
                Delete
              </Button>
            </ButtonGroup>
          )}
        </div>
      </div>

      {hasImage && imgSrc && openImageHref && (
        <a
          href={openImageHref}
          target="_blank"
          rel="noreferrer"
          className="group mt-4 block overflow-hidden rounded-xl border border-slate-200 bg-slate-50"
        >
          <div className="relative mx-auto w-fit max-w-full overflow-hidden bg-slate-100">
            <img
              src={imgSrc}
              alt={step.title}
              loading="lazy"
              className="block h-auto max-h-[27rem] w-auto max-w-full transition group-hover:scale-[1.01]"
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
        <div className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500">
          No screenshot available for this step.
        </div>
      )}

      {isEditing && radar && isFiniteNumber(radar.x) && isFiniteNumber(radar.y) && (
        <div className="mt-2 text-xs text-slate-500">
          Click hotspot: x={Math.round(radar.x)}, y={Math.round(radar.y)}
        </div>
      )}

      {isEditing ? (
        <Textarea
          value={step.instructions}
          onChange={(event) => onStepInstructionChange(event.target.value)}
          className="mt-4 text-sm text-slate-700"
          rows={3}
          placeholder="Describe the action clearly."
        />
      ) : (
        <p className="mt-4 text-sm text-slate-700">{step.instructions}</p>
      )}
      {step.why && <p className="mt-2 text-xs text-slate-500">{step.why}</p>}

      {!isEditing && (anchorText.length > 0 || iconText.length > 0 || layoutText.length > 0) && (
        <div className="mt-4 space-y-2 text-xs text-slate-500">
          {anchorText.length > 0 && (
            <div>
              <span className="font-semibold text-slate-600">Text anchors:</span> {anchorText.join(', ')}
            </div>
          )}
          {iconText.length > 0 && (
            <div>
              <span className="font-semibold text-slate-600">Icon anchors:</span> {iconText.join(', ')}
            </div>
          )}
          {layoutText.length > 0 && (
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
  const [requestId, setRequestId] = useState<string | null>(null)

  const [workflow, setWorkflow] = useState<WorkflowDefinition | null>(null)
  const [versions, setVersions] = useState<WorkflowVersionSummary[]>([])
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null)
  const [versionDetail, setVersionDetail] = useState<VersionDetailResponse['version'] | null>(null)
  const [membershipRole, setMembershipRole] = useState<string | null>(null)

  const [spec, setSpec] = useState<GuideSpec | null>(null)
  const [draftSpec, setDraftSpec] = useState<GuideSpec | null>(null)
  const [baselineFingerprint, setBaselineFingerprint] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [specLoading, setSpecLoading] = useState(false)
  const [specError, setSpecError] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)
  const [saveRequestId, setSaveRequestId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  const isAdmin = membershipRole === 'org_owner' || membershipRole === 'org_admin'

  useEffect(() => {
    let active = true
    const resolve = async () => {
      setLoading(true)
      setResolveError(null)
      setOrgId(null)
      setRequestId(null)
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

        const params = new URLSearchParams(window.location.search)
        const currentOrgId = (params.get('orgId') ?? '').trim()
        if (currentOrgId !== payload.org_id) {
          params.set('orgId', payload.org_id)
          const query = params.toString()
          router.replace(
            `/dashboard/workflows/${encodeURIComponent(workflowId)}/guide${query ? `?${query}` : ''}`
          )
        }
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
  }, [router, workflowId])

  useEffect(() => {
    if (!orgId) return
    let active = true
    const load = async () => {
      setLoading(true)
      try {
        const [workflowResponse, versionsResponse, orgResponse] = await Promise.all([
          fetch(
            `/api/orgs/${encodeURIComponent(orgId)}/workflows/${encodeURIComponent(workflowId)}`,
            { cache: 'no-store' }
          ),
          fetch(
            `/api/orgs/${encodeURIComponent(orgId)}/workflows/${encodeURIComponent(workflowId)}/versions`,
            { cache: 'no-store' }
          ),
          fetch(`/api/orgs/${encodeURIComponent(orgId)}`, { cache: 'no-store' }),
        ])

        const workflowPayload = (await workflowResponse.json().catch(() => null)) as
          | WorkflowDetailResponse
          | null
        const versionsPayload = (await versionsResponse.json().catch(() => null)) as
          | VersionsResponse
          | null
        const orgPayload = (await orgResponse.json().catch(() => null)) as OrgProfileResponse | null

        if (!workflowResponse.ok || !workflowPayload?.workflow) {
          throw new Error('Unable to load workflow.')
        }
        if (!versionsResponse.ok || !versionsPayload?.versions) {
          throw new Error('Unable to load versions.')
        }
        if (!active) return

        const sortedVersions = sortVersionsByDate(versionsPayload.versions ?? [])

        setWorkflow(workflowPayload.workflow)
        setVersions(sortedVersions)
        setMembershipRole(orgPayload?.membership?.role ?? null)

        const defaultVersion =
          (versionIdParam && sortedVersions.some((v) => v.version_id === versionIdParam)
            ? versionIdParam
            : null) ||
          (workflowPayload.latest_version?.version_id ?? null) ||
          (sortedVersions[0]?.version_id ?? null)

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
      setDraftSpec(null)
      setVersionDetail(null)
      setBaselineFingerprint(null)
      return
    }

    let active = true
    const loadSpec = async () => {
      setSpecLoading(true)
      setSpecError(null)
      setSaveError(null)
      setSaveMessage(null)
      setSaveRequestId(null)
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
        const normalized = normalizeSpecForPublish(
          specJson,
          workflow?.title ?? specJson.workflow_title ?? workflowId
        )
        setVersionDetail(versionPayload.version)
        setSpec(normalized)
        setDraftSpec(cloneSpec(normalized))
        setBaselineFingerprint(
          buildSaveFingerprint(normalized, workflow?.title ?? normalized.workflow_title ?? workflowId)
        )
        setIsEditing(false)
      } catch (err) {
        if (!active) return
        setSpec(null)
        setDraftSpec(null)
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
  }, [orgId, selectedVersionId, workflow?.title, workflowId])

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

  const visibleSpec = isEditing ? draftSpec : spec

  const draftIsDirty = useMemo(() => {
    if (!isEditing || !draftSpec || !baselineFingerprint) return false
    const fingerprint = buildSaveFingerprint(draftSpec, workflow?.title ?? workflowId)
    return fingerprint !== baselineFingerprint
  }, [baselineFingerprint, draftSpec, isEditing, workflow?.title, workflowId])

  const onSelectVersion = (versionId: string) => {
    if (isEditing && draftIsDirty) {
      const proceed = window.confirm(
        'You have unsaved edits. Switch versions and discard those edits?'
      )
      if (!proceed) return
    }
    setIsEditing(false)
    setSaveError(null)
    setSaveMessage(null)
    setSaveRequestId(null)
    setSelectedVersionId(versionId)
    const params = new URLSearchParams(searchParams.toString())
    params.set('versionId', versionId)
    router.replace(`/dashboard/workflows/${encodeURIComponent(workflowId)}/guide?${params.toString()}`)
  }

  const updateDraftStep = (index: number, updater: (step: GuideStep) => GuideStep) => {
    setDraftSpec((prev) => {
      if (!prev || !Array.isArray(prev.steps) || !prev.steps[index]) return prev
      const steps = [...prev.steps]
      steps[index] = updater(steps[index] as GuideStep)
      return { ...prev, steps }
    })
  }

  const insertDraftStep = (index: number) => {
    setDraftSpec((prev) => {
      if (!prev || !Array.isArray(prev.steps)) return prev
      const steps = [...prev.steps]
      steps.splice(index, 0, createDraftStep())
      return { ...prev, steps }
    })
  }

  const deleteDraftStep = (index: number) => {
    setDraftSpec((prev) => {
      if (!prev || !Array.isArray(prev.steps) || prev.steps.length <= 1) return prev
      const steps = prev.steps.filter((_, stepIndex) => stepIndex !== index)
      return { ...prev, steps }
    })
  }

  const moveDraftStep = (index: number, direction: 'up' | 'down') => {
    setDraftSpec((prev) => {
      if (!prev || !Array.isArray(prev.steps)) return prev
      const targetIndex = direction === 'up' ? index - 1 : index + 1
      if (targetIndex < 0 || targetIndex >= prev.steps.length) return prev
      const steps = [...prev.steps]
      const [step] = steps.splice(index, 1)
      steps.splice(targetIndex, 0, step as GuideStep)
      return { ...prev, steps }
    })
  }

  const handleStartEditing = () => {
    if (!spec || !isAdmin) return
    setDraftSpec(cloneSpec(spec))
    setBaselineFingerprint(buildSaveFingerprint(spec, workflow?.title ?? workflowId))
    setSaveError(null)
    setSaveMessage(null)
    setSaveRequestId(null)
    setIsEditing(true)
  }

  const handleDoneEditing = () => {
    if (draftIsDirty) {
      const shouldDiscard = window.confirm('Discard unsaved edits?')
      if (!shouldDiscard) return
    }
    if (spec) {
      setDraftSpec(cloneSpec(spec))
      setBaselineFingerprint(buildSaveFingerprint(spec, workflow?.title ?? workflowId))
    } else {
      setDraftSpec(null)
      setBaselineFingerprint(null)
    }
    setSaveError(null)
    setSaveMessage(null)
    setSaveRequestId(null)
    setIsEditing(false)
  }

  const refreshVersions = async (): Promise<WorkflowVersionSummary[]> => {
    if (!orgId) return []
    const response = await fetch(
      `/api/orgs/${encodeURIComponent(orgId)}/workflows/${encodeURIComponent(workflowId)}/versions`,
      { cache: 'no-store' }
    )
    if (!response.ok) {
      throw new Error('Unable to refresh versions.')
    }
    const payload = (await response.json().catch(() => null)) as VersionsResponse | null
    return sortVersionsByDate(payload?.versions ?? [])
  }

  const handleSaveEdits = async () => {
    if (!csrfToken || !orgId || !selectedVersionId || !draftSpec) return
    setSaving(true)
    setSaveError(null)
    setSaveMessage(null)
    setSaveRequestId(null)

    try {
      const normalizedSpec = normalizeSpecForPublish(draftSpec, workflow?.title ?? workflowId)
      if (!Array.isArray(normalizedSpec.steps) || normalizedSpec.steps.length === 0) {
        throw new Error('At least one step is required before saving.')
      }

      const presignResponse = await fetch('/api/artifacts/presign', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-csrf-token': csrfToken,
        },
        body: JSON.stringify({
          org_id: orgId,
          artifacts: [
            {
              name: 'guide_spec_override',
              filename: `guide-spec-edited-${Date.now()}.json`,
              content_type: 'application/json',
            },
          ],
        }),
      })
      const presignRequestId = presignResponse.headers.get('x-trope-request-id')
      const presignPayload = (await presignResponse.json().catch(() => null)) as
        | ArtifactsPresignResponse
        | null
      if (!presignResponse.ok) {
        setSaveRequestId(presignRequestId)
        throw new Error('Unable to prepare save artifact upload.')
      }

      const artifact = presignPayload?.artifacts?.[0]
      const uploadUrl = artifact?.upload_url ?? ''
      const artifactKey = artifact?.key ?? ''
      if (!uploadUrl || !artifactKey) {
        throw new Error('Artifact upload details are missing.')
      }

      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify(normalizedSpec),
      })
      if (!uploadResponse.ok) {
        throw new Error('Unable to upload edited guide spec.')
      }

      const publishResponse = await fetch(
        `/api/orgs/${encodeURIComponent(orgId)}/workflows/${encodeURIComponent(
          workflowId
        )}/versions`,
        {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            'x-csrf-token': csrfToken,
          },
          body: JSON.stringify({
            base_version_id: selectedVersionId,
            guide_spec_override_key: artifactKey,
          }),
        }
      )
      const publishRequestId = publishResponse.headers.get('x-trope-request-id')
      const publishPayload = (await publishResponse.json().catch(() => null)) as
        | VersionsCreateResponse
        | null
      if (!publishResponse.ok || !publishPayload?.version?.version_id) {
        setSaveRequestId(publishRequestId ?? presignRequestId)
        throw new Error(
          publishPayload?.message || 'Unable to publish edited guide version.'
        )
      }

      const nextVersionId = publishPayload.version.version_id
      const refreshedVersions = await refreshVersions()
      setVersions(refreshedVersions)
      setSelectedVersionId(nextVersionId)
      const params = new URLSearchParams(searchParams.toString())
      params.set('versionId', nextVersionId)
      router.replace(`/dashboard/workflows/${encodeURIComponent(workflowId)}/guide?${params.toString()}`)
      setIsEditing(false)
      setSaveMessage('Edits saved as a new version.')
      setSaveRequestId(publishRequestId ?? presignRequestId)
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Unable to save edits.')
    } finally {
      setSaving(false)
    }
  }

  if (loading && !orgId) {
    return <GuidePageSkeleton />
  }

  if (resolveError || !orgId) {
    return (
      <ErrorNotice
        title="Unable to load workflow guide"
        message={resolveError ?? 'Workflow not found or you do not have access.'}
        requestId={requestId}
      />
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={isEditing ? 'Workflow guide editor' : 'Workflow guide'}
        title={workflow?.title ?? workflowId}
        description={`Workspace: ${orgId}`}
        actions={
          <ButtonGroup>
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
            <Button asChild variant="outline" size="sm">
              <Link href={`/dashboard/workspaces/${encodeURIComponent(orgId)}/workflows/${encodeURIComponent(workflowId)}`}>
                View workflow
              </Link>
            </Button>
            {isAdmin && !isEditing && spec && (
              <Button variant="primary" size="sm" onClick={handleStartEditing}>
                Edit
              </Button>
            )}
            {isAdmin && isEditing && (
              <>
                <Button variant="outline" size="sm" onClick={handleDoneEditing} disabled={saving}>
                  Done editing
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSaveEdits}
                  disabled={saving || !draftIsDirty}
                >
                  {saving ? 'Saving…' : 'Save as new version'}
                </Button>
              </>
            )}
          </ButtonGroup>
        }
        badges={
          isEditing && draftIsDirty ? (
            <Badge variant="warning">Unsaved edits</Badge>
          ) : undefined
        }
      />

      <Card className="p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm font-semibold text-slate-900">Version</div>
          <div className="flex flex-wrap items-center gap-2">
            <Select value={selectedVersionId ?? undefined} onValueChange={onSelectVersion}>
              <SelectTrigger className="h-9 min-w-[17rem] bg-white text-sm text-slate-800 shadow-sm">
                <SelectValue placeholder="Select a version" />
              </SelectTrigger>
              <SelectContent>
                {versions.map((version) => (
                  <SelectItem key={version.version_id} value={version.version_id}>
                    {version.version_id} ({formatDate(version.created_at)})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedVersionId && (
              <span className="text-xs text-slate-500">
                {versions.find((version) => version.version_id === selectedVersionId)?.steps_count
                  ? `${versions.find((version) => version.version_id === selectedVersionId)?.steps_count} steps`
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

      {saveError && (
        <ErrorNotice title="Unable to save edits" message={saveError} requestId={saveRequestId} />
      )}

      {saveMessage && (
        <Card className="border-emerald-200 bg-emerald-50 p-6 text-sm text-emerald-700">
          {saveMessage}
          {saveRequestId && (
            <div className="mt-2 text-xs text-emerald-700">Request ID: {saveRequestId}</div>
          )}
        </Card>
      )}

      {visibleSpec && selectedVersionId && (
        <div className="space-y-8">
          {visibleSpec.variables && visibleSpec.variables.length > 0 && (
            <Card className="p-6">
              <div className="text-xs uppercase tracking-wide text-slate-400">Variables</div>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {visibleSpec.variables.map((variable) => (
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

          <div className="space-y-4">
            {isEditing && visibleSpec.steps.length === 0 && (
              <div className="flex justify-center">
                <Button variant="outline" size="sm" onClick={() => insertDraftStep(0)}>
                  + Add first step
                </Button>
              </div>
            )}

            {visibleSpec.steps.map((step, index) => (
              <div key={step.id || `${index}`}>
                {isEditing && (
                  <div className="mb-3 flex justify-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => insertDraftStep(index)}
                    >
                      + Insert step here
                    </Button>
                  </div>
                )}
                <StepImageCard
                  orgId={orgId}
                  workflowId={workflowId}
                  versionId={selectedVersionId}
                  step={step}
                  index={index}
                  image={stepImageMap[step.id] ?? null}
                  isEditing={isEditing}
                  canMoveUp={index > 0}
                  canMoveDown={index < visibleSpec.steps.length - 1}
                  canDelete={visibleSpec.steps.length > 1}
                  onMoveUp={() => moveDraftStep(index, 'up')}
                  onMoveDown={() => moveDraftStep(index, 'down')}
                  onDelete={() => deleteDraftStep(index)}
                  onInsertAfter={() => insertDraftStep(index + 1)}
                  onStepTitleChange={(value) =>
                    updateDraftStep(index, (current) => ({
                      ...current,
                      title: value,
                    }))
                  }
                  onStepInstructionChange={(value) =>
                    updateDraftStep(index, (current) => ({
                      ...current,
                      instructions: value,
                    }))
                  }
                />
              </div>
            ))}

            {isEditing && (
              <div className="flex justify-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => insertDraftStep(visibleSpec.steps.length)}
                >
                  + Add step
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

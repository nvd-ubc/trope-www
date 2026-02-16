'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
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
import RedactionMaskEditor, {
  type GuideRedactionMask,
  type GuideRedactionMaskKind,
} from '@/components/workflow-guide/redaction-mask-editor'
import StepImageFocusEditorDialog from '@/components/workflow-guide/step-image-focus-editor-dialog'
import GuideStepImageCard from '@/components/workflow-guide/step-image-card'
import ReadonlyStepCard from '@/components/workflow-guide/readonly-step-card'
import { useCsrfToken } from '@/lib/client/use-csrf-token'
import { ErrorNotice, GuidePageSkeleton, PageHeader } from '@/components/dashboard'
import {
  buildSaveFingerprint,
  createDraftStep,
  normalizeSpecForPublish,
} from '@/lib/guide-editor'
import {
  deriveGuideStepImagesWithFocus,
  readStepScreenshotOverridesV1,
  type DerivedGuideStepImage,
  type GuideStepScreenshotOverridesV1,
} from '@/lib/guide-screenshot-focus'
import { type GuideMediaStepImage as StepImage } from '@/lib/guide-media'

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

type GuideMedia = {
  step_images: StepImage[]
}

type VersionDetailResponse = {
  version: WorkflowVersionSummary & {
    guide_media?: GuideMedia | null
    guide_redactions?: {
      key?: string | null
      download_url?: string | null
      steps_count?: number | null
      masks_count?: number | null
    } | null
  }
}

type GuideRedactionsDocument = {
  version: 'redactions.v1'
  steps: Array<{
    step_id: string
    screenshot: {
      masks: GuideRedactionMask[]
    }
  }>
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
  callout_style?: string
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

const resolveStepWhyText = (step: GuideStep): string => {
  const candidates = [
    step.why,
    step.rationale,
    step.reason,
    step.why_this_matters,
    step.why_this_step,
    step.justification,
  ]
  for (const candidate of candidates) {
    if (typeof candidate === 'string') {
      const trimmed = candidate.trim()
      if (trimmed) return trimmed
    }
  }
  return ''
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

type GuideBootstrapResponse = {
  orgId?: string | null
  orgName?: string | null
  workflow?: WorkflowDetailResponse | null
  versions?: WorkflowVersionSummary[] | null
  membershipRole?: string | null
  selectedVersionId?: string | null
  spec?: GuideSpec | null
  versionDetail?: VersionDetailResponse['version'] | null
  guideRedactions?: GuideRedactionsDocument | null
  specError?: string | null
  error?: string
}

const resolveCalloutStyle = (step: GuideStep): 'tip' | 'note' | 'alert' => {
  const explicit = (step.callout_style ?? '').trim().toLowerCase()
  if (explicit === 'tip' || explicit === 'note' || explicit === 'alert') {
    return explicit
  }

  const title = step.title.trim().toLowerCase()
  if (title.startsWith('tip:')) return 'tip'
  if (title.startsWith('alert:') || title.startsWith('warning:')) return 'alert'
  return 'note'
}

const calloutToneClass = (style: 'tip' | 'note' | 'alert') => {
  switch (style) {
    case 'tip':
      return {
        container: 'border-emerald-200 bg-emerald-50',
        badge: 'bg-emerald-100 text-emerald-700',
      }
    case 'alert':
      return {
        container: 'border-amber-200 bg-amber-50',
        badge: 'bg-amber-100 text-amber-700',
      }
    default:
      return {
        container: 'border-sky-200 bg-sky-50',
        badge: 'bg-sky-100 text-sky-700',
      }
  }
}

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value)

const cloneSpec = (spec: GuideSpec): GuideSpec => JSON.parse(JSON.stringify(spec)) as GuideSpec

const clampUnit = (value: unknown): number | null => {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null
  return Math.max(0, Math.min(1, value))
}

const normalizeGuideRedactionMask = (value: unknown): GuideRedactionMask | null => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  const record = value as Record<string, unknown>
  const kindRaw = typeof record.kind === 'string' ? record.kind.trim().toLowerCase() : 'blur'
  const kind: GuideRedactionMaskKind =
    kindRaw === 'solid' || kindRaw === 'pixelate' || kindRaw === 'blur' ? kindRaw : 'blur'
  const rectValue =
    record.rect && typeof record.rect === 'object' && !Array.isArray(record.rect)
      ? (record.rect as Record<string, unknown>)
      : null
  if (!rectValue) return null
  const x = clampUnit(rectValue.x)
  const y = clampUnit(rectValue.y)
  const width = clampUnit(rectValue.width)
  const height = clampUnit(rectValue.height)
  if (x === null || y === null || width === null || height === null || width <= 0 || height <= 0) {
    return null
  }
  const id =
    typeof record.id === 'string' && record.id.trim().length > 0
      ? record.id.trim()
      : `mask_${Math.random().toString(36).slice(2, 10)}`
  const strength =
    typeof record.strength === 'number' && Number.isFinite(record.strength)
      ? Math.max(0, Math.min(1, record.strength))
      : undefined
  const color =
    typeof record.color === 'string' && record.color.trim().length > 0
      ? record.color.trim()
      : undefined

  return {
    id,
    kind,
    rect: { x, y, width, height },
    strength,
    color,
  }
}

const parseGuideRedactionsDocument = (value: unknown): GuideRedactionsDocument | null => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  const record = value as Record<string, unknown>
  if (record.version !== 'redactions.v1') return null
  const stepsRaw = Array.isArray(record.steps) ? record.steps : []
  const steps: GuideRedactionsDocument['steps'] = []
  for (const stepRaw of stepsRaw) {
    if (!stepRaw || typeof stepRaw !== 'object' || Array.isArray(stepRaw)) continue
    const stepRecord = stepRaw as Record<string, unknown>
    const stepId = typeof stepRecord.step_id === 'string' ? stepRecord.step_id.trim() : ''
    if (!stepId) continue
    const screenshot =
      stepRecord.screenshot && typeof stepRecord.screenshot === 'object' && !Array.isArray(stepRecord.screenshot)
        ? (stepRecord.screenshot as Record<string, unknown>)
        : null
    const masksRaw = screenshot && Array.isArray(screenshot.masks) ? screenshot.masks : []
    const masks = masksRaw
      .map((mask) => normalizeGuideRedactionMask(mask))
      .filter((mask): mask is GuideRedactionMask => Boolean(mask))
    if (masks.length === 0) continue
    steps.push({
      step_id: stepId,
      screenshot: { masks },
    })
  }
  return { version: 'redactions.v1', steps }
}

const buildRedactionMaskMap = (
  document: GuideRedactionsDocument | null
): Record<string, GuideRedactionMask[]> => {
  const map: Record<string, GuideRedactionMask[]> = {}
  for (const step of document?.steps ?? []) {
    map[step.step_id] = [...step.screenshot.masks]
  }
  return map
}

const buildGuideRedactionsDocument = (
  masksByStepId: Record<string, GuideRedactionMask[]>
): GuideRedactionsDocument => {
  const steps = Object.entries(masksByStepId)
    .map(([stepId, masks]) => ({
      step_id: stepId,
      screenshot: {
        masks: masks
          .filter((mask) => mask.rect.width > 0 && mask.rect.height > 0)
          .map((mask) => ({
            id: mask.id,
            kind: mask.kind,
            rect: {
              x: Math.max(0, Math.min(1, mask.rect.x)),
              y: Math.max(0, Math.min(1, mask.rect.y)),
              width: Math.max(0, Math.min(1, mask.rect.width)),
              height: Math.max(0, Math.min(1, mask.rect.height)),
            },
            strength:
              typeof mask.strength === 'number'
                ? Math.max(0, Math.min(1, mask.strength))
                : undefined,
            color: mask.kind === 'solid' ? mask.color ?? '#000000' : undefined,
          })),
      },
    }))
    .filter((step) => step.screenshot.masks.length > 0)
    .sort((left, right) => left.step_id.localeCompare(right.step_id))

  return {
    version: 'redactions.v1',
    steps,
  }
}

const stableRedactionFingerprint = (masksByStepId: Record<string, GuideRedactionMask[]>): string =>
  JSON.stringify(buildGuideRedactionsDocument(masksByStepId))

const cloneRedactionMaskMap = (
  masksByStepId: Record<string, GuideRedactionMask[]>
): Record<string, GuideRedactionMask[]> =>
  JSON.parse(JSON.stringify(masksByStepId)) as Record<string, GuideRedactionMask[]>

type SaveVisibility = 'org' | 'private'

const EMPTY_REDACTION_FINGERPRINT = stableRedactionFingerprint({})

const normalizeRedactionMaskMapForSteps = (
  masksByStepId: Record<string, GuideRedactionMask[]>,
  steps: GuideStep[]
): Record<string, GuideRedactionMask[]> => {
  const allowedStepIds = new Set(
    steps
      .map((step) => (typeof step.id === 'string' ? step.id.trim() : ''))
      .filter((stepId) => stepId.length > 0)
  )
  const normalized: Record<string, GuideRedactionMask[]> = {}
  for (const [stepId, masks] of Object.entries(masksByStepId)) {
    if (!allowedStepIds.has(stepId)) continue
    const normalizedMasks = masks
      .map((mask) => normalizeGuideRedactionMask(mask))
      .filter((mask): mask is GuideRedactionMask => Boolean(mask))
    if (normalizedMasks.length > 0) {
      normalized[stepId] = normalizedMasks
    }
  }
  return normalized
}

const StepImageCard = ({
  csrfToken,
  orgId,
  workflowId,
  versionId,
  step,
  index,
  image,
  derivedFocusSource,
  clampedFromStepNumber,
  isEditing,
  canMoveUp,
  canMoveDown,
  canDelete,
  onMoveUp,
  onMoveDown,
  onDelete,
  onInsertAfter,
  onCopyStepLink,
  onStepTitleChange,
  onStepInstructionChange,
  showFocusEditor,
  onToggleFocusEditor,
  onScreenshotOverridesSave,
  onScreenshotOverridesReset,
  redactionMasks,
  lockedMaskIds,
  onRedactionMasksChange,
  showRedactionEditor,
  onToggleRedactionEditor,
}: {
  csrfToken: string | null
  orgId: string
  workflowId: string
  versionId: string
  step: GuideStep
  index: number
  image: StepImage | null
  derivedFocusSource: DerivedGuideStepImage['focusSource'] | null
  clampedFromStepNumber: number | null
  isEditing: boolean
  canMoveUp: boolean
  canMoveDown: boolean
  canDelete: boolean
  onMoveUp: () => void
  onMoveDown: () => void
  onDelete: () => void
  onInsertAfter: () => void
  onCopyStepLink: () => void
  onStepTitleChange: (value: string) => void
  onStepInstructionChange: (value: string) => void
  showFocusEditor: boolean
  onToggleFocusEditor: () => void
  onScreenshotOverridesSave: (overrides: GuideStepScreenshotOverridesV1) => void
  onScreenshotOverridesReset: () => void
  redactionMasks: GuideRedactionMask[]
  lockedMaskIds: string[]
  onRedactionMasksChange: (masks: GuideRedactionMask[]) => void
  showRedactionEditor: boolean
  onToggleRedactionEditor: () => void
}) => {
  const isManual = (step.kind ?? '').trim().toLowerCase() === 'manual'
  const calloutStyle = resolveCalloutStyle(step)
  const calloutTone = calloutToneClass(calloutStyle)
  const whyText = resolveStepWhyText(step)
  const instructionText =
    typeof step.instructions === 'string' && step.instructions.trim().length > 0
      ? step.instructions.trim()
      : step.title

  const screenshotOverrides = readStepScreenshotOverridesV1(step)

  const toPositiveFinite = (value: unknown): number | null =>
    typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : null

  const resolvedImageWidth =
    toPositiveFinite(image?.width) ??
    toPositiveFinite(image?.variants?.full?.width) ??
    toPositiveFinite(image?.variants?.preview?.width) ??
    null
  const resolvedImageHeight =
    toPositiveFinite(image?.height) ??
    toPositiveFinite(image?.variants?.full?.height) ??
    toPositiveFinite(image?.variants?.preview?.height) ??
    null
  const imageWidth = resolvedImageWidth ?? 1
  const imageHeight = resolvedImageHeight ?? 1

  const previewSrc = image
    ? `/api/orgs/${encodeURIComponent(orgId)}/workflows/${encodeURIComponent(
        workflowId
      )}/versions/${encodeURIComponent(versionId)}/media/steps/${encodeURIComponent(
        step.id
      )}?variant=preview`
    : null
  const fullSrc = image
    ? `/api/orgs/${encodeURIComponent(orgId)}/workflows/${encodeURIComponent(
        workflowId
      )}/versions/${encodeURIComponent(versionId)}/media/steps/${encodeURIComponent(
        step.id
      )}?variant=full`
    : null

  const radar = image?.radar ?? null
  const initialCursorAuto =
    radar &&
    radar.coordinate_space === 'step_image_pixels_v1' &&
    isFiniteNumber(radar.x) &&
    isFiniteNumber(radar.y) &&
    resolvedImageWidth &&
    resolvedImageHeight
      ? {
          x: Math.max(0, Math.min(1, radar.x / resolvedImageWidth)),
          y: Math.max(0, Math.min(1, radar.y / resolvedImageHeight)),
        }
      : null

  const sendGuideEvent = (
    eventType:
      | 'workflow_doc_focus_applied'
      | 'workflow_doc_focus_fallback'
      | 'workflow_doc_step_image_open_full',
    properties: Record<string, unknown>
  ) => {
    if (!csrfToken) return
    fetch(
      `/api/orgs/${encodeURIComponent(orgId)}/workflows/${encodeURIComponent(workflowId)}/events`,
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-csrf-token': csrfToken,
        },
        body: JSON.stringify({
          event_type: eventType,
          surface: 'web_guide_doc',
          ...properties,
        }),
      }
    ).catch(() => {
      // Ignore telemetry failures.
    })
  }

  if (!isEditing) {
    return (
      <ReadonlyStepCard
        step={step}
        index={index}
        image={image}
        previewSrc={previewSrc}
        fullSrc={fullSrc}
        imageMaxHeightClass="max-h-[27rem]"
        onTelemetryEvent={sendGuideEvent}
        onCopyStepLink={onCopyStepLink}
        instructionText={instructionText}
        whyText={whyText}
        manualCallout={
          isManual
            ? {
                label: calloutStyle,
                instructionText: step.instructions,
                containerClassName: calloutTone.container,
                badgeClassName: calloutTone.badge,
              }
            : null
        }
      />
    )
  }

  return (
    <div className="group/step rounded-2xl border border-slate-200 bg-white p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xl font-semibold text-[color:var(--trope-accent)]">
              {index + 1}
            </div>
            <div className="min-w-0 flex-1">
              <InputGroup>
                <InputGroupInput
                  value={step.title}
                  onChange={(event) => onStepTitleChange(event.target.value)}
                  className="h-10 text-base font-semibold text-slate-900 sm:text-lg"
                  placeholder={`Step ${index + 1}`}
                />
              </InputGroup>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
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
        </div>
      </div>

      {isManual ? (
        <div className={`mt-4 rounded-xl border px-4 py-3 ${calloutTone.container}`}>
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${calloutTone.badge}`}
          >
            {calloutStyle}
          </span>
          <p className="mt-2 text-sm text-slate-700">{step.instructions}</p>
        </div>
      ) : (
        <>
          <GuideStepImageCard
            step={step}
            image={image}
            previewSrc={previewSrc}
            fullSrc={fullSrc}
            maxHeightClass="max-h-[27rem]"
            onTelemetryEvent={sendGuideEvent}
          />

          {radar && isFiniteNumber(radar.x) && isFiniteNumber(radar.y) && (
            <div className="mt-2 text-xs text-slate-500">
              Click hotspot: x={Math.round(radar.x)}, y={Math.round(radar.y)}
            </div>
          )}

          {fullSrc && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Button variant="outline" size="sm" onClick={onToggleFocusEditor}>
                {showFocusEditor ? 'Hide focus editor' : 'Edit focus'}
              </Button>
              <Button variant="outline" size="sm" onClick={onToggleRedactionEditor}>
                {showRedactionEditor ? 'Hide redaction editor' : 'Edit redactions'}
              </Button>
            </div>
          )}

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge
              variant={
                derivedFocusSource === 'manual_override'
                  ? 'info'
                  : derivedFocusSource === 'clamped_click'
                    ? 'warning'
                    : derivedFocusSource === 'center_fallback'
                      ? 'outline'
                      : 'neutral'
              }
              className="text-[11px]"
            >
              Focus:{' '}
              {derivedFocusSource === 'manual_override'
                ? 'manual'
                : derivedFocusSource === 'clamped_click'
                  ? 'clamped'
                  : derivedFocusSource === 'center_fallback'
                    ? 'fallback'
                    : 'auto'}
              {derivedFocusSource === 'clamped_click' && clampedFromStepNumber
                ? ` (from step ${clampedFromStepNumber})`
                : ''}
            </Badge>
            {screenshotOverrides?.cursor?.point_unit && (
              <Badge variant="outline" className="text-[11px]">
                Cursor override
              </Badge>
            )}
          </div>

          {fullSrc && showRedactionEditor && (
            <RedactionMaskEditor
              imageSrc={fullSrc}
              masks={redactionMasks}
              lockedMaskIds={lockedMaskIds}
              onChange={onRedactionMasksChange}
            />
          )}

          {fullSrc && showFocusEditor && (
            <StepImageFocusEditorDialog
              open={showFocusEditor}
              onOpenChange={(next) => {
                if (!next) onToggleFocusEditor()
              }}
              stepTitle={step.title}
              imageSrc={fullSrc}
              imageWidth={imageWidth}
              imageHeight={imageHeight}
              initialRenderHints={image?.render_hints ?? null}
              initialCursorAuto={initialCursorAuto}
              initialOverrides={screenshotOverrides}
              onSave={onScreenshotOverridesSave}
              onReset={onScreenshotOverridesReset}
            />
          )}
        </>
      )}

      <Textarea
        value={step.instructions}
        onChange={(event) => onStepInstructionChange(event.target.value)}
        className="mt-4 text-sm text-slate-700"
        rows={3}
        placeholder="Describe the action clearly."
      />
    </div>
  )
}

export default function WorkflowGuideClient({ workflowId }: { workflowId: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { token: csrfToken } = useCsrfToken()
  const skipInitialSpecFetchRef = useRef(false)

  const versionIdParam = (searchParams.get('versionId') ?? '').trim()

  const [orgId, setOrgId] = useState<string | null>(null)
  const [orgName, setOrgName] = useState<string | null>(null)
  const [resolveError, setResolveError] = useState<string | null>(null)
  const [requestId, setRequestId] = useState<string | null>(null)

  const [workflow, setWorkflow] = useState<WorkflowDefinition | null>(null)
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null)
  const [versionDetail, setVersionDetail] = useState<VersionDetailResponse['version'] | null>(null)
  const [membershipRole, setMembershipRole] = useState<string | null>(null)

  const [spec, setSpec] = useState<GuideSpec | null>(null)
  const [draftSpec, setDraftSpec] = useState<GuideSpec | null>(null)
  const [baselineFingerprint, setBaselineFingerprint] = useState<string | null>(null)
  const [redactionMasksByStepId, setRedactionMasksByStepId] = useState<
    Record<string, GuideRedactionMask[]>
  >({})
  const [draftRedactionMasksByStepId, setDraftRedactionMasksByStepId] = useState<
    Record<string, GuideRedactionMask[]>
  >({})
  const [baselineRedactionFingerprint, setBaselineRedactionFingerprint] = useState<string>(
    EMPTY_REDACTION_FINGERPRINT
  )
  const [saveVisibility, setSaveVisibility] = useState<SaveVisibility>('org')
  const [loading, setLoading] = useState(true)
  const [specLoading, setSpecLoading] = useState(false)
  const [specError, setSpecError] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)
  const [saveRequestId, setSaveRequestId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const isEditingRef = useRef(false)
  const redactionDraftTouchedRef = useRef(false)
  const [activeStepId, setActiveStepId] = useState<string | null>(null)
  const [openRedactionEditorStepId, setOpenRedactionEditorStepId] = useState<string | null>(null)
  const [openFocusEditorStepId, setOpenFocusEditorStepId] = useState<string | null>(null)
  const stepCardRefs = useRef<Record<string, HTMLDivElement | null>>({})

  const isAdmin = membershipRole === 'org_owner' || membershipRole === 'org_admin'

  useEffect(() => {
    isEditingRef.current = isEditing
  }, [isEditing])

  useEffect(() => {
    let active = true
    const load = async () => {
      setLoading(true)
      setResolveError(null)
      setOrgId(null)
      setOrgName(null)
      setRequestId(null)
      setSpecError(null)
      try {
        const params = new URLSearchParams()
        if (versionIdParam) {
          params.set('versionId', versionIdParam)
        }
        const response = await fetch(
          `/api/workflows/${encodeURIComponent(workflowId)}/guide/bootstrap${
            params.toString() ? `?${params.toString()}` : ''
          }`,
          { cache: 'no-store' }
        )
        if (response.status === 401) {
          router.replace(`/signin?next=/dashboard/workflows/${encodeURIComponent(workflowId)}/guide`)
          return
        }

        const payload = (await response.json().catch(() => null)) as GuideBootstrapResponse | null
        if (!response.ok || !payload?.orgId || !payload?.workflow?.workflow) {
          setRequestId(response.headers.get('x-trope-request-id'))
          throw new Error(payload?.error || 'Workflow not found or you do not have access.')
        }

        if (!active) return
        const orgIdentifier = payload.orgId
        setOrgId(orgIdentifier)
        setOrgName(payload.orgName?.trim() || null)
        setWorkflow(payload.workflow.workflow)
        setMembershipRole(payload.membershipRole ?? null)
        setSelectedVersionId(payload.selectedVersionId ?? null)

        const queryParams = new URLSearchParams(window.location.search)
        const currentOrgId = (queryParams.get('orgId') ?? '').trim()
        if (currentOrgId !== orgIdentifier) {
          queryParams.set('orgId', orgIdentifier)
          const query = queryParams.toString()
          router.replace(
            `/dashboard/workflows/${encodeURIComponent(workflowId)}/guide${query ? `?${query}` : ''}`
          )
        }

        if (payload.selectedVersionId && payload.spec && payload.versionDetail) {
          const normalized = normalizeSpecForPublish(
            payload.spec,
            payload.workflow.workflow.title ?? payload.spec.workflow_title ?? workflowId
          )
          const parsedGuideRedactions = parseGuideRedactionsDocument(payload.guideRedactions)
          const normalizedRedactionMasksByStepId = normalizeRedactionMaskMapForSteps(
            buildRedactionMaskMap(parsedGuideRedactions),
            normalized.steps
          )
          setVersionDetail(payload.versionDetail)
          setSpec(normalized)
          setDraftSpec(cloneSpec(normalized))
          setBaselineFingerprint(
            buildSaveFingerprint(
              normalized,
              payload.workflow.workflow.title ?? normalized.workflow_title ?? workflowId
            )
          )
          setRedactionMasksByStepId(normalizedRedactionMasksByStepId)
          setDraftRedactionMasksByStepId(cloneRedactionMaskMap(normalizedRedactionMasksByStepId))
          setBaselineRedactionFingerprint(stableRedactionFingerprint(normalizedRedactionMasksByStepId))
          setSaveVisibility('org')
          setOpenRedactionEditorStepId(null)
          setOpenFocusEditorStepId(null)
          redactionDraftTouchedRef.current = false
          setIsEditing(false)
          setSpecError(null)
          skipInitialSpecFetchRef.current = true
        } else {
          setVersionDetail(null)
          setSpec(null)
          setDraftSpec(null)
          setBaselineFingerprint(null)
          setRedactionMasksByStepId({})
          setDraftRedactionMasksByStepId({})
          setBaselineRedactionFingerprint(EMPTY_REDACTION_FINGERPRINT)
          setOpenRedactionEditorStepId(null)
          setOpenFocusEditorStepId(null)
          redactionDraftTouchedRef.current = false
          setSpecError(payload.specError ?? null)
        }
      } catch (err) {
        if (!active) return
        setResolveError(err instanceof Error ? err.message : 'Unable to load workflow guide.')
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [router, versionIdParam, workflowId])

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
      setRedactionMasksByStepId({})
      setDraftRedactionMasksByStepId({})
      setBaselineRedactionFingerprint(EMPTY_REDACTION_FINGERPRINT)
      setSaveVisibility('org')
      setOpenRedactionEditorStepId(null)
      setOpenFocusEditorStepId(null)
      redactionDraftTouchedRef.current = false
      return
    }

    if (skipInitialSpecFetchRef.current) {
      skipInitialSpecFetchRef.current = false
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
          throw new Error('Unable to load release details.')
        }
        const versionPayload = (await versionResponse.json().catch(() => null)) as
          | VersionDetailResponse
          | null
        if (!versionPayload?.version) {
          throw new Error('Unable to load release details.')
        }

        if (!specResponse.ok) {
          throw new Error('Guide spec is not available for this release.')
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
        setRedactionMasksByStepId({})
        setDraftRedactionMasksByStepId({})
        setBaselineRedactionFingerprint(EMPTY_REDACTION_FINGERPRINT)
        setSaveVisibility('org')
        setOpenRedactionEditorStepId(null)
        setOpenFocusEditorStepId(null)
        redactionDraftTouchedRef.current = false
        setIsEditing(false)

        const loadRedactions = async () => {
          try {
            const redactionsResponse = await fetch(
              `/api/orgs/${encodeURIComponent(orgId)}/workflows/${encodeURIComponent(
                workflowId
              )}/versions/${encodeURIComponent(selectedVersionId)}/guide-redactions`,
              { cache: 'no-store' }
            )
            const redactionsJson =
              redactionsResponse.ok || redactionsResponse.status === 404
                ? await redactionsResponse.json().catch(() => null)
                : null
            const parsedGuideRedactions = parseGuideRedactionsDocument(redactionsJson)
            const normalizedRedactionMasksByStepId = normalizeRedactionMaskMapForSteps(
              buildRedactionMaskMap(parsedGuideRedactions),
              normalized.steps
            )
            if (!active) return
            setRedactionMasksByStepId(normalizedRedactionMasksByStepId)
            setBaselineRedactionFingerprint(stableRedactionFingerprint(normalizedRedactionMasksByStepId))
            if (!isEditingRef.current || !redactionDraftTouchedRef.current) {
              setDraftRedactionMasksByStepId(cloneRedactionMaskMap(normalizedRedactionMasksByStepId))
            }
          } catch {
            // Keep current redaction state when optional fetch fails.
          }
        }
        void loadRedactions()
      } catch (err) {
        if (!active) return
        setSpec(null)
        setDraftSpec(null)
        setVersionDetail(null)
        setRedactionMasksByStepId({})
        setDraftRedactionMasksByStepId({})
        setBaselineRedactionFingerprint(EMPTY_REDACTION_FINGERPRINT)
        setSaveVisibility('org')
        setOpenRedactionEditorStepId(null)
        setOpenFocusEditorStepId(null)
        redactionDraftTouchedRef.current = false
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

  const visibleSpec = isEditing ? draftSpec : spec

  const derivedStepImages = useMemo(() => {
    const steps = Array.isArray(visibleSpec?.steps) ? visibleSpec.steps : []
    const stepImages = versionDetail?.guide_media?.step_images ?? []
    return deriveGuideStepImagesWithFocus({
      steps: steps as unknown as Array<{
        id: string
        kind?: string | null
        expected_event?: unknown
        [key: string]: unknown
      }>,
      stepImages,
    })
  }, [versionDetail?.guide_media?.step_images, visibleSpec?.steps])

  const draftSpecIsDirty = useMemo(() => {
    if (!isEditing || !draftSpec || !baselineFingerprint) return false
    const fingerprint = buildSaveFingerprint(draftSpec, workflow?.title ?? workflowId)
    return fingerprint !== baselineFingerprint
  }, [baselineFingerprint, draftSpec, isEditing, workflow?.title, workflowId])

  const normalizedDraftRedactionMasksByStepId = useMemo(
    () =>
      normalizeRedactionMaskMapForSteps(
        draftRedactionMasksByStepId,
        Array.isArray(draftSpec?.steps) ? draftSpec.steps : []
      ),
    [draftRedactionMasksByStepId, draftSpec?.steps]
  )

  const draftRedactionsAreDirty = useMemo(() => {
    if (!isEditing) return false
    const draftFingerprint = stableRedactionFingerprint(normalizedDraftRedactionMasksByStepId)
    return draftFingerprint !== baselineRedactionFingerprint
  }, [baselineRedactionFingerprint, isEditing, normalizedDraftRedactionMasksByStepId])

  const draftIsDirty = draftSpecIsDirty || draftRedactionsAreDirty

  const stepEntries = useMemo(
    () => (visibleSpec?.steps ?? []).map((step, index) => ({ step, index })),
    [visibleSpec?.steps]
  )
  const filteredStepEntries = stepEntries
  const stepNumberById = useMemo(() => {
    const map: Record<string, number> = {}
    const steps = visibleSpec?.steps ?? []
    for (let index = 0; index < steps.length; index += 1) {
      const step = steps[index]
      const stepId = typeof step?.id === 'string' ? step.id : null
      if (!stepId) continue
      map[stepId] = index + 1
    }
    return map
  }, [visibleSpec?.steps])

  useEffect(() => {
    if (!isEditing) {
      setOpenRedactionEditorStepId(null)
      return
    }
    if (!openRedactionEditorStepId) return
    const steps = Array.isArray(draftSpec?.steps) ? draftSpec.steps : []
    if (!steps.some((step) => step.id === openRedactionEditorStepId)) {
      setOpenRedactionEditorStepId(null)
    }
  }, [draftSpec?.steps, isEditing, openRedactionEditorStepId])

  useEffect(() => {
    if (!isEditing) {
      setOpenFocusEditorStepId(null)
      return
    }
    if (!openFocusEditorStepId) return
    const steps = Array.isArray(draftSpec?.steps) ? draftSpec.steps : []
    if (!steps.some((step) => step.id === openFocusEditorStepId)) {
      setOpenFocusEditorStepId(null)
    }
  }, [draftSpec?.steps, isEditing, openFocusEditorStepId])

  const setStepHash = (stepId: string) => {
    if (typeof window === 'undefined') return
    const url = new URL(window.location.href)
    url.hash = `step=${encodeURIComponent(stepId)}`
    window.history.replaceState(null, '', url)
  }

  const readStepFromHash = (): string | null => {
    if (typeof window === 'undefined') return null
    const hash = window.location.hash
    if (!hash.startsWith('#step=')) return null
    const raw = hash.slice('#step='.length)
    if (!raw) return null
    try {
      return decodeURIComponent(raw)
    } catch {
      return raw
    }
  }

  const focusStep = (stepId: string, behavior: ScrollBehavior = 'smooth') => {
    const node = stepCardRefs.current[stepId]
    if (node) {
      node.scrollIntoView({ behavior, block: 'start' })
    }
    setActiveStepId(stepId)
    setStepHash(stepId)
  }

  const copyStepLink = async (stepId: string, stepTitle?: string) => {
    if (typeof window === 'undefined') return
    const titleLabel =
      typeof stepTitle === 'string' && stepTitle.trim().length > 0 ? stepTitle.trim() : stepId
    try {
      const url = new URL(window.location.href)
      url.hash = `step=${encodeURIComponent(stepId)}`
      await navigator.clipboard.writeText(url.toString())
      toast.success(`Copied link for ${titleLabel}.`)
    } catch {
      // Ignore clipboard failures.
    }
  }

  useEffect(() => {
    if (filteredStepEntries.length === 0) {
      setActiveStepId(null)
      return
    }
    if (
      !activeStepId ||
      !filteredStepEntries.some((entry) => entry.step.id === activeStepId)
    ) {
      setActiveStepId(filteredStepEntries[0]?.step.id ?? null)
    }
  }, [activeStepId, filteredStepEntries])

  useEffect(() => {
    if (typeof window === 'undefined' || filteredStepEntries.length === 0) return
    const hashStep = readStepFromHash()
    if (!hashStep) return
    if (!filteredStepEntries.some((entry) => entry.step.id === hashStep)) return
    const frame = window.requestAnimationFrame(() => {
      const node = stepCardRefs.current[hashStep]
      if (node) {
        node.scrollIntoView({ behavior: 'auto', block: 'start' })
      }
      setActiveStepId(hashStep)
    })
    return () => window.cancelAnimationFrame(frame)
  }, [filteredStepEntries, selectedVersionId])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const handleHashChange = () => {
      const hashStep = readStepFromHash()
      if (!hashStep) return
      if (!filteredStepEntries.some((entry) => entry.step.id === hashStep)) return
      const node = stepCardRefs.current[hashStep]
      if (node) {
        node.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
      setActiveStepId(hashStep)
    }

    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [filteredStepEntries])

  useEffect(() => {
    if (typeof window === 'undefined' || filteredStepEntries.length === 0) return
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (a, b) =>
              Math.abs(a.boundingClientRect.top) - Math.abs(b.boundingClientRect.top)
          )
        const nextId = visible[0]?.target.getAttribute('data-step-id')
        if (nextId) {
          setActiveStepId(nextId)
        }
      },
      {
        root: null,
        threshold: [0.25, 0.5, 0.75],
        rootMargin: '-20% 0px -55% 0px',
      }
    )

    for (const entry of filteredStepEntries) {
      const node = stepCardRefs.current[entry.step.id]
      if (node) observer.observe(node)
    }

    return () => observer.disconnect()
  }, [filteredStepEntries])

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
    const deletedStepId =
      draftSpec && Array.isArray(draftSpec.steps) && draftSpec.steps[index]
        ? String((draftSpec.steps[index] as GuideStep).id ?? '').trim()
        : ''
    setDraftSpec((prev) => {
      if (!prev || !Array.isArray(prev.steps) || prev.steps.length <= 1) return prev
      const steps = prev.steps.filter((_, stepIndex) => stepIndex !== index)
      return { ...prev, steps }
    })
    if (deletedStepId) {
      setDraftRedactionMasksByStepId((prev) => {
        if (!Object.prototype.hasOwnProperty.call(prev, deletedStepId)) return prev
        const next = cloneRedactionMaskMap(prev)
        delete next[deletedStepId]
        return next
      })
      setOpenRedactionEditorStepId((current) => (current === deletedStepId ? null : current))
      setOpenFocusEditorStepId((current) => (current === deletedStepId ? null : current))
    }
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
    const normalizedRedactionMasksByStepId = normalizeRedactionMaskMapForSteps(redactionMasksByStepId, spec.steps)
    setDraftRedactionMasksByStepId(cloneRedactionMaskMap(normalizedRedactionMasksByStepId))
    setBaselineRedactionFingerprint(stableRedactionFingerprint(normalizedRedactionMasksByStepId))
    setSaveVisibility('org')
    setOpenRedactionEditorStepId(null)
    setOpenFocusEditorStepId(null)
    redactionDraftTouchedRef.current = false
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
      const normalizedRedactionMasksByStepId = normalizeRedactionMaskMapForSteps(
        redactionMasksByStepId,
        spec.steps
      )
      setDraftRedactionMasksByStepId(cloneRedactionMaskMap(normalizedRedactionMasksByStepId))
      setBaselineRedactionFingerprint(stableRedactionFingerprint(normalizedRedactionMasksByStepId))
    } else {
      setDraftSpec(null)
      setBaselineFingerprint(null)
      setDraftRedactionMasksByStepId({})
      setBaselineRedactionFingerprint(EMPTY_REDACTION_FINGERPRINT)
    }
    setSaveVisibility('org')
    setOpenRedactionEditorStepId(null)
    setOpenFocusEditorStepId(null)
    redactionDraftTouchedRef.current = false
    setSaveError(null)
    setSaveMessage(null)
    setSaveRequestId(null)
    setIsEditing(false)
  }

  const handleSaveEdits = async () => {
    if (!csrfToken || !orgId || !selectedVersionId || !draftSpec) return
    if (draftRedactionsAreDirty) {
      const shouldProceed = window.confirm(
        'Screenshot redactions are permanent, apply to all workflow versions, and cannot be undone. Continue?'
      )
      if (!shouldProceed) return
    }
    setSaving(true)
    setSaveError(null)
    setSaveMessage(null)
    setSaveRequestId(null)

    try {
      const normalizedSpec = normalizeSpecForPublish(draftSpec, workflow?.title ?? workflowId)
      if (!Array.isArray(normalizedSpec.steps) || normalizedSpec.steps.length === 0) {
        throw new Error('At least one step is required before saving.')
      }
      const normalizedRedactionMasks = normalizeRedactionMaskMapForSteps(
        draftRedactionMasksByStepId,
        normalizedSpec.steps
      )
      const redactionsFingerprint = stableRedactionFingerprint(normalizedRedactionMasks)
      const shouldUploadRedactions = redactionsFingerprint !== baselineRedactionFingerprint
      const redactionsDocument = buildGuideRedactionsDocument(normalizedRedactionMasks)

      const artifactsToPresign: Array<{
        name: string
        filename: string
        content_type: string
      }> = [
        {
          name: 'guide_spec_override',
          filename: `guide-spec-edited-${Date.now()}.json`,
          content_type: 'application/json',
        },
      ]
      if (shouldUploadRedactions) {
        artifactsToPresign.push({
          name: 'guide_redactions_override',
          filename: `guide-redactions-edited-${Date.now()}.json`,
          content_type: 'application/json',
        })
      }

      const presignResponse = await fetch('/api/artifacts/presign', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-csrf-token': csrfToken,
        },
        body: JSON.stringify({
          org_id: orgId,
          artifacts: artifactsToPresign,
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

      const specArtifact = (presignPayload?.artifacts ?? []).find(
        (artifact) => artifact.name === 'guide_spec_override'
      )
      const specUploadUrl = specArtifact?.upload_url ?? ''
      const specArtifactKey = specArtifact?.key ?? ''
      if (!specUploadUrl || !specArtifactKey) {
        throw new Error('Artifact upload details are missing.')
      }
      const redactionsArtifact = shouldUploadRedactions
        ? (presignPayload?.artifacts ?? []).find(
            (artifact) => artifact.name === 'guide_redactions_override'
          )
        : null
      const redactionsUploadUrl = redactionsArtifact?.upload_url ?? ''
      const redactionsArtifactKey = redactionsArtifact?.key ?? ''
      if (shouldUploadRedactions && (!redactionsUploadUrl || !redactionsArtifactKey)) {
        throw new Error('Guide redaction upload details are missing.')
      }

      const uploadResponse = await fetch(specUploadUrl, {
        method: 'PUT',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify(normalizedSpec),
      })
      if (!uploadResponse.ok) {
        throw new Error('Unable to upload edited guide spec.')
      }
      if (shouldUploadRedactions) {
        const redactionsUploadResponse = await fetch(redactionsUploadUrl, {
          method: 'PUT',
          headers: {
            'content-type': 'application/json',
          },
          body: JSON.stringify(redactionsDocument),
        })
        if (!redactionsUploadResponse.ok) {
          throw new Error('Unable to upload guide redactions.')
        }
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
            guide_spec_override_key: specArtifactKey,
            guide_redactions_override_key: shouldUploadRedactions ? redactionsArtifactKey : undefined,
            visibility: saveVisibility,
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
          publishPayload?.message || 'Unable to publish edited guide release.'
        )
      }

      const nextVersionId = publishPayload.version.version_id
      setSelectedVersionId(nextVersionId)
      const params = new URLSearchParams(searchParams.toString())
      params.set('versionId', nextVersionId)
      router.replace(`/dashboard/workflows/${encodeURIComponent(workflowId)}/guide?${params.toString()}`)
      setIsEditing(false)
      setSaveVisibility('org')
      setSaveMessage(
        saveVisibility === 'private'
          ? 'Edits saved as a private draft.'
          : 'Edits saved as a new org release.'
      )
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
        description={`Workspace: ${orgName || orgId}`}
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
                  {saving
                    ? 'Saving…'
                    : saveVisibility === 'private'
                      ? 'Save as private draft'
                      : 'Save as new org release'}
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

      {isAdmin && isEditing && (
        <Card className="p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-slate-900">Save target</div>
              <p className="mt-1 text-xs text-slate-500">
                Private drafts are visible only to you until published to the org.
              </p>
            </div>
            <Select
              value={saveVisibility}
              onValueChange={(value: SaveVisibility) => setSaveVisibility(value)}
              disabled={saving}
            >
              <SelectTrigger className="h-9 min-w-[15rem] bg-white text-sm text-slate-800 shadow-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="org">Org release</SelectItem>
                <SelectItem value="private">Private draft (only me)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>
      )}

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
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
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

              {!isEditing && filteredStepEntries.length === 0 && (
                <Card className="p-5 text-sm text-slate-600">
                  No guide steps available.
                </Card>
              )}

              {filteredStepEntries.map(({ step, index }) => (
                <div
                  key={step.id || `${index}`}
                  data-step-id={step.id}
                  ref={(node) => {
                    if (!step.id) return
                    stepCardRefs.current[step.id] = node
                  }}
                  className={`scroll-mt-24 rounded-2xl ${
                    activeStepId === step.id ? 'ring-2 ring-[color:var(--trope-accent)]/35' : ''
                  }`}
                >
                  {isEditing && (
                    <div className="mb-3 flex justify-center">
                      <Button variant="ghost" size="sm" onClick={() => insertDraftStep(index)}>
                        + Insert step here
                      </Button>
                    </div>
                  )}
                  <StepImageCard
                    csrfToken={csrfToken}
                    orgId={orgId}
                    workflowId={workflowId}
                    versionId={selectedVersionId}
                    step={step}
                    index={index}
                    image={derivedStepImages[step.id]?.image ?? null}
                    derivedFocusSource={derivedStepImages[step.id]?.focusSource ?? null}
                    clampedFromStepNumber={
                      derivedStepImages[step.id]?.clampedFromStepId
                        ? stepNumberById[derivedStepImages[step.id]?.clampedFromStepId ?? ''] ?? null
                        : null
                    }
                    isEditing={isEditing}
                    canMoveUp={index > 0}
                    canMoveDown={index < visibleSpec.steps.length - 1}
                    canDelete={visibleSpec.steps.length > 1}
                    onMoveUp={() => moveDraftStep(index, 'up')}
                    onMoveDown={() => moveDraftStep(index, 'down')}
                    onDelete={() => deleteDraftStep(index)}
                    onInsertAfter={() => insertDraftStep(index + 1)}
                    onCopyStepLink={() => copyStepLink(step.id, step.title)}
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
                    showFocusEditor={openFocusEditorStepId === step.id}
                    onToggleFocusEditor={() => {
                      if (!isEditing) return
                      setOpenRedactionEditorStepId(null)
                      setOpenFocusEditorStepId((current) => (current === step.id ? null : step.id))
                    }}
                    onScreenshotOverridesSave={(overrides) => {
                      if (!isEditing) return
                      updateDraftStep(index, (current) => ({
                        ...current,
                        screenshot_overrides: overrides,
                      }))
                    }}
                    onScreenshotOverridesReset={() => {
                      if (!isEditing) return
                      updateDraftStep(index, (current) => {
                        const next = { ...current } as GuideStep
                        delete (next as Record<string, unknown>).screenshot_overrides
                        return next
                      })
                    }}
                    showRedactionEditor={openRedactionEditorStepId === step.id}
                    onToggleRedactionEditor={() => {
                      if (!isEditing) return
                      setOpenFocusEditorStepId(null)
                      setOpenRedactionEditorStepId((current) =>
                        current === step.id ? null : step.id
                      )
                    }}
                    redactionMasks={
                      (isEditing ? draftRedactionMasksByStepId : redactionMasksByStepId)[step.id] ?? []
                    }
                    lockedMaskIds={(redactionMasksByStepId[step.id] ?? []).map((mask) => mask.id)}
                    onRedactionMasksChange={(masks) => {
                      if (!isEditing) return
                      redactionDraftTouchedRef.current = true
                      setDraftRedactionMasksByStepId((prev) => {
                        const normalizedMasks = masks
                          .map((mask) => normalizeGuideRedactionMask(mask))
                          .filter((mask): mask is GuideRedactionMask => Boolean(mask))
                        const lockedMasks = (redactionMasksByStepId[step.id] ?? [])
                          .map((mask) => normalizeGuideRedactionMask(mask))
                          .filter((mask): mask is GuideRedactionMask => Boolean(mask))
                        const lockedMaskIdSet = new Set(lockedMasks.map((mask) => mask.id))
                        const mergedMasks = [
                          ...lockedMasks,
                          ...normalizedMasks.filter((mask) => !lockedMaskIdSet.has(mask.id)),
                        ]
                        const next = cloneRedactionMaskMap(prev)
                        if (mergedMasks.length > 0) {
                          next[step.id] = mergedMasks
                        } else {
                          delete next[step.id]
                        }
                        return next
                      })
                    }}
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

          <aside className="hidden lg:block">
            <Card className="sticky top-24 p-4">
              <div className="text-sm font-semibold text-slate-900">Guide outline</div>
              <div className="mt-1 text-xs text-slate-500">
                {filteredStepEntries.length} steps
              </div>
              <nav className="mt-3 max-h-[70vh] space-y-1 overflow-auto pr-1">
                {filteredStepEntries.map(({ step, index }) => (
                  <Button
                    key={`toc-${step.id || index}`}
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => focusStep(step.id)}
                    className={`grid h-auto w-full grid-cols-[1.5rem_minmax(0,1fr)] items-start gap-x-2 whitespace-normal rounded-md px-2 py-2 text-left text-xs leading-5 transition ${
                      activeStepId === step.id
                        ? 'bg-slate-100 text-slate-900'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <span className="pt-0.5 text-right font-mono text-[10px] leading-5 text-slate-400">
                      {index + 1}
                    </span>
                    <span className="min-w-0 break-words line-clamp-2">
                      {step.title?.trim() || `Step ${index + 1}`}
                    </span>
                  </Button>
                ))}
              </nav>
            </Card>
          </aside>
        </div>
      )}
    </div>
  )
}

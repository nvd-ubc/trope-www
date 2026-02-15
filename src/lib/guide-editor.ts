export type GuideEditorRadar = {
  x: number
  y: number
  coordinate_space: string
}

export type GuideEditorStep = {
  id: string
  title: string
  instructions: string
  video_ranges?: unknown[]
  anchors?: {
    text?: unknown[]
    icons?: unknown[]
    layout?: unknown[]
    [key: string]: unknown
  }
  [key: string]: unknown
}

export type GuideEditorSpec = {
  workflow_title: string
  app: string
  version: string
  steps: GuideEditorStep[]
  [key: string]: unknown
}

export const clampPercent = (value: number) => Math.max(0, Math.min(100, value))

export const createStepId = () => `step_${Math.random().toString(36).slice(2, 10)}`

export const createDraftStep = (): GuideEditorStep => ({
  id: createStepId(),
  title: 'Manual step',
  instructions: 'Describe the manual action to perform.',
  kind: 'manual',
  callout_style: 'note',
  video_ranges: [],
  anchors: {
    text: [],
    icons: [],
    layout: [{ position_hint: 'manual' }],
  },
})

const ensureUniqueStepId = (candidate: string, used: Set<string>) => {
  const trimmed = candidate.trim()
  const base = trimmed.length > 0 ? trimmed : 'step'
  if (!used.has(base)) {
    used.add(base)
    return base
  }

  let suffix = 2
  let next = `${base}_${suffix}`
  while (used.has(next)) {
    suffix += 1
    next = `${base}_${suffix}`
  }
  used.add(next)
  return next
}

export const normalizeStepForPublish = (step: GuideEditorStep, index: number): GuideEditorStep => {
  const id = typeof step.id === 'string' && step.id.trim() ? step.id.trim() : `step_${index + 1}`
  const title =
    typeof step.title === 'string' && step.title.trim()
      ? step.title.trim()
      : `Step ${index + 1}`
  const instructions =
    typeof step.instructions === 'string' && step.instructions.trim()
      ? step.instructions.trim()
      : 'Follow this step.'
  const anchors =
    step.anchors && typeof step.anchors === 'object' && !Array.isArray(step.anchors)
      ? step.anchors
      : {}
  const textAnchors = Array.isArray(anchors.text) ? anchors.text : []
  const iconAnchors = Array.isArray(anchors.icons) ? anchors.icons : []
  const layoutAnchors = Array.isArray(anchors.layout) ? anchors.layout : []
  const videoRanges = Array.isArray(step.video_ranges) ? step.video_ranges : []
  const kind =
    typeof step.kind === 'string' && step.kind.trim()
      ? step.kind.trim().toLowerCase()
      : undefined
  const calloutStyleRaw =
    typeof step.callout_style === 'string' && step.callout_style.trim()
      ? step.callout_style.trim().toLowerCase()
      : undefined
  const calloutStyle =
    calloutStyleRaw === 'tip' || calloutStyleRaw === 'note' || calloutStyleRaw === 'alert'
      ? calloutStyleRaw
      : undefined

  const normalized: GuideEditorStep = {
    ...step,
    id,
    title,
    instructions,
    kind,
    video_ranges: videoRanges,
    anchors: {
      ...anchors,
      text: textAnchors,
      icons: iconAnchors,
      layout: layoutAnchors,
    },
  }

  if (kind === 'manual' && calloutStyle) {
    normalized.callout_style = calloutStyle
  } else {
    delete normalized.callout_style
  }

  return normalized
}

export const normalizeSpecForPublish = (
  spec: GuideEditorSpec,
  fallbackTitle: string,
  fallbackVersion = '1'
): GuideEditorSpec => {
  const usedStepIds = new Set<string>()
  const normalizedSteps = (Array.isArray(spec.steps) ? spec.steps : []).map(normalizeStepForPublish)
  const steps = normalizedSteps.map((step, index) => {
    const fallbackId = `step_${index + 1}`
    const nextId = ensureUniqueStepId(
      typeof step.id === 'string' && step.id.trim() ? step.id.trim() : fallbackId,
      usedStepIds
    )
    return nextId === step.id ? step : { ...step, id: nextId }
  })

  return {
    ...spec,
    workflow_title:
      typeof spec.workflow_title === 'string' && spec.workflow_title.trim()
        ? spec.workflow_title.trim()
        : fallbackTitle,
    app:
      typeof spec.app === 'string' && spec.app.trim()
        ? spec.app.trim()
        : 'Desktop',
    version:
      typeof spec.version === 'string' && spec.version.trim()
        ? spec.version.trim()
        : fallbackVersion,
    steps,
  }
}

export const buildSaveFingerprint = (spec: GuideEditorSpec, fallbackTitle: string) =>
  JSON.stringify(normalizeSpecForPublish(spec, fallbackTitle))

export const getRadarPercent = (
  radar: GuideEditorRadar | null,
  width: number | null,
  height: number | null
) => {
  if (!radar || radar.coordinate_space !== 'step_image_pixels_v1') {
    return null
  }
  if (!Number.isFinite(radar.x) || !Number.isFinite(radar.y)) {
    return null
  }
  if (
    typeof width !== 'number' ||
    typeof height !== 'number' ||
    !Number.isFinite(width) ||
    !Number.isFinite(height) ||
    width <= 0 ||
    height <= 0
  ) {
    return null
  }

  return {
    left: clampPercent((radar.x / width) * 100),
    top: clampPercent((radar.y / height) * 100),
  }
}

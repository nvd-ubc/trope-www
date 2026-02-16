import {
  isStepClickLike,
  type GuideMediaPoint,
  type GuideMediaRadar,
  type GuideMediaRenderHints,
  type GuideMediaStepImage,
} from './guide-media'

type GuideStepLike = {
  id: string
  kind?: string | null
  expected_event?: unknown
  [key: string]: unknown
}

export type GuideScreenshotUnitPoint = {
  x: number
  y: number
}

export type GuideStepScreenshotOverridesV1 = {
  focus?: {
    center_unit: GuideScreenshotUnitPoint
    zoom_scale: number
  } | null
  cursor?: {
    point_unit: GuideScreenshotUnitPoint
  } | null
}

export type DerivedGuideStepImage = {
  image: GuideMediaStepImage
  focusSource:
    | 'manual_override'
    | 'backend_render_hints'
    | 'radar'
    | 'clamped_click'
    | 'center_fallback'
  clampedFromStepId: string | null
}

const STEP_IMAGE_COORDINATE_SPACE = 'step_image_pixels_v1'

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value)

const clampUnit = (value: number): number => Math.max(0, Math.min(1, value))

const toUnitPoint = (value: unknown): GuideScreenshotUnitPoint | null => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  const record = value as Record<string, unknown>
  const x = isFiniteNumber(record.x) ? clampUnit(record.x) : null
  const y = isFiniteNumber(record.y) ? clampUnit(record.y) : null
  if (x === null || y === null) return null
  return { x, y }
}

const toPositiveFiniteNumber = (value: unknown): number | null =>
  typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : null

const getStepImageDimensions = (image: GuideMediaStepImage): { width: number | null; height: number | null } => {
  const width =
    toPositiveFiniteNumber(image.width) ??
    toPositiveFiniteNumber(image.variants?.full?.width) ??
    toPositiveFiniteNumber(image.variants?.preview?.width) ??
    null
  const height =
    toPositiveFiniteNumber(image.height) ??
    toPositiveFiniteNumber(image.variants?.full?.height) ??
    toPositiveFiniteNumber(image.variants?.preview?.height) ??
    null
  return { width, height }
}

export const readStepScreenshotOverridesV1 = (step: unknown): GuideStepScreenshotOverridesV1 | null => {
  if (!step || typeof step !== 'object' || Array.isArray(step)) return null
  const record = step as Record<string, unknown>
  const overridesRaw = record.screenshot_overrides
  if (!overridesRaw || typeof overridesRaw !== 'object' || Array.isArray(overridesRaw)) return null
  const overrides = overridesRaw as Record<string, unknown>

  const focusRaw = overrides.focus
  const focus =
    focusRaw && typeof focusRaw === 'object' && !Array.isArray(focusRaw)
      ? (focusRaw as Record<string, unknown>)
      : null
  const focusCenterUnit = focus ? toUnitPoint(focus.center_unit) : null
  const zoomScale = focus ? toPositiveFiniteNumber(focus.zoom_scale) : null
  const normalizedFocus =
    focusCenterUnit && zoomScale
      ? {
          center_unit: focusCenterUnit,
          zoom_scale: zoomScale,
        }
      : null

  const cursorRaw = overrides.cursor
  const cursor =
    cursorRaw && typeof cursorRaw === 'object' && !Array.isArray(cursorRaw)
      ? (cursorRaw as Record<string, unknown>)
      : null
  const cursorPointUnit = cursor ? toUnitPoint(cursor.point_unit) : null
  const normalizedCursor = cursorPointUnit ? { point_unit: cursorPointUnit } : null

  if (!normalizedFocus && !normalizedCursor) return null
  return { focus: normalizedFocus, cursor: normalizedCursor }
}

const isValidRadarPoint = (radar: GuideMediaRadar | null | undefined, width: number, height: number): boolean => {
  if (!radar) return false
  if (radar.coordinate_space !== STEP_IMAGE_COORDINATE_SPACE) return false
  if (!Number.isFinite(radar.x) || !Number.isFinite(radar.y)) return false
  if (radar.x < 0 || radar.x > width || radar.y < 0 || radar.y > height) return false
  return true
}

const unitPointToPixels = (point: GuideScreenshotUnitPoint, width: number, height: number) => ({
  x: clampUnit(point.x) * width,
  y: clampUnit(point.y) * height,
})

const manualCursorToRadar = (
  pointUnit: GuideScreenshotUnitPoint,
  width: number,
  height: number
): GuideMediaRadar => {
  const pixel = unitPointToPixels(pointUnit, width, height)
  return {
    x: pixel.x,
    y: pixel.y,
    coordinate_space: STEP_IMAGE_COORDINATE_SPACE,
    confidence: 1,
    reason_code: 'manual_override',
  }
}

const manualFocusToRenderHints = (
  focus: NonNullable<NonNullable<GuideStepScreenshotOverridesV1['focus']>>,
  width: number,
  height: number
): GuideMediaRenderHints => {
  const pixel = unitPointToPixels(focus.center_unit, width, height)
  return {
    algorithm: 'focus_hints_v1',
    source: 'click_event',
    confidence: 1,
    focus_center: {
      x: pixel.x,
      y: pixel.y,
      coordinate_space: STEP_IMAGE_COORDINATE_SPACE,
    },
    recommended_zoom_scale: Math.max(1, focus.zoom_scale),
  }
}

const centerFocusHints = (params: {
  width: number
  height: number
  zoomScale: number
  clickLike: boolean
}): GuideMediaRenderHints => {
  return {
    algorithm: 'focus_hints_v1',
    source: params.clickLike ? 'click_event' : 'center',
    confidence: params.clickLike ? 0.35 : 0.35,
    focus_center: {
      x: params.width / 2,
      y: params.height / 2,
      coordinate_space: STEP_IMAGE_COORDINATE_SPACE,
    },
    recommended_zoom_scale: Math.max(1, params.zoomScale),
  }
}

const radarToRenderHints = (params: {
  radar: GuideMediaRadar
  zoomScale: number
}): GuideMediaRenderHints => {
  return {
    algorithm: 'focus_hints_v1',
    source: 'radar',
    confidence: typeof params.radar.confidence === 'number' && Number.isFinite(params.radar.confidence)
      ? params.radar.confidence
      : 0.86,
    focus_center: {
      x: params.radar.x,
      y: params.radar.y,
      coordinate_space: STEP_IMAGE_COORDINATE_SPACE,
    },
    recommended_zoom_scale: Math.max(1, params.zoomScale),
  }
}

const DEFAULT_CLICK_ZOOM = 1.85
const DEFAULT_CLAMPED_ZOOM = 1.4
const DEFAULT_CENTER_ZOOM = 1.25

const isStrongPointerHints = (step: GuideStepLike, hints: GuideMediaRenderHints): boolean => {
  const clickLike = isStepClickLike(step)
  if (!clickLike) {
    const zoom = toPositiveFiniteNumber(hints.recommended_zoom_scale) ?? 1
    return zoom > 1.05 || Boolean(hints.safe_crop_rect)
  }

  const source = (hints.source ?? '').toString().trim().toLowerCase()
  const pointerSourceAllowed = source === 'radar' || source === 'click_event'
  if (!pointerSourceAllowed) return false

  const confidence = isFiniteNumber(hints.confidence) ? hints.confidence : null
  const zoomScale = toPositiveFiniteNumber(hints.recommended_zoom_scale) ?? 1
  return (confidence !== null && confidence >= 0.7) || zoomScale >= 1.22
}

type ClickCandidate = {
  stepId: string
  index: number
  captureTS: number | null
  center: GuideMediaPoint
  confidence: number
}

const pickNearestCandidate = (params: {
  candidates: ClickCandidate[]
  currentIndex: number
  currentCaptureTS: number | null
}): ClickCandidate | null => {
  if (params.candidates.length === 0) return null

  const currentCaptureTS = params.currentCaptureTS
  if (typeof currentCaptureTS === 'number' && Number.isFinite(currentCaptureTS)) {
    const candidatesWithTS = params.candidates.filter((candidate) => candidate.captureTS !== null)
    if (candidatesWithTS.length > 0) {
      return [...candidatesWithTS].sort((left, right) => {
        const leftDelta = Math.abs((left.captureTS ?? 0) - currentCaptureTS)
        const rightDelta = Math.abs((right.captureTS ?? 0) - currentCaptureTS)
        if (leftDelta !== rightDelta) return leftDelta - rightDelta
        if (left.index !== right.index) return left.index - right.index
        return left.stepId.localeCompare(right.stepId)
      })[0] ?? null
    }
  }

  return [...params.candidates].sort((left, right) => {
    const leftDelta = Math.abs(left.index - params.currentIndex)
    const rightDelta = Math.abs(right.index - params.currentIndex)
    if (leftDelta !== rightDelta) return leftDelta - rightDelta
    if (left.index !== right.index) return left.index - right.index
    return left.stepId.localeCompare(right.stepId)
  })[0] ?? null
}

export const deriveGuideStepImagesWithFocus = (params: {
  steps: GuideStepLike[]
  stepImages: GuideMediaStepImage[]
}): Record<string, DerivedGuideStepImage> => {
  const imageMap: Record<string, GuideMediaStepImage> = {}
  for (const image of params.stepImages) {
    if (image?.step_id) {
      imageMap[image.step_id] = image
    }
  }

  const clickCandidates: ClickCandidate[] = []
  for (let index = 0; index < params.steps.length; index += 1) {
    const step = params.steps[index]
    const stepId = step?.id
    if (!stepId) continue
    if (!isStepClickLike(step)) continue

    const image = imageMap[stepId]
    if (!image) continue
    const { width, height } = getStepImageDimensions(image)
    if (width === null || height === null) continue

    const overrides = readStepScreenshotOverridesV1(step)
    const manualCursor = overrides?.cursor?.point_unit ?? null
    const manualCursorRadar = manualCursor ? manualCursorToRadar(manualCursor, width, height) : null
    const radar = manualCursorRadar ?? image.radar ?? null
    if (!radar) continue
    if (!isValidRadarPoint(radar, width, height)) continue

    clickCandidates.push({
      stepId,
      index,
      captureTS: typeof image.capture_t_s === 'number' && Number.isFinite(image.capture_t_s) ? image.capture_t_s : null,
      center: {
        x: radar.x,
        y: radar.y,
        coordinate_space: STEP_IMAGE_COORDINATE_SPACE,
      },
      confidence: isFiniteNumber(radar.confidence) ? radar.confidence : manualCursor ? 1 : 0.86,
    })
  }

  const derived: Record<string, DerivedGuideStepImage> = {}
  for (let index = 0; index < params.steps.length; index += 1) {
    const step = params.steps[index]
    const stepId = step?.id
    if (!stepId) continue
    const image = imageMap[stepId]
    if (!image) continue

    const { width, height } = getStepImageDimensions(image)
    if (width === null || height === null) {
      derived[stepId] = {
        image,
        focusSource: 'backend_render_hints',
        clampedFromStepId: null,
      }
      continue
    }

    const overrides = readStepScreenshotOverridesV1(step)
    const manualFocus = overrides?.focus ?? null
    const manualCursor = overrides?.cursor?.point_unit ?? null

    const manualCursorRadar = manualCursor ? manualCursorToRadar(manualCursor, width, height) : null

    const clickLike = isStepClickLike(step)
    const effectiveRadar = manualCursorRadar ?? image.radar ?? null

    const manualHints = manualFocus ? manualFocusToRenderHints(manualFocus, width, height) : null

    const backendHints = image.render_hints ?? null
    const hasBackendHints = backendHints && isStrongPointerHints(step, backendHints)
    const shouldUseBackend = Boolean(hasBackendHints && !manualHints)

    if (manualHints) {
      derived[stepId] = {
        image: {
          ...image,
          radar: effectiveRadar,
          render_hints: manualHints,
        },
        focusSource: 'manual_override',
        clampedFromStepId: null,
      }
      continue
    }

    if (shouldUseBackend && backendHints) {
      derived[stepId] = {
        image: {
          ...image,
          radar: effectiveRadar,
          render_hints: backendHints,
        },
        focusSource: 'backend_render_hints',
        clampedFromStepId: null,
      }
      continue
    }

    if (effectiveRadar && isValidRadarPoint(effectiveRadar, width, height)) {
      derived[stepId] = {
        image: {
          ...image,
          radar: effectiveRadar,
          render_hints: radarToRenderHints({
            radar: effectiveRadar,
            zoomScale: clickLike ? DEFAULT_CLICK_ZOOM : DEFAULT_CLAMPED_ZOOM,
          }),
        },
        focusSource: 'radar',
        clampedFromStepId: null,
      }
      continue
    }

    const currentCaptureTS =
      typeof image.capture_t_s === 'number' && Number.isFinite(image.capture_t_s) ? image.capture_t_s : null
    const candidate = pickNearestCandidate({
      candidates: clickCandidates.filter((candidate) => candidate.stepId !== stepId),
      currentIndex: index,
      currentCaptureTS,
    })

    if (candidate) {
      derived[stepId] = {
        image: {
          ...image,
          radar: effectiveRadar,
          render_hints: {
            algorithm: 'focus_hints_v1',
            source: 'click_event',
            confidence: Math.max(0.1, Math.min(1, candidate.confidence * 0.85)),
            focus_center: candidate.center,
            recommended_zoom_scale: clickLike ? DEFAULT_CLICK_ZOOM : DEFAULT_CLAMPED_ZOOM,
          },
        },
        focusSource: 'clamped_click',
        clampedFromStepId: candidate.stepId,
      }
      continue
    }

    derived[stepId] = {
      image: {
        ...image,
        radar: effectiveRadar,
        render_hints: centerFocusHints({
          width,
          height,
          zoomScale: clickLike ? Math.max(DEFAULT_CENTER_ZOOM, 1.22) : DEFAULT_CENTER_ZOOM,
          clickLike,
        }),
      },
      focusSource: 'center_fallback',
      clampedFromStepId: null,
    }
  }

  return derived
}

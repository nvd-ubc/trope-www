export type GuideMediaRadar = {
  x: number
  y: number
  coordinate_space: string
  confidence?: number | null
  reason_code?: string | null
}

export type GuideMediaPoint = {
  x: number
  y: number
  coordinate_space: 'step_image_pixels_v1'
}

export type GuideMediaRect = {
  x: number
  y: number
  width: number
  height: number
  coordinate_space: 'step_image_pixels_v1'
}

export type GuideMediaRenderHints = {
  algorithm?: 'focus_hints_v1' | string | null
  source?: 'radar' | 'click_event' | 'element_frame' | 'layout_anchor' | 'center' | string | null
  confidence?: number | null
  focus_center?: GuideMediaPoint | null
  safe_crop_rect?: GuideMediaRect | null
  recommended_zoom_scale?: number | null
  recommended_focus_radius_px?: number | null
}

type GuideMediaCursorTrackKind = 'move' | 'mouse_down' | 'mouse_up'

export type GuideMediaCursorTrackPoint = {
  t_ms: number
  x: number
  y: number
  kind?: GuideMediaCursorTrackKind | string | null
}

export type GuideMediaCursorTrack = {
  coordinate_space: 'step_image_pixels_v1' | string
  duration_ms?: number | null
  sample_rate_hz?: number | null
  points: GuideMediaCursorTrackPoint[]
}

export type GuideMediaRenderableCursorTrackPoint = {
  tMs: number
  leftPercent: number
  topPercent: number
  kind: GuideMediaCursorTrackKind
}

export type GuideMediaRenderableCursorTrack = {
  durationMs: number
  sampleRateHz: number | null
  points: GuideMediaRenderableCursorTrackPoint[]
}

type GuideStepLike = {
  kind?: string | null
  expected_event?: unknown
}

export type GuideMediaVariantDescriptor = {
  key?: string | null
  download_url?: string | null
  content_type?: string | null
  width?: number | null
  height?: number | null
}

export type GuideMediaStepImage = {
  step_id: string
  key?: string | null
  download_url?: string | null
  content_type?: string | null
  width?: number | null
  height?: number | null
  capture_t_s?: number | null
  capture_t_source?: string | null
  radar?: GuideMediaRadar | null
  cursor_track?: GuideMediaCursorTrack | null
  render_hints?: GuideMediaRenderHints | null
  variants?: {
    preview?: GuideMediaVariantDescriptor | null
    full?: GuideMediaVariantDescriptor | null
  } | null
}

export type GuideMediaSurface = 'card' | 'detail'
export type RequestedGuideMediaVariant = 'auto' | 'preview' | 'full'
export type SelectedGuideMediaVariant = 'preview' | 'full' | 'legacy' | null

export type ResolvedGuideMediaVariant = {
  selectedVariant: SelectedGuideMediaVariant
  downloadUrl: string | null
  contentType: string | null
  width: number | null
  height: number | null
}

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0

const toPositiveFiniteNumber = (value: unknown): number | null => {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
    return null
  }
  return value
}

const clampPercent = (value: number) => Math.max(0, Math.min(100, value))

const normalizeCursorTrackKind = (value: unknown): GuideMediaCursorTrackKind => {
  const normalized = isNonEmptyString(value) ? value.trim().toLowerCase() : ''
  if (normalized === 'mouse_down') return 'mouse_down'
  if (normalized === 'mouse_up') return 'mouse_up'
  return 'move'
}

export const resolveRenderableCursorTrack = (params: {
  cursorTrack: GuideMediaCursorTrack | null | undefined
  width: number | null
  height: number | null
}): GuideMediaRenderableCursorTrack | null => {
  const cursorTrack = params.cursorTrack
  if (!cursorTrack) return null
  if (cursorTrack.coordinate_space !== 'step_image_pixels_v1') return null

  const width = toPositiveFiniteNumber(params.width)
  const height = toPositiveFiniteNumber(params.height)
  if (width === null || height === null) return null

  const rawPoints = Array.isArray(cursorTrack.points) ? cursorTrack.points : []
  const points = rawPoints
    .map((point): GuideMediaRenderableCursorTrackPoint | null => {
      const tMs = typeof point?.t_ms === 'number' && Number.isFinite(point.t_ms) ? point.t_ms : null
      const x = typeof point?.x === 'number' && Number.isFinite(point.x) ? point.x : null
      const y = typeof point?.y === 'number' && Number.isFinite(point.y) ? point.y : null
      if (tMs === null || tMs < 0 || x === null || y === null) return null
      if (x < 0 || x > width || y < 0 || y > height) return null
      return {
        tMs,
        leftPercent: clampPercent((x / width) * 100),
        topPercent: clampPercent((y / height) * 100),
        kind: normalizeCursorTrackKind(point.kind),
      }
    })
    .filter((point): point is GuideMediaRenderableCursorTrackPoint => Boolean(point))
    .sort((lhs, rhs) => lhs.tMs - rhs.tMs)

  if (points.length === 0) return null

  const deduped: GuideMediaRenderableCursorTrackPoint[] = []
  for (const point of points) {
    const previous = deduped.at(-1)
    if (
      previous &&
      previous.tMs === point.tMs &&
      previous.leftPercent === point.leftPercent &&
      previous.topPercent === point.topPercent &&
      previous.kind === point.kind
    ) {
      continue
    }
    deduped.push(point)
  }

  const lastPointTime = deduped.at(-1)?.tMs ?? 0
  const durationMs = Math.max(
    1,
    toPositiveFiniteNumber(cursorTrack.duration_ms) ?? lastPointTime
  )
  const sampleRateHz = toPositiveFiniteNumber(cursorTrack.sample_rate_hz)

  return {
    durationMs: Math.max(durationMs, lastPointTime),
    sampleRateHz,
    points: deduped,
  }
}

export const sampleRenderableCursorTrackPoint = (
  track: GuideMediaRenderableCursorTrack,
  elapsedMs: number
): GuideMediaRenderableCursorTrackPoint | null => {
  const points = track.points
  if (points.length === 0) return null
  if (points.length === 1) return points[0]

  const elapsed = Number.isFinite(elapsedMs) ? elapsedMs : 0
  if (elapsed <= points[0]!.tMs) return points[0]

  const lastPoint = points[points.length - 1]!
  if (elapsed >= lastPoint.tMs) return lastPoint

  for (let index = 1; index < points.length; index += 1) {
    const next = points[index]!
    if (elapsed > next.tMs) continue
    const previous = points[index - 1]!
    const span = next.tMs - previous.tMs
    if (span <= 0) return next
    const ratio = (elapsed - previous.tMs) / span
    return {
      tMs: elapsed,
      leftPercent: previous.leftPercent + (next.leftPercent - previous.leftPercent) * ratio,
      topPercent: previous.topPercent + (next.topPercent - previous.topPercent) * ratio,
      kind: ratio >= 0.9 ? next.kind : previous.kind,
    }
  }

  return lastPoint
}

export const resolveCursorTrackPulseKind = (
  track: GuideMediaRenderableCursorTrack,
  elapsedMs: number,
  pulseWindowMs = 120
): 'mouse_down' | 'mouse_up' | null => {
  if (!Number.isFinite(elapsedMs)) return null
  const lowerBound = elapsedMs - Math.max(0, pulseWindowMs)
  for (let index = track.points.length - 1; index >= 0; index -= 1) {
    const point = track.points[index]!
    if (point.tMs > elapsedMs) continue
    if (point.tMs < lowerBound) break
    if (point.kind === 'mouse_down' || point.kind === 'mouse_up') {
      return point.kind
    }
  }
  return null
}

const getVariantOrder = (
  surface: GuideMediaSurface,
  requestedVariant: RequestedGuideMediaVariant
): Array<'preview' | 'full'> => {
  if (requestedVariant === 'preview') return ['preview', 'full']
  if (requestedVariant === 'full') return ['full', 'preview']
  return surface === 'detail' ? ['full', 'preview'] : ['preview', 'full']
}

const getVariantDescriptor = (
  image: GuideMediaStepImage,
  variant: 'preview' | 'full'
): GuideMediaVariantDescriptor | null => {
  const variants = image.variants
  if (!variants || typeof variants !== 'object') return null
  const descriptor = variants[variant]
  if (!descriptor || typeof descriptor !== 'object') return null
  return descriptor
}

const normalizeDownloadUrl = (value: unknown): string | null =>
  isNonEmptyString(value) ? value.trim() : null

export const resolveStepImageVariant = (
  image: GuideMediaStepImage,
  options: {
    surface?: GuideMediaSurface
    requestedVariant?: RequestedGuideMediaVariant
  } = {}
): ResolvedGuideMediaVariant => {
  const surface = options.surface ?? 'card'
  const requestedVariant = options.requestedVariant ?? 'auto'
  const order = getVariantOrder(surface, requestedVariant)

  let fallbackDescriptor: GuideMediaVariantDescriptor | null = null

  for (const variant of order) {
    const descriptor = getVariantDescriptor(image, variant)
    if (!fallbackDescriptor && descriptor) {
      fallbackDescriptor = descriptor
    }
    if (!descriptor) continue

    const downloadUrl = normalizeDownloadUrl(descriptor.download_url)
    if (!downloadUrl) continue

    return {
      selectedVariant: variant,
      downloadUrl,
      contentType: normalizeDownloadUrl(descriptor.content_type) ?? normalizeDownloadUrl(image.content_type),
      width: toPositiveFiniteNumber(descriptor.width) ?? toPositiveFiniteNumber(image.width),
      height: toPositiveFiniteNumber(descriptor.height) ?? toPositiveFiniteNumber(image.height),
    }
  }

  const legacyDownloadUrl = normalizeDownloadUrl(image.download_url)
  if (legacyDownloadUrl) {
    return {
      selectedVariant: 'legacy',
      downloadUrl: legacyDownloadUrl,
      contentType:
        normalizeDownloadUrl(fallbackDescriptor?.content_type) ?? normalizeDownloadUrl(image.content_type),
      width:
        toPositiveFiniteNumber(fallbackDescriptor?.width) ?? toPositiveFiniteNumber(image.width),
      height:
        toPositiveFiniteNumber(fallbackDescriptor?.height) ?? toPositiveFiniteNumber(image.height),
    }
  }

  return {
    selectedVariant: null,
    downloadUrl: null,
    contentType:
      normalizeDownloadUrl(fallbackDescriptor?.content_type) ?? normalizeDownloadUrl(image.content_type),
    width:
      toPositiveFiniteNumber(fallbackDescriptor?.width) ?? toPositiveFiniteNumber(image.width),
    height:
      toPositiveFiniteNumber(fallbackDescriptor?.height) ?? toPositiveFiniteNumber(image.height),
  }
}

export const formatCaptureTimestamp = (seconds: number | null | undefined): string | null => {
  if (typeof seconds !== 'number' || !Number.isFinite(seconds) || seconds < 0) {
    return null
  }

  const wholeSeconds = Math.round(seconds)
  const minutes = Math.floor(wholeSeconds / 60)
  const remaining = wholeSeconds % 60
  return `${minutes}:${String(remaining).padStart(2, '0')}`
}

const normalizeStepKind = (kind: string | null | undefined): string =>
  (kind ?? '').trim().toLowerCase()

const clickStepKinds = new Set([
  'click_target',
  'select_menu',
  'context_menu',
  'drag_drop',
  'multi_select',
  'table_action',
])

const nonClickStepKinds = new Set([
  'manual',
  'informational',
  'type_into_field',
  'copy_paste',
  'press_shortcut',
  'wait_for_window',
  'wait_for_element',
  'verify_state',
  'branch',
  'scroll',
  'file_dialog',
])

const expectedEventTypeFromStep = (step: GuideStepLike): string => {
  const expectedEvent = step.expected_event
  if (!expectedEvent || typeof expectedEvent !== 'object' || Array.isArray(expectedEvent)) {
    return ''
  }
  const rawType = (expectedEvent as { type?: unknown }).type
  return isNonEmptyString(rawType) ? rawType.trim().toLowerCase() : ''
}

export const isStepClickLike = (step: GuideStepLike): boolean => {
  const expectedType = expectedEventTypeFromStep(step)
  if (expectedType === 'click') return true
  if (expectedType === 'keypress' || expectedType === 'input' || expectedType === 'navigation') {
    return false
  }

  const kind = normalizeStepKind(step.kind)
  if (!kind) return false
  if (clickStepKinds.has(kind)) return true
  if (nonClickStepKinds.has(kind)) return false
  return false
}

export const shouldRenderStepRadar = (params: {
  step: GuideStepLike
  radar: GuideMediaRadar | null | undefined
  width: number | null
  height: number | null
}): boolean => {
  if (!isStepClickLike(params.step)) return false

  const radar = params.radar
  if (!radar) return false
  if (radar.coordinate_space !== 'step_image_pixels_v1') return false
  if (!Number.isFinite(radar.x) || !Number.isFinite(radar.y)) return false

  const width = toPositiveFiniteNumber(params.width)
  const height = toPositiveFiniteNumber(params.height)
  if (width === null || height === null) return false
  if (radar.x < 0 || radar.x > width || radar.y < 0 || radar.y > height) return false

  const reasonCode = (radar.reason_code ?? '').trim().toLowerCase()
  if (reasonCode.startsWith('default_center')) return false

  const confidence = radar.confidence
  if (typeof confidence === 'number') {
    if (!Number.isFinite(confidence)) return false
    if (confidence <= 0.05) return false
  }

  return true
}

type StepFocusFallbackReason =
  | 'missing_render_hints'
  | 'no_focus_crop'
  | 'weak_pointer_focus_hint'

const MIN_POINTER_AUTO_FOCUS_ZOOM = 1.22
const MIN_POINTER_AUTO_FOCUS_CONFIDENCE = 0.7

const toFiniteNumber = (value: unknown): number | null =>
  typeof value === 'number' && Number.isFinite(value) ? value : null

export const resolveStepFocusFallbackReason = (params: {
  step: GuideStepLike
  renderHints: GuideMediaRenderHints | null | undefined
  hasFocusCrop: boolean
  zoomScale: number
}): StepFocusFallbackReason | null => {
  if (!params.renderHints) return 'missing_render_hints'
  if (!params.hasFocusCrop) return 'no_focus_crop'

  if (!isStepClickLike(params.step)) return null

  const source = (params.renderHints.source ?? '').toString().trim().toLowerCase()
  const pointerFocusSourceAllowed = source === 'radar' || source === 'click_event'
  if (!pointerFocusSourceAllowed) {
    return 'weak_pointer_focus_hint'
  }

  const confidence = toFiniteNumber(params.renderHints.confidence)
  const hasStrongConfidence =
    (confidence !== null && confidence >= MIN_POINTER_AUTO_FOCUS_CONFIDENCE) ||
    params.zoomScale >= MIN_POINTER_AUTO_FOCUS_ZOOM
  if (hasStrongConfidence) return null

  return 'weak_pointer_focus_hint'
}

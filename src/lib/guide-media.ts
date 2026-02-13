export type GuideMediaRadar = {
  x: number
  y: number
  coordinate_space: string
  confidence?: number | null
  reason_code?: string | null
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

const stepIsClickLike = (step: GuideStepLike): boolean => {
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
  if (!stepIsClickLike(params.step)) return false

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

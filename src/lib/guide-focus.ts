import type { GuideMediaRadar, GuideMediaRenderHints } from './guide-media'

export type GuideFocusRect = {
  x: number
  y: number
  width: number
  height: number
}

export type GuideFocusTransformInput = {
  image: {
    width: number | null | undefined
    height: number | null | undefined
  }
  viewport: {
    width: number | null | undefined
    height: number | null | undefined
  }
  renderHints?: GuideMediaRenderHints | null
  radar?: GuideMediaRadar | null
}

export type GuideFocusTransformResult = {
  cropRect: GuideFocusRect
  zoomScale: number
  transformOriginPercent: { x: number; y: number }
  radarPercentInCrop: { left: number; top: number } | null
  hasFocusCrop: boolean
}

const STEP_IMAGE_COORDINATE_SPACE = 'step_image_pixels_v1'
const DEFAULT_CONTEXT_MARGIN_FACTOR = 0.04

// Exported for editor tooling that needs stable round-tripping between a saved zoom and the
// effective zoom after focus crop context margin is applied.
export const GUIDE_FOCUS_CONTEXT_MARGIN_FACTOR = DEFAULT_CONTEXT_MARGIN_FACTOR

const isFinitePositive = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value > 0

const clamp = (value: number, min: number, max: number): number => Math.min(Math.max(value, min), max)

const almostEqual = (a: number, b: number, epsilon = 0.001): boolean => Math.abs(a - b) <= epsilon

const fullRect = (imageWidth: number, imageHeight: number): GuideFocusRect => ({
  x: 0,
  y: 0,
  width: imageWidth,
  height: imageHeight,
})

const rectCenter = (rect: GuideFocusRect): { x: number; y: number } => ({
  x: rect.x + rect.width / 2,
  y: rect.y + rect.height / 2,
})

const clampRectToImage = (
  rect: GuideFocusRect,
  imageWidth: number,
  imageHeight: number
): GuideFocusRect => {
  const width = clamp(rect.width, 1, imageWidth)
  const height = clamp(rect.height, 1, imageHeight)
  const x = clamp(rect.x, 0, Math.max(0, imageWidth - width))
  const y = clamp(rect.y, 0, Math.max(0, imageHeight - height))
  return { x, y, width, height }
}

const roundCropRect = (
  rect: GuideFocusRect,
  imageWidth: number,
  imageHeight: number
): GuideFocusRect => {
  const x = clamp(Math.floor(rect.x), 0, Math.max(0, imageWidth - 1))
  const y = clamp(Math.floor(rect.y), 0, Math.max(0, imageHeight - 1))
  const width = clamp(Math.ceil(rect.width), 1, imageWidth - x)
  const height = clamp(Math.ceil(rect.height), 1, imageHeight - y)
  return { x, y, width, height }
}

const safeRectFromHints = (hints: GuideMediaRenderHints): GuideFocusRect | null => {
  const safe = hints.safe_crop_rect
  if (!safe || safe.coordinate_space !== STEP_IMAGE_COORDINATE_SPACE) {
    return null
  }
  if (!isFinitePositive(safe.width) || !isFinitePositive(safe.height)) {
    return null
  }
  if (typeof safe.x !== 'number' || typeof safe.y !== 'number' || !Number.isFinite(safe.x) || !Number.isFinite(safe.y)) {
    return null
  }
  return {
    x: safe.x,
    y: safe.y,
    width: safe.width,
    height: safe.height,
  }
}

const derivedRectFromCenterAndZoom = (
  hints: GuideMediaRenderHints,
  imageWidth: number,
  imageHeight: number
): GuideFocusRect | null => {
  const center = hints.focus_center
  const zoom = hints.recommended_zoom_scale
  if (!center || center.coordinate_space !== STEP_IMAGE_COORDINATE_SPACE) return null
  if (!isFinitePositive(zoom) || zoom <= 1) return null
  if (typeof center.x !== 'number' || typeof center.y !== 'number') return null
  if (!Number.isFinite(center.x) || !Number.isFinite(center.y)) return null

  const width = imageWidth / zoom
  const height = imageHeight / zoom
  return {
    x: center.x - width / 2,
    y: center.y - height / 2,
    width,
    height,
  }
}

const adjustRectToViewportAspect = (
  rect: GuideFocusRect,
  viewportWidth: number,
  viewportHeight: number,
  imageWidth: number,
  imageHeight: number
): GuideFocusRect => {
  if (!isFinitePositive(viewportWidth) || !isFinitePositive(viewportHeight)) {
    return rect
  }
  const targetAspect = viewportWidth / viewportHeight
  if (!isFinitePositive(targetAspect)) return rect

  const center = rectCenter(rect)
  let width = rect.width
  let height = rect.height
  const rectAspect = rect.width / rect.height

  if (rectAspect > targetAspect) {
    height = width / targetAspect
  } else if (rectAspect < targetAspect) {
    width = height * targetAspect
  }

  if (width > imageWidth) {
    width = imageWidth
    height = width / targetAspect
  }
  if (height > imageHeight) {
    height = imageHeight
    width = height * targetAspect
  }

  return clampRectToImage(
    {
      x: center.x - width / 2,
      y: center.y - height / 2,
      width,
      height,
    },
    imageWidth,
    imageHeight
  )
}

const applyContextMargin = (
  rect: GuideFocusRect,
  imageWidth: number,
  imageHeight: number,
  marginFactor = DEFAULT_CONTEXT_MARGIN_FACTOR
): GuideFocusRect => {
  if (!isFinitePositive(marginFactor) || marginFactor <= 0) {
    return rect
  }
  const center = rectCenter(rect)
  const width = rect.width * (1 + marginFactor * 2)
  const height = rect.height * (1 + marginFactor * 2)
  return clampRectToImage(
    {
      x: center.x - width / 2,
      y: center.y - height / 2,
      width,
      height,
    },
    imageWidth,
    imageHeight
  )
}

const radarPercentInCrop = (
  radar: GuideMediaRadar | null | undefined,
  crop: GuideFocusRect
): { left: number; top: number } | null => {
  if (!radar) return null
  if (radar.coordinate_space !== STEP_IMAGE_COORDINATE_SPACE) return null
  if (!Number.isFinite(radar.x) || !Number.isFinite(radar.y)) return null

  const x = (radar.x - crop.x) / crop.width
  const y = (radar.y - crop.y) / crop.height
  if (x < 0 || x > 1 || y < 0 || y > 1) return null

  return {
    left: x * 100,
    top: y * 100,
  }
}

const isFocusedRect = (rect: GuideFocusRect, imageWidth: number, imageHeight: number): boolean => {
  return !(almostEqual(rect.x, 0) && almostEqual(rect.y, 0) && almostEqual(rect.width, imageWidth) && almostEqual(rect.height, imageHeight))
}

export const computeFocusTransformV1 = (input: GuideFocusTransformInput): GuideFocusTransformResult => {
  const imageWidth = isFinitePositive(input.image.width) ? input.image.width : null
  const imageHeight = isFinitePositive(input.image.height) ? input.image.height : null
  if (!imageWidth || !imageHeight) {
    return {
      cropRect: { x: 0, y: 0, width: 1, height: 1 },
      zoomScale: 1,
      transformOriginPercent: { x: 50, y: 50 },
      radarPercentInCrop: null,
      hasFocusCrop: false,
    }
  }

  const hints = input.renderHints ?? null
  let crop = fullRect(imageWidth, imageHeight)
  if (hints) {
    const safeRect = safeRectFromHints(hints)
    const derivedRect = derivedRectFromCenterAndZoom(hints, imageWidth, imageHeight)
    const base = safeRect ?? derivedRect
    if (base) {
      crop = clampRectToImage(base, imageWidth, imageHeight)
      crop = adjustRectToViewportAspect(
        crop,
        isFinitePositive(input.viewport.width) ? input.viewport.width : imageWidth,
        isFinitePositive(input.viewport.height) ? input.viewport.height : imageHeight,
        imageWidth,
        imageHeight
      )
      crop = applyContextMargin(crop, imageWidth, imageHeight)
      crop = clampRectToImage(crop, imageWidth, imageHeight)
      crop = roundCropRect(crop, imageWidth, imageHeight)
    }
  }

  const originPoint = hints?.focus_center
  const originX =
    originPoint && originPoint.coordinate_space === STEP_IMAGE_COORDINATE_SPACE && Number.isFinite(originPoint.x)
      ? clamp((originPoint.x / imageWidth) * 100, 0, 100)
      : clamp(((crop.x + crop.width / 2) / imageWidth) * 100, 0, 100)
  const originY =
    originPoint && originPoint.coordinate_space === STEP_IMAGE_COORDINATE_SPACE && Number.isFinite(originPoint.y)
      ? clamp((originPoint.y / imageHeight) * 100, 0, 100)
      : clamp(((crop.y + crop.height / 2) / imageHeight) * 100, 0, 100)

  const zoomScale = Math.max(1, imageWidth / Math.max(1, crop.width))

  return {
    cropRect: crop,
    zoomScale,
    transformOriginPercent: {
      x: originX,
      y: originY,
    },
    radarPercentInCrop: radarPercentInCrop(input.radar, crop),
    hasFocusCrop: isFocusedRect(crop, imageWidth, imageHeight),
  }
}

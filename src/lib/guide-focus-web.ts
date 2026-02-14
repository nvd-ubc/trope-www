import type { GuideFocusTransformResult } from './guide-focus'

export type GuideFocusCanvasTransform = {
  scale: number
  positionX: number
  positionY: number
}

const clamp = (value: number, min: number, max: number): number => Math.min(Math.max(value, min), max)

export const clampGuideCanvasScale = (value: number, minScale: number, maxScale: number): number =>
  clamp(value, minScale, maxScale)

export const computeGuideCanvasFocusTransform = (params: {
  focusTransform: GuideFocusTransformResult
  viewportWidth: number
  viewportHeight: number
  imageWidth: number
  imageHeight: number
  minScale: number
  maxScale: number
}): GuideFocusCanvasTransform => {
  const scale = clampGuideCanvasScale(params.focusTransform.zoomScale, params.minScale, params.maxScale)
  const focusX = (params.focusTransform.transformOriginPercent.x / 100) * params.imageWidth
  const focusY = (params.focusTransform.transformOriginPercent.y / 100) * params.imageHeight
  const positionX = params.viewportWidth / 2 - focusX * scale
  const positionY = params.viewportHeight / 2 - focusY * scale
  return { scale, positionX, positionY }
}

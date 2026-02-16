'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Button from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import StepImageCanvas, { type StepImageCanvasTransformSnapshot } from '@/components/workflow-guide/step-image-canvas'
import { computeFocusTransformV1, GUIDE_FOCUS_CONTEXT_MARGIN_FACTOR } from '@/lib/guide-focus'
import { type GuideStepScreenshotOverridesV1 } from '@/lib/guide-screenshot-focus'
import { clampPercent } from '@/lib/guide-editor'
import type { GuideMediaRenderHints } from '@/lib/guide-media'

type UnitPoint = { x: number; y: number }

type StepImageFocusEditorDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  stepTitle: string
  imageSrc: string
  imageWidth: number
  imageHeight: number
  initialRenderHints: GuideMediaRenderHints | null
  initialCursorAuto: UnitPoint | null
  initialOverrides: GuideStepScreenshotOverridesV1 | null
  onSave: (overrides: GuideStepScreenshotOverridesV1) => void
  onReset: () => void
}

const clampUnit = (value: number): number => Math.max(0, Math.min(1, value))

const MAX_SAVED_ZOOM_SCALE = 4
const CONTEXT_MARGIN_COMPENSATION = 1 + GUIDE_FOCUS_CONTEXT_MARGIN_FACTOR * 2

const percentFromUnitPoint = (point: UnitPoint) => ({
  left: clampPercent(point.x * 100),
  top: clampPercent(point.y * 100),
})

const snapshotToFocusOverride = (snapshot: StepImageCanvasTransformSnapshot): { center_unit: UnitPoint; zoom_scale: number } | null => {
  const viewportWidth = snapshot.viewportSize.width
  const viewportHeight = snapshot.viewportSize.height
  const imageWidth = snapshot.renderedImageSize.width
  const imageHeight = snapshot.renderedImageSize.height
  const scale = snapshot.scale

  if (
    !Number.isFinite(viewportWidth) ||
    !Number.isFinite(viewportHeight) ||
    viewportWidth <= 0 ||
    viewportHeight <= 0
  ) {
    return null
  }
  if (!Number.isFinite(imageWidth) || !Number.isFinite(imageHeight) || imageWidth <= 0 || imageHeight <= 0) {
    return null
  }
  if (!Number.isFinite(scale) || scale <= 0) return null

  const focusX = (viewportWidth / 2 - snapshot.positionX) / scale
  const focusY = (viewportHeight / 2 - snapshot.positionY) / scale
  const normalizedScale = Math.max(1, scale)
  const compensatedScale =
    normalizedScale > 1.001 ? normalizedScale * CONTEXT_MARGIN_COMPENSATION : normalizedScale
  return {
    center_unit: {
      x: clampUnit(focusX / imageWidth),
      y: clampUnit(focusY / imageHeight),
    },
    // computeFocusTransformV1 applies a context margin to the crop, which reduces the effective zoom.
    // Compensate so reopening + saving without edits doesn't "drift" outward on each save.
    zoom_scale: Math.min(MAX_SAVED_ZOOM_SCALE, compensatedScale),
  }
}

export default function StepImageFocusEditorDialog({
  open,
  onOpenChange,
  stepTitle,
  imageSrc,
  imageWidth,
  imageHeight,
  initialRenderHints,
  initialCursorAuto,
  initialOverrides,
  onSave,
  onReset,
}: StepImageFocusEditorDialogProps) {
  const transformSnapshotRef = useRef<StepImageCanvasTransformSnapshot | null>(null)
  const initialCursorOverride = initialOverrides?.cursor?.point_unit ?? null
  const [cursorOverride, setCursorOverride] = useState<UnitPoint | null>(initialCursorOverride ?? initialCursorAuto)
  const [cursorTouched, setCursorTouched] = useState<boolean>(Boolean(initialCursorOverride))
  const [captureClickPoint, setCaptureClickPoint] = useState(false)

  useEffect(() => {
    if (!open) return
    setCaptureClickPoint(false)
    const override = initialOverrides?.cursor?.point_unit ?? null
    setCursorOverride(override ?? initialCursorAuto)
    setCursorTouched(Boolean(override))
  }, [initialCursorAuto, initialOverrides?.cursor?.point_unit, open])

  const focusTransform = useMemo(
    () =>
      computeFocusTransformV1({
        image: { width: imageWidth, height: imageHeight },
        viewport: { width: imageWidth, height: imageHeight },
        renderHints: initialRenderHints,
        radar: null,
      }),
    [imageHeight, imageWidth, initialRenderHints]
  )

  const cursorPercent = cursorOverride ? percentFromUnitPoint(cursorOverride) : null

  const handleCapturePoint = useCallback((pointUnit: UnitPoint) => {
    setCursorTouched(true)
    setCursorOverride(pointUnit)
    setCaptureClickPoint(false)
  }, [])

  const handleSave = () => {
    const snapshot = transformSnapshotRef.current
    if (!snapshot) return
    const focus = snapshotToFocusOverride(snapshot)
    if (!focus) return

    const overrides: GuideStepScreenshotOverridesV1 = {
      focus,
      cursor: cursorTouched && cursorOverride ? { point_unit: cursorOverride } : null,
    }
    onSave(overrides)
    onOpenChange(false)
  }

  const handleReset = () => {
    onReset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[96vh] grid-rows-[auto_minmax(0,1fr)] overflow-hidden p-4 sm:p-5"
        style={{ width: 'min(98vw, 1320px)', maxWidth: 'min(98vw, 1320px)' }}
        showCloseButton
      >
        <DialogHeader className="space-y-1">
          <DialogTitle>Screenshot focus</DialogTitle>
          <DialogDescription>
            Adjust the default zoom/pan for this step. Toggle "Set click point" to override the cursor hotspot.
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="min-w-0 text-sm font-semibold text-slate-900">
              {stepTitle || 'Step screenshot'}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant={captureClickPoint ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setCaptureClickPoint((value) => !value)}
              >
                {captureClickPoint ? 'Click anywhere...' : 'Set click point'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setCursorTouched(false)
                  setCursorOverride(initialCursorAuto)
                  setCaptureClickPoint(false)
                }}
                disabled={!cursorTouched}
              >
                Revert click point
              </Button>
              <Button variant="outline" size="sm" onClick={handleReset}>
                Reset to auto
              </Button>
              <Button variant="primary" size="sm" onClick={handleSave}>
                Save
              </Button>
            </div>
          </div>

          <div className="min-h-0">
            <StepImageCanvas
              src={imageSrc}
              alt={stepTitle}
              focusTransform={focusTransform}
              sourceImageSize={{ width: imageWidth, height: imageHeight }}
              radarPercent={cursorPercent}
              showRadar={Boolean(cursorPercent)}
              active={open}
              autoFocusOnActive
              showControls
              showFloatingZoomButtons
              compact={false}
              transformSnapshotRef={transformSnapshotRef}
              captureClickPoint={captureClickPoint}
              onCaptureClickPoint={handleCapturePoint}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

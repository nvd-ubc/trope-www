'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import StepImageCanvas from '@/components/workflow-guide/step-image-canvas'
import {
  resolveGuideCursorOverlayMode,
  type GuideCursorOverlayMode,
} from '@/lib/guide-cursor'
import { getRadarPercent } from '@/lib/guide-editor'
import { computeFocusTransformV1 } from '@/lib/guide-focus'
import {
  resolveRenderableCursorTrack,
  resolveStepImageVariant,
  shouldRenderStepRadar,
  type GuideMediaStepImage,
} from '@/lib/guide-media'

type GuideStepLike = {
  id: string
  title: string
  kind?: string | null
  expected_event?: unknown
}

type StepImageViewerDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  step: GuideStepLike
  fullSrc: string | null
  image: GuideMediaStepImage | null
  cursorOverlayMode?: GuideCursorOverlayMode | string | null
}

export default function StepImageViewerDialog({
  open,
  onOpenChange,
  step,
  fullSrc,
  image,
  cursorOverlayMode,
}: StepImageViewerDialogProps) {
  const resolvedCursorOverlayMode = resolveGuideCursorOverlayMode(cursorOverlayMode)
  const fullVariant = image
    ? resolveStepImageVariant(image, { surface: 'detail', requestedVariant: 'full' })
    : null
  const width = image?.width ?? fullVariant?.width ?? null
  const height = image?.height ?? fullVariant?.height ?? null
  const cursorTrack = resolveRenderableCursorTrack({
    cursorTrack: image?.cursor_track ?? null,
    width,
    height,
  })
  const focusTransform = computeFocusTransformV1({
    image: { width, height },
    viewport: { width, height },
    renderHints: image?.render_hints ?? null,
    radar: image?.radar ?? null,
  })
  const radarPercent = shouldRenderStepRadar({
    step,
    radar: image?.radar ?? null,
    width,
    height,
  })
    ? getRadarPercent(image?.radar ?? null, width, height)
    : null
  const showCapturedCursor = resolvedCursorOverlayMode === 'captured_cursor' && Boolean(cursorTrack)
  const showRadar =
    (resolvedCursorOverlayMode === 'radar_dot' ||
      (resolvedCursorOverlayMode === 'captured_cursor' && !showCapturedCursor)) &&
    Boolean(radarPercent && (!focusTransform.hasFocusCrop || focusTransform.radarPercentInCrop !== null))
  const imageWidth = typeof width === 'number' && width > 0 ? width : 1
  const imageHeight = typeof height === 'number' && height > 0 ? height : 1

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[96vh] grid-rows-[auto_minmax(0,1fr)] overflow-hidden p-4 sm:p-5"
        style={{ width: 'min(98vw, 1320px)', maxWidth: 'min(98vw, 1320px)' }}
        showCloseButton
      >
        <DialogHeader className="space-y-1">
          <DialogTitle>{step.title || 'Step screenshot'}</DialogTitle>
          <DialogDescription>
            Use bottom-right +/-, scroll wheel, or keyboard (`+`, `-`, `0`, `f`, arrows).
          </DialogDescription>
        </DialogHeader>
        {fullSrc ? (
          <div className="min-h-0">
            <StepImageCanvas
              src={fullSrc}
              alt={step.title}
              focusTransform={focusTransform}
              sourceImageSize={{ width: imageWidth, height: imageHeight }}
              radarPercent={radarPercent}
              showRadar={showRadar}
              cursorTrack={cursorTrack}
              showCapturedCursor={showCapturedCursor}
              active={open}
              autoFocusOnActive={false}
              showControls={false}
            />
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500">
            Full screenshot is unavailable.
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

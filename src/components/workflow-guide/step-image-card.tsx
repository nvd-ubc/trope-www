'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import StepImageCanvas from '@/components/workflow-guide/step-image-canvas'
import StepImageViewerDialog from '@/components/workflow-guide/step-image-viewer-dialog'
import { getRadarPercent } from '@/lib/guide-editor'
import { computeFocusTransformV1 } from '@/lib/guide-focus'
import {
  resolveStepFocusFallbackReason,
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

type StepImageCardProps = {
  step: GuideStepLike
  image: GuideMediaStepImage | null
  previewSrc: string | null
  fullSrc: string | null
  maxHeightClass: string
  onTelemetryEvent?: (
    eventType:
      | 'workflow_doc_focus_applied'
      | 'workflow_doc_focus_fallback'
      | 'workflow_doc_step_image_open_full',
    properties: Record<string, unknown>
  ) => void
}

const confidenceBucket = (value: number | null | undefined): string => {
  if (typeof value !== 'number' || !Number.isFinite(value)) return 'unknown'
  if (value >= 0.75) return 'high'
  if (value >= 0.55) return 'medium'
  return 'low'
}

const zoomBucket = (value: number): string => {
  if (!Number.isFinite(value) || value <= 1.05) return 'none'
  if (value <= 1.25) return 'mild'
  if (value <= 1.6) return 'medium'
  return 'strong'
}

export default function StepImageCard({
  step,
  image,
  previewSrc,
  fullSrc,
  maxHeightClass,
  onTelemetryEvent,
}: StepImageCardProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const focusTelemetryKeyRef = useRef<string | null>(null)

  const previewImage = useMemo(
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

  const radar = image?.radar ?? null
  const width = image?.width ?? previewImage?.width ?? null
  const height = image?.height ?? previewImage?.height ?? null
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

  const focusTransform = useMemo(
    () =>
      computeFocusTransformV1({
        image: {
          width,
          height,
        },
        viewport: {
          width: previewImage?.width ?? width,
          height: previewImage?.height ?? height,
        },
        renderHints: image?.render_hints ?? null,
        radar,
    }),
    [height, image?.render_hints, previewImage?.height, previewImage?.width, radar, width]
  )
  const fallbackReason = resolveStepFocusFallbackReason({
    step,
    renderHints: image?.render_hints ?? null,
    hasFocusCrop: focusTransform.hasFocusCrop,
    zoomScale: focusTransform.zoomScale,
  })
  const shouldApplyFocus = fallbackReason === null
  const showRadar = Boolean(
    radarPercent && (!shouldApplyFocus || focusTransform.radarPercentInCrop !== null)
  )

  const hasImage = Boolean(
    previewSrc && fullSrc && (previewImage?.downloadUrl || fullImage?.downloadUrl || image?.download_url)
  )
  const imageWidth = typeof width === 'number' && width > 0 ? width : 1
  const imageHeight = typeof height === 'number' && height > 0 ? height : 1

  const source = (image?.render_hints?.source ?? 'none').toString()
  const baseTelemetryProperties = {
    step_id: step.id,
    step_kind: step.kind ?? null,
    source,
    confidence_bucket: confidenceBucket(image?.render_hints?.confidence ?? null),
    zoom_bucket: zoomBucket(focusTransform.zoomScale),
  } satisfies Record<string, unknown>

  useEffect(() => {
    if (!onTelemetryEvent) return
    if (!hasImage || !previewSrc || !fullSrc) return
    const key = `${step.id}:${image?.step_id ?? 'no-image'}:${shouldApplyFocus ? 'applied' : fallbackReason}`
    if (focusTelemetryKeyRef.current === key) return
    if (shouldApplyFocus) {
      onTelemetryEvent('workflow_doc_focus_applied', baseTelemetryProperties)
    } else {
      onTelemetryEvent('workflow_doc_focus_fallback', {
        ...baseTelemetryProperties,
        fallback_reason: fallbackReason,
      })
    }
    focusTelemetryKeyRef.current = key
  }, [
    baseTelemetryProperties,
    fallbackReason,
    fullSrc,
    hasImage,
    image?.step_id,
    onTelemetryEvent,
    previewSrc,
    shouldApplyFocus,
    step.id,
  ])

  const emitOpenFullTelemetry = () => {
    onTelemetryEvent?.('workflow_doc_step_image_open_full', {
      ...baseTelemetryProperties,
      focus_enabled: true,
    })
  }

  if (!hasImage || !previewSrc || !fullSrc) {
    return (
      <div className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500">
        No screenshot available for this step.
      </div>
    )
  }

  return (
    <>
      <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
        <StepImageCanvas
          src={fullSrc}
          alt={step.title}
          focusTransform={focusTransform}
          sourceImageSize={{ width: imageWidth, height: imageHeight }}
          radarPercent={radarPercent}
          showRadar={showRadar}
          active
          compact
          showControls={false}
          imageClassName={maxHeightClass}
        />
      </div>
      <div className="mt-2 flex items-center justify-between gap-3 text-xs text-slate-500">
        <span>Scroll to zoom, drag to pan, or use bottom-right +/-.</span>
        <button
          type="button"
          className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
          onClick={() => {
            emitOpenFullTelemetry()
            setDialogOpen(true)
          }}
        >
          Open full view
        </button>
      </div>
      <StepImageViewerDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        step={step}
        fullSrc={fullSrc}
        image={image}
      />
    </>
  )
}

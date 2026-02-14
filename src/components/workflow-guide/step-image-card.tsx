'use client'

import { useMemo, useState } from 'react'
import StepImageViewerDialog from '@/components/workflow-guide/step-image-viewer-dialog'
import { getRadarPercent } from '@/lib/guide-editor'
import { computeFocusTransformV1 } from '@/lib/guide-focus'
import {
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
}

export default function StepImageCard({
  step,
  image,
  previewSrc,
  fullSrc,
  maxHeightClass,
}: StepImageCardProps) {
  const focusZoomEnabled = process.env.NEXT_PUBLIC_TROPE_GUIDE_FOCUS_ZOOM === '1'
  const [dialogOpen, setDialogOpen] = useState(false)

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
  const shouldApplyFocus =
    focusZoomEnabled && focusTransform.hasFocusCrop && Boolean(image?.render_hints)
  const showRadar = Boolean(
    radarPercent && (!shouldApplyFocus || focusTransform.radarPercentInCrop !== null)
  )

  const hasImage = Boolean(
    previewSrc && fullSrc && (previewImage?.downloadUrl || fullImage?.downloadUrl || image?.download_url)
  )

  if (!hasImage || !previewSrc || !fullSrc) {
    return (
      <div className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500">
        No screenshot available for this step.
      </div>
    )
  }

  const imageFrame = (
    <div className="relative mx-auto w-fit max-w-full overflow-hidden bg-slate-100">
      <div
        className="relative transition-transform duration-300 ease-out"
        style={
          shouldApplyFocus
            ? {
                transform: `scale(${focusTransform.zoomScale})`,
                transformOrigin: `${focusTransform.transformOriginPercent.x}% ${focusTransform.transformOriginPercent.y}%`,
                willChange: 'transform',
              }
            : undefined
        }
      >
        <img
          src={previewSrc}
          alt={step.title}
          loading="lazy"
          className={`block h-auto w-auto max-w-full ${maxHeightClass}`}
        />
        {showRadar && radarPercent && (
          <div className="pointer-events-none absolute inset-0">
            <div
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${radarPercent.left}%`, top: `${radarPercent.top}%` }}
            >
              <div className="relative h-5 w-5">
                <div className="absolute inset-0 rounded-full bg-[color:var(--trope-accent)] opacity-25" />
                <div className="absolute inset-[5px] rounded-full bg-[color:var(--trope-accent)] shadow-sm" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )

  if (focusZoomEnabled) {
    return (
      <>
        <button
          type="button"
          className="group mt-4 block w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-50 text-left focus:outline-none focus:ring-2 focus:ring-[color:var(--trope-accent)]"
          onClick={() => setDialogOpen(true)}
        >
          {imageFrame}
        </button>
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

  return (
    <a
      href={fullSrc}
      target="_blank"
      rel="noreferrer"
      className="group mt-4 block overflow-hidden rounded-xl border border-slate-200 bg-slate-50"
    >
      {imageFrame}
    </a>
  )
}

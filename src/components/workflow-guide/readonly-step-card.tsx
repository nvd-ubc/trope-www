'use client'

import { Link2 } from 'lucide-react'
import GuideStepImageCard from '@/components/workflow-guide/step-image-card'
import { type GuideMediaStepImage } from '@/lib/guide-media'
import { cn } from '@/lib/utils'

type GuideStepLike = {
  id: string
  title: string
  instructions?: string | null
  kind?: string | null
  expected_event?: unknown
  [key: string]: unknown
}

type ManualCalloutConfig = {
  label?: string | null
  instructionText?: string | null
  containerClassName?: string
  badgeClassName?: string
}

type ReadonlyStepCardProps = {
  step: GuideStepLike
  index: number
  image: GuideMediaStepImage | null
  previewSrc: string | null
  fullSrc: string | null
  imageMaxHeightClass?: string
  onTelemetryEvent?: (
    eventType:
      | 'workflow_doc_focus_applied'
      | 'workflow_doc_focus_fallback'
      | 'workflow_doc_step_image_open_full',
    properties: Record<string, unknown>
  ) => void
  onCopyStepLink?: (() => void) | null
  instructionText?: string | null
  whyText?: string | null
  manualCallout?: ManualCalloutConfig | null
  className?: string
}

const resolveInstructionText = (
  step: GuideStepLike,
  override: string | null | undefined
): string => {
  if (typeof override === 'string' && override.trim().length > 0) return override.trim()
  if (typeof step.instructions === 'string' && step.instructions.trim().length > 0) {
    return step.instructions.trim()
  }
  return step.title
}

const resolveWhyText = (
  step: GuideStepLike,
  override: string | null | undefined
): string | null => {
  if (typeof override === 'string' && override.trim().length > 0) return override.trim()
  const candidates = [
    step.why,
    step.rationale,
    step.reason,
    step.why_this_matters,
    step.why_this_step,
    step.justification,
  ]
  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim().length > 0) {
      return candidate.trim()
    }
  }
  return null
}

export default function ReadonlyStepCard({
  step,
  index,
  image,
  previewSrc,
  fullSrc,
  imageMaxHeightClass = 'max-h-[27rem]',
  onTelemetryEvent,
  onCopyStepLink,
  instructionText,
  whyText,
  manualCallout,
  className,
}: ReadonlyStepCardProps) {
  const resolvedInstructionText = resolveInstructionText(step, instructionText)
  const resolvedWhyText = resolveWhyText(step, whyText)
  const isManualStep = (step.kind ?? '').trim().toLowerCase() === 'manual'
  const manualLabelCandidate = manualCallout?.label?.trim().toLowerCase()
  const manualLabel = manualLabelCandidate && manualLabelCandidate.length > 0 ? manualLabelCandidate : 'note'
  const manualInstruction = resolveInstructionText(step, manualCallout?.instructionText)
  const manualContainerClassName = manualCallout?.containerClassName ?? 'border-sky-200 bg-sky-50'
  const manualBadgeClassName = manualCallout?.badgeClassName ?? 'bg-sky-100 text-sky-700'

  return (
    <div className={cn('group/step rounded-2xl border border-slate-200 bg-white p-6', className)}>
      <div className="flex min-w-0 items-center gap-3">
        {typeof onCopyStepLink === 'function' ? (
          <button
            type="button"
            onClick={onCopyStepLink}
            className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xl font-semibold text-[color:var(--trope-accent)] transition-colors hover:bg-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--trope-accent)]/35"
            aria-label={`Copy link for step ${index + 1}`}
            title="Copy step link"
          >
            <span className="transition-opacity duration-200 ease-out group-hover/step:opacity-0 group-focus-within/step:opacity-0">
              {index + 1}
            </span>
            <span className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 ease-out group-hover/step:opacity-100 group-focus-within/step:opacity-100">
              <Link2 className="size-5" />
            </span>
          </button>
        ) : (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xl font-semibold text-[color:var(--trope-accent)]">
            {index + 1}
          </div>
        )}
        <div className="min-w-0 flex-1 space-y-1">
          <p className="line-clamp-2 text-base font-medium leading-snug text-slate-900">
            {resolvedInstructionText}
          </p>
          {resolvedWhyText ? (
            <p className="text-sm text-slate-600">
              <span className="font-semibold text-slate-700">Why:</span> {resolvedWhyText}
            </p>
          ) : null}
        </div>
      </div>

      {isManualStep ? (
        <div className={cn('mt-4 rounded-xl border px-4 py-3', manualContainerClassName)}>
          <span
            className={cn(
              'rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
              manualBadgeClassName
            )}
          >
            {manualLabel}
          </span>
          <p className="mt-2 text-sm text-slate-700">{manualInstruction}</p>
        </div>
      ) : (
        <GuideStepImageCard
          step={step}
          image={image}
          previewSrc={previewSrc}
          fullSrc={fullSrc}
          maxHeightClass={imageMaxHeightClass}
          onTelemetryEvent={onTelemetryEvent}
        />
      )}
    </div>
  )
}

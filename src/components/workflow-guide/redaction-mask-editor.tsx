'use client'

import { useMemo, useRef, useState } from 'react'
import Button from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export type GuideRedactionMaskKind = 'blur' | 'solid' | 'pixelate'

export type GuideRedactionMask = {
  id: string
  kind: GuideRedactionMaskKind
  rect: {
    x: number
    y: number
    width: number
    height: number
  }
  strength?: number
  color?: string
}

type RedactionMaskEditorProps = {
  imageSrc: string
  masks: GuideRedactionMask[]
  onChange: (nextMasks: GuideRedactionMask[]) => void
  disabled?: boolean
}

type DraftRect = {
  x: number
  y: number
  width: number
  height: number
}

const MIN_MASK_SIZE = 0.01

const clampUnit = (value: number): number => Math.max(0, Math.min(1, value))

const createMaskId = (): string => `mask_${Math.random().toString(36).slice(2, 10)}`

const maskSurfaceClass = (kind: GuideRedactionMaskKind): string => {
  if (kind === 'solid') {
    return 'border-slate-900 bg-slate-900/65'
  }
  if (kind === 'pixelate') {
    return 'border-violet-600 bg-violet-500/20'
  }
  return 'border-cyan-600 bg-cyan-500/20'
}

const normalizeRect = (
  start: { x: number; y: number },
  current: { x: number; y: number }
): DraftRect => {
  const left = Math.min(start.x, current.x)
  const top = Math.min(start.y, current.y)
  const right = Math.max(start.x, current.x)
  const bottom = Math.max(start.y, current.y)
  return {
    x: clampUnit(left),
    y: clampUnit(top),
    width: clampUnit(right) - clampUnit(left),
    height: clampUnit(bottom) - clampUnit(top),
  }
}

export default function RedactionMaskEditor({
  imageSrc,
  masks,
  onChange,
  disabled = false,
}: RedactionMaskEditorProps) {
  const frameRef = useRef<HTMLDivElement | null>(null)
  const startRef = useRef<{ x: number; y: number } | null>(null)
  const [nextKind, setNextKind] = useState<GuideRedactionMaskKind>('blur')
  const [draftRect, setDraftRect] = useState<DraftRect | null>(null)
  const [isDrawing, setIsDrawing] = useState(false)

  const sortedMasks = useMemo(
    () =>
      [...masks].sort((left, right) => {
        const leftArea = left.rect.width * left.rect.height
        const rightArea = right.rect.width * right.rect.height
        return rightArea - leftArea
      }),
    [masks]
  )

  const pointerToUnitPoint = (clientX: number, clientY: number): { x: number; y: number } | null => {
    const frame = frameRef.current
    if (!frame) return null
    const rect = frame.getBoundingClientRect()
    if (rect.width <= 0 || rect.height <= 0) return null
    return {
      x: clampUnit((clientX - rect.left) / rect.width),
      y: clampUnit((clientY - rect.top) / rect.height),
    }
  }

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (disabled || event.button !== 0) return
    const point = pointerToUnitPoint(event.clientX, event.clientY)
    if (!point) return
    event.preventDefault()
    event.currentTarget.setPointerCapture(event.pointerId)
    startRef.current = point
    setDraftRect({ x: point.x, y: point.y, width: 0, height: 0 })
    setIsDrawing(true)
  }

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isDrawing || !startRef.current) return
    const point = pointerToUnitPoint(event.clientX, event.clientY)
    if (!point) return
    event.preventDefault()
    setDraftRect(normalizeRect(startRef.current, point))
  }

  const finalizeDraft = () => {
    const nextRect = draftRect
    startRef.current = null
    setIsDrawing(false)
    setDraftRect(null)
    if (!nextRect) return
    if (nextRect.width < MIN_MASK_SIZE || nextRect.height < MIN_MASK_SIZE) return
    const newMask: GuideRedactionMask = {
      id: createMaskId(),
      kind: nextKind,
      rect: {
        x: nextRect.x,
        y: nextRect.y,
        width: nextRect.width,
        height: nextRect.height,
      },
      strength: 0.7,
      color: nextKind === 'solid' ? '#000000' : undefined,
    }
    onChange([...masks, newMask])
  }

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isDrawing) return
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
    finalizeDraft()
  }

  const updateMask = (maskId: string, updater: (mask: GuideRedactionMask) => GuideRedactionMask) => {
    onChange(
      masks.map((mask) => (mask.id === maskId ? updater(mask) : mask))
    )
  }

  const removeMask = (maskId: string) => {
    onChange(masks.filter((mask) => mask.id !== maskId))
  }

  return (
    <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Screenshot redaction
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={nextKind}
            onValueChange={(value) => setNextKind(value as GuideRedactionMaskKind)}
            disabled={disabled}
          >
            <SelectTrigger className="h-8 w-[9.5rem] bg-white text-xs">
              <SelectValue placeholder="Mask style" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="blur">Blur</SelectItem>
              <SelectItem value="solid">Solid box</SelectItem>
              <SelectItem value="pixelate">Pixelate</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onChange([])}
            disabled={disabled || masks.length === 0}
          >
            Clear
          </Button>
        </div>
      </div>

      <p className="mt-2 text-xs text-slate-500">
        Drag on the screenshot to add a redaction region.
      </p>

      <div
        ref={frameRef}
        className={`relative mt-3 overflow-hidden rounded-lg border border-slate-300 bg-black/5 ${
          disabled ? 'cursor-default' : 'cursor-crosshair'
        }`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={() => {
          startRef.current = null
          setIsDrawing(false)
          setDraftRect(null)
        }}
      >
        <img src={imageSrc} alt="Step redaction editor" className="block h-auto w-full select-none" draggable={false} />
        <div className="pointer-events-none absolute inset-0">
          {sortedMasks.map((mask) => (
            <div
              key={mask.id}
              className={`absolute rounded-sm border-2 ${maskSurfaceClass(mask.kind)}`}
              style={{
                left: `${mask.rect.x * 100}%`,
                top: `${mask.rect.y * 100}%`,
                width: `${mask.rect.width * 100}%`,
                height: `${mask.rect.height * 100}%`,
              }}
            />
          ))}
          {draftRect && (
            <div
              className="absolute rounded-sm border-2 border-[color:var(--trope-accent)] bg-[color:var(--trope-accent)]/25"
              style={{
                left: `${draftRect.x * 100}%`,
                top: `${draftRect.y * 100}%`,
                width: `${draftRect.width * 100}%`,
                height: `${draftRect.height * 100}%`,
              }}
            />
          )}
        </div>
      </div>

      <div className="mt-3 space-y-2">
        {masks.length === 0 && (
          <div className="text-xs text-slate-500">No masks yet.</div>
        )}
        {masks.map((mask, index) => (
          <div
            key={mask.id}
            className="grid gap-2 rounded-lg border border-slate-200 bg-white p-2 sm:grid-cols-[8rem_1fr_auto]"
          >
            <div className="text-xs font-medium text-slate-600">Mask {index + 1}</div>
            <div className="flex flex-wrap items-center gap-2">
              <Select
                value={mask.kind}
                onValueChange={(value) =>
                  updateMask(mask.id, (current) => ({
                    ...current,
                    kind: value as GuideRedactionMaskKind,
                    color:
                      value === 'solid'
                        ? current.color ?? '#000000'
                        : undefined,
                  }))
                }
                disabled={disabled}
              >
                <SelectTrigger className="h-7 w-[8.5rem] text-xs">
                  <SelectValue placeholder="Mask style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="blur">Blur</SelectItem>
                  <SelectItem value="solid">Solid box</SelectItem>
                  <SelectItem value="pixelate">Pixelate</SelectItem>
                </SelectContent>
              </Select>
              {mask.kind === 'solid' && (
                <input
                  type="color"
                  aria-label="Mask color"
                  value={mask.color ?? '#000000'}
                  onChange={(event) =>
                    updateMask(mask.id, (current) => ({
                      ...current,
                      color: event.target.value,
                    }))
                  }
                  className="h-7 w-10 rounded border border-slate-200 bg-transparent p-0.5"
                  disabled={disabled}
                />
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => removeMask(mask.id)}
              disabled={disabled}
            >
              Remove
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}

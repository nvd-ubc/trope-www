'use client'

import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch'
import StepImageControls from '@/components/workflow-guide/step-image-controls'
import {
  clampGuideCanvasScale,
  computeGuideCanvasFocusTransform,
} from '@/lib/guide-focus-web'
import type { GuideFocusTransformResult } from '@/lib/guide-focus'

type StepImageCanvasProps = {
  src: string
  alt: string
  focusTransform: GuideFocusTransformResult
  sourceImageSize: { width: number; height: number }
  radarPercent: { left: number; top: number } | null
  showRadar: boolean
  active: boolean
}

type TransformState = {
  scale: number
  positionX: number
  positionY: number
}

const MIN_SCALE = 1
const MAX_SCALE = 4
const PAN_KEYBOARD_DELTA = 40

export default function StepImageCanvas({
  src,
  alt,
  focusTransform,
  sourceImageSize,
  radarPercent,
  showRadar,
  active,
}: StepImageCanvasProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const controlsRef = useRef<{
    zoomIn: () => void
    zoomOut: () => void
    resetTransform: () => void
    setTransform: (x: number, y: number, scale: number, animationTime?: number) => void
  } | null>(null)

  const [transformState, setTransformState] = useState<TransformState>({
    scale: 1,
    positionX: 0,
    positionY: 0,
  })
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 })
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const apply = () => setPrefersReducedMotion(mediaQuery.matches)
    apply()
    mediaQuery.addEventListener('change', apply)
    return () => mediaQuery.removeEventListener('change', apply)
  }, [])

  useEffect(() => {
    if (!containerRef.current) return
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (!entry) return
      const rect = entry.contentRect
      setViewportSize({ width: rect.width, height: rect.height })
    })
    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [])

  const setTransform = useCallback((x: number, y: number, scale: number, animated = true) => {
    controlsRef.current?.setTransform(
      x,
      y,
      clampGuideCanvasScale(scale, MIN_SCALE, MAX_SCALE),
      animated && !prefersReducedMotion ? 180 : 0
    )
  }, [prefersReducedMotion])

  const resetToFit = useCallback(() => {
    controlsRef.current?.resetTransform()
  }, [])

  const jumpToFocus = useCallback(() => {
    if (!focusTransform.hasFocusCrop) {
      resetToFit()
      return
    }
    if (viewportSize.width <= 0 || viewportSize.height <= 0) {
      return
    }
    const focused = computeGuideCanvasFocusTransform({
      focusTransform,
      viewportWidth: viewportSize.width,
      viewportHeight: viewportSize.height,
      imageWidth: sourceImageSize.width,
      imageHeight: sourceImageSize.height,
      minScale: MIN_SCALE,
      maxScale: MAX_SCALE,
    })
    setTransform(focused.positionX, focused.positionY, focused.scale)
  }, [focusTransform, resetToFit, setTransform, sourceImageSize.height, sourceImageSize.width, viewportSize.height, viewportSize.width])

  useEffect(() => {
    if (!active) return
    if (focusTransform.hasFocusCrop) {
      const id = window.setTimeout(() => jumpToFocus(), 0)
      return () => window.clearTimeout(id)
    }
    const id = window.setTimeout(() => resetToFit(), 0)
    return () => window.clearTimeout(id)
  }, [active, focusTransform.hasFocusCrop, jumpToFocus, resetToFit])

  const handleKeyboard = useCallback((event: KeyboardEvent<HTMLDivElement>) => {
    if (!controlsRef.current) return
    if (event.key === '+' || event.key === '=') {
      event.preventDefault()
      controlsRef.current.zoomIn()
      return
    }
    if (event.key === '-') {
      event.preventDefault()
      controlsRef.current.zoomOut()
      return
    }
    if (event.key === '0') {
      event.preventDefault()
      resetToFit()
      return
    }
    if (event.key.toLowerCase() === 'f') {
      event.preventDefault()
      jumpToFocus()
      return
    }
    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      setTransform(
        transformState.positionX + PAN_KEYBOARD_DELTA,
        transformState.positionY,
        transformState.scale
      )
      return
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault()
      setTransform(
        transformState.positionX - PAN_KEYBOARD_DELTA,
        transformState.positionY,
        transformState.scale
      )
      return
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault()
      setTransform(
        transformState.positionX,
        transformState.positionY + PAN_KEYBOARD_DELTA,
        transformState.scale
      )
      return
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setTransform(
        transformState.positionX,
        transformState.positionY - PAN_KEYBOARD_DELTA,
        transformState.scale
      )
    }
  }, [jumpToFocus, resetToFit, setTransform, transformState.positionX, transformState.positionY, transformState.scale])

  const ariaZoom = useMemo(() => `${Math.round(transformState.scale * 100)}%`, [transformState.scale])

  return (
    <div className="space-y-3">
      <StepImageControls
        zoomScale={transformState.scale}
        minScale={MIN_SCALE}
        maxScale={MAX_SCALE}
        canFocus={focusTransform.hasFocusCrop}
        onFit={resetToFit}
        onActualSize={() => setTransform(transformState.positionX, transformState.positionY, 1)}
        onFocus={jumpToFocus}
        onReset={resetToFit}
        onZoomIn={() => controlsRef.current?.zoomIn()}
        onZoomOut={() => controlsRef.current?.zoomOut()}
        onZoomScaleChange={(scale) =>
          setTransform(transformState.positionX, transformState.positionY, scale)
        }
      />
      <div
        ref={containerRef}
        className="rounded-lg border border-slate-200 bg-slate-50 p-2 focus:outline-none focus:ring-2 focus:ring-[color:var(--trope-accent)]"
        tabIndex={0}
        onKeyDown={handleKeyboard}
        aria-label={`Step image zoom canvas at ${ariaZoom}`}
      >
        <TransformWrapper
          minScale={MIN_SCALE}
          maxScale={MAX_SCALE}
          centerOnInit
          limitToBounds
          wheel={{ step: 0.12 }}
          doubleClick={{ mode: 'toggle' }}
          pinch={{ step: 5 }}
          panning={{ velocityDisabled: true }}
          onTransformed={(ref) => {
            controlsRef.current = {
              zoomIn: ref.zoomIn,
              zoomOut: ref.zoomOut,
              resetTransform: ref.resetTransform,
              setTransform: ref.setTransform,
            }
            setTransformState({
              scale: ref.state.scale,
              positionX: ref.state.positionX,
              positionY: ref.state.positionY,
            })
          }}
        >
          <TransformComponent
            wrapperClass="!w-full !h-[70vh] max-h-[70vh]"
            contentClass="!w-fit !h-fit !overflow-visible"
          >
            <div className="relative">
              <img
                src={src}
                alt={alt}
                className="block h-auto max-h-[68vh] w-auto max-w-[88vw] select-none"
                draggable={false}
              />
              {showRadar && radarPercent && (
                <div className="pointer-events-none absolute inset-0">
                  <div
                    className="absolute -translate-x-1/2 -translate-y-1/2"
                    style={{ left: `${radarPercent.left}%`, top: `${radarPercent.top}%` }}
                  >
                    <div className="relative h-6 w-6">
                      <div className="absolute inset-0 rounded-full bg-[color:var(--trope-accent)] opacity-25" />
                      <div className="absolute inset-[6px] rounded-full bg-[color:var(--trope-accent)] shadow-sm" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </TransformComponent>
        </TransformWrapper>
      </div>
    </div>
  )
}

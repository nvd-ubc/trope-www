'use client'

import { ButtonGroup } from '@/components/ui/button-group'
import Button from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

type StepImageControlsProps = {
  zoomScale: number
  minScale: number
  maxScale: number
  canFocus: boolean
  onFit: () => void
  onActualSize: () => void
  onFocus: () => void
  onReset: () => void
  onZoomIn: () => void
  onZoomOut: () => void
  onZoomScaleChange: (scale: number) => void
}

export default function StepImageControls({
  zoomScale,
  minScale,
  maxScale,
  canFocus,
  onFit,
  onActualSize,
  onFocus,
  onReset,
  onZoomIn,
  onZoomOut,
  onZoomScaleChange,
}: StepImageControlsProps) {
  return (
    <TooltipProvider>
      <div className="flex flex-wrap items-center gap-2">
        <ButtonGroup>
          <Button size="sm" variant="outline" onClick={onFit}>
            Fit
          </Button>
          <Button size="sm" variant="outline" onClick={onActualSize}>
            100%
          </Button>
          <Button size="sm" variant="outline" onClick={onFocus} disabled={!canFocus}>
            Focus
          </Button>
          <Button size="sm" variant="outline" onClick={onReset}>
            Reset
          </Button>
        </ButtonGroup>
        <ButtonGroup>
          <Button size="sm" variant="outline" onClick={onZoomOut} aria-label="Zoom out">
            -
          </Button>
          <Button size="sm" variant="outline" onClick={onZoomIn} aria-label="Zoom in">
            +
          </Button>
        </ButtonGroup>
        <Tooltip>
          <TooltipTrigger asChild>
            <input
              aria-label="Zoom level"
              className="h-2 w-36 cursor-pointer accent-[var(--trope-accent)]"
              min={minScale}
              max={maxScale}
              step={0.01}
              type="range"
              value={Math.min(maxScale, Math.max(minScale, zoomScale))}
              onChange={(event) => onZoomScaleChange(Number.parseFloat(event.target.value))}
            />
          </TooltipTrigger>
          <TooltipContent sideOffset={6}>{Math.round(zoomScale * 100)}%</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  )
}

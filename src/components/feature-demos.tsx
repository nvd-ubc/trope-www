'use client'

import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react'

// Context for coordinating auto-play across demos
interface AutoPlayContextType {
  activeIndex: number
  isAutoPlaying: boolean
  setActiveIndex: (index: number) => void
  pauseAutoPlay: () => void
  resumeAutoPlay: () => void
}

const AutoPlayContext = createContext<AutoPlayContextType | null>(null)

// Timer indicator component - positioned by parent
// Uses a key prop from parent to reset animation when active item changes
function TimerIndicator({ duration }: { duration: number }) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    // Start from 0 and animate to full
    setProgress(0)
    // Small delay to ensure the reset happens before animation starts
    const startTimeout = setTimeout(() => {
      setProgress(100)
    }, 50)

    return () => clearTimeout(startTimeout)
  }, [])

  return (
    <div className="w-5 h-5">
      <svg className="w-5 h-5 -rotate-90" viewBox="0 0 24 24">
        <circle
          cx="12"
          cy="12"
          r="10"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-[#1861C8]/20"
        />
        <circle
          cx="12"
          cy="12"
          r="10"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeDasharray={62.83}
          strokeDashoffset={62.83 - (62.83 * progress) / 100}
          className="text-[#61AFF9] transition-all ease-linear"
          style={{ transitionDuration: progress === 100 ? `${duration}ms` : '0ms' }}
        />
      </svg>
    </div>
  )
}

// Wrapper component that manages auto-play sequence
export function FeatureDemosContainer({ children }: { children: React.ReactNode }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [isPaused, setIsPaused] = useState(false)

  const pauseAutoPlay = useCallback(() => {
    setIsPaused(true)
  }, [])

  const resumeAutoPlay = useCallback(() => {
    setIsPaused(false)
  }, [])

  // Auto-advance through demos
  useEffect(() => {
    if (!isAutoPlaying || isPaused) return

    const interval = setInterval(() => {
      setActiveIndex(i => (i + 1) % 3)
    }, 5000) // 5 seconds per demo

    return () => clearInterval(interval)
  }, [isAutoPlaying, isPaused])

  return (
    <AutoPlayContext.Provider value={{ activeIndex, isAutoPlaying, setActiveIndex, pauseAutoPlay, resumeAutoPlay }}>
      {children}
    </AutoPlayContext.Provider>
  )
}

// Hook to use auto-play context
function useAutoPlay(index: number) {
  const context = useContext(AutoPlayContext)
  const [isHovered, setIsHovered] = useState(false)

  const isActive = context ? context.activeIndex === index || isHovered : isHovered

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true)
    context?.pauseAutoPlay()
    context?.setActiveIndex(index)
  }, [context, index])

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false)
    context?.resumeAutoPlay()
  }, [context])

  return {
    isActive,
    isHovered,
    isAutoPlayActive: context ? context.activeIndex === index && !isHovered : false,
    hoverProps: {
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
    },
  }
}

// Feature Card component - handles hover at card level
interface FeatureCardProps {
  index: number
  icon: ReactNode
  title: string
  description: string
  children: ReactNode
}

export function FeatureCard({ index, icon, title, description, children }: FeatureCardProps) {
  const { isActive, isAutoPlayActive, hoverProps } = useAutoPlay(index)
  const context = useContext(AutoPlayContext)
  // Use activeIndex as key to force TimerIndicator to remount and restart animation
  const timerKey = context?.activeIndex ?? 0

  return (
    <div
      {...hoverProps}
      className={`relative group p-5 md:p-6 rounded-2xl bg-[#010329]/60 border transition-all duration-300 cursor-pointer ${
        isActive ? 'border-[#61AFF9]/40' : 'border-[#1861C8]/20'
      }`}
    >
      {/* Demo area */}
      <div className="mb-5">
        {children}
      </div>

      {/* Icon and title */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-[#031663] text-[#61AFF9] flex items-center justify-center shrink-0">
          {icon}
        </div>
        <h3 className="text-lg font-semibold text-white">
          {title}
        </h3>
      </div>

      <p className="text-[#D7EEFC]/60 text-sm leading-relaxed">
        {description}
      </p>

      {/* Timer at bottom right - key forces remount to restart animation */}
      {isAutoPlayActive && (
        <div className="absolute bottom-4 right-4">
          <TimerIndicator key={timerKey} duration={5000} />
        </div>
      )}
    </div>
  )
}

// Demo 1: Recording workflow
export function RecordDemo({ index = 0 }: { index?: number }) {
  const { isActive } = useAutoPlay(index)
  const [activeStep, setActiveStep] = useState(0)
  const [cursorPos, setCursorPos] = useState({ x: 55, y: 40 })
  const [isClicking, setIsClicking] = useState(false)

  // Cursor positions aligned with the 3 horizontal bars in the mock UI
  // Bars start at top-12 (48px) in a 160px tall container, each h-6 with space-y-2
  const steps = [
    { x: 55, y: 40 },   // First bar (70% width)
    { x: 45, y: 55 },   // Second bar (55% width) - this one highlights
    { x: 35, y: 70 },   // Third bar (40% width)
  ]

  // Reset and animate when becoming active
  useEffect(() => {
    if (isActive) {
      setActiveStep(0)
      setCursorPos({ x: steps[0].x, y: steps[0].y })
      setIsClicking(false)
    }
  }, [isActive])

  // Animation loop
  useEffect(() => {
    if (!isActive) return

    const interval = setInterval(() => {
      setActiveStep(s => {
        const next = (s + 1) % steps.length
        setCursorPos({ x: steps[next].x, y: steps[next].y })
        // Click effect after cursor reaches destination (500ms transition)
        setTimeout(() => {
          setIsClicking(true)
          setTimeout(() => setIsClicking(false), 200)
        }, 500)
        return next
      })
    }, 1200)

    return () => clearInterval(interval)
  }, [isActive])

  return (
    <div className={`relative h-40 bg-[#010329]/80 rounded-xl overflow-hidden border transition-all duration-300 ${
      isActive ? 'border-[#61AFF9]/60' : 'border-[#1861C8]/20'
    }`}>
      {/* Recording indicator */}
      <div className={`absolute top-3 left-3 flex items-center gap-1.5 px-2 py-1 rounded-full transition-all duration-300 ${
        isActive ? 'bg-red-500/20' : 'bg-[#1861C8]/10'
      }`}>
        <span className={`w-2 h-2 rounded-full transition-colors ${isActive ? 'bg-red-500 animate-pulse' : 'bg-[#D7EEFC]/20'}`} />
        <span className={`text-[10px] font-medium ${isActive ? 'text-red-400' : 'text-[#D7EEFC]/40'}`}>
          {isActive ? 'REC' : 'READY'}
        </span>
      </div>

      {/* Mock UI elements */}
      <div className="absolute top-3 right-3 flex gap-1">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="w-6 h-1.5 rounded-full bg-[#1861C8]/30" />
        ))}
      </div>

      <div className="absolute top-12 left-4 right-4 space-y-2">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className={`h-6 rounded bg-[#1861C8]/10 transition-all duration-300 ${
              i === 1 && isActive && activeStep >= 1 ? 'bg-[#1861C8]/30 ring-1 ring-[#61AFF9]' : ''
            }`}
            style={{ width: `${70 - i * 15}%` }}
          />
        ))}
      </div>

      {/* Animated cursor */}
      {isActive && (
        <div
          className="absolute w-4 h-4 transition-all duration-500 ease-out z-10"
          style={{ left: `${cursorPos.x}%`, top: `${cursorPos.y}%` }}
        >
          <svg
            className={`w-4 h-4 text-white drop-shadow-lg transition-transform duration-100 ${isClicking ? 'scale-75' : 'scale-100'}`}
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M4 4l16 8-7 2-2 7z" />
          </svg>
          {isClicking && (
            <div className="absolute -top-1 -left-1 w-6 h-6 rounded-full bg-[#61AFF9]/50 animate-ping" />
          )}
        </div>
      )}

      {/* Step counter */}
      <div className="absolute bottom-3 left-3 flex items-center gap-2">
        <div className="flex gap-1">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${
                isActive && i <= activeStep ? 'bg-[#61AFF9]' : 'bg-[#1861C8]/30'
              }`}
            />
          ))}
        </div>
        <span className="text-[10px] text-[#D7EEFC]/50">
          {isActive ? `${activeStep + 1} steps` : '0 steps'}
        </span>
      </div>
    </div>
  )
}

// Demo 2: Just-in-time guidance
export function GuidanceDemo({ index = 1 }: { index?: number }) {
  const { isActive } = useAutoPlay(index)
  const [step, setStep] = useState(0)
  const [showTooltip, setShowTooltip] = useState(true)

  // Tooltip positions aligned with form fields
  // Form: inset-4, title h-4 + mb-3, then 3 fields with space-y-2
  // Tooltips positioned to the right of each field
  const tooltipPositions = [
    { top: '2%', left: '55%', label: 'Start here', desc: 'Click to begin' },
    { top: '22%', left: '55%', label: 'Enter data', desc: 'Fill in the form' },
    { top: '42%', left: '12%', label: 'Submit', desc: 'Click to save' },
  ]

  // Reset when becoming active
  useEffect(() => {
    if (isActive) {
      setStep(0)
      setShowTooltip(true)
    }
  }, [isActive])

  // Animation loop
  useEffect(() => {
    if (!isActive) return

    const interval = setInterval(() => {
      setShowTooltip(false)
      setTimeout(() => {
        setStep(s => (s + 1) % tooltipPositions.length)
        setShowTooltip(true)
      }, 300)
    }, 1500)

    return () => clearInterval(interval)
  }, [isActive])

  return (
    <div className={`relative h-40 bg-[#010329]/80 rounded-xl overflow-hidden border transition-all duration-300 ${
      isActive ? 'border-[#61AFF9]/60' : 'border-[#1861C8]/20'
    }`}>
      {/* Mock form UI */}
      <div className="absolute inset-4">
        <div className="h-4 w-20 bg-[#1861C8]/20 rounded mb-3" />
        <div className="space-y-2">
          <div className={`h-7 rounded bg-[#1861C8]/10 transition-all duration-300 ${isActive && step === 0 ? 'ring-2 ring-[#61AFF9]' : ''}`} />
          <div className={`h-7 rounded bg-[#1861C8]/10 transition-all duration-300 ${isActive && step === 1 ? 'ring-2 ring-[#61AFF9]' : ''}`} />
          <div className={`h-6 w-20 rounded bg-[#1861C8]/20 transition-all duration-300 ${isActive && step === 2 ? 'ring-2 ring-[#61AFF9]' : ''}`} />
        </div>
      </div>

      {/* Animated tooltip */}
      {isActive && showTooltip && (
        <div
          className="absolute z-10 animate-scale-in"
          style={{ top: tooltipPositions[step].top, left: tooltipPositions[step].left }}
        >
          <div className="bg-[#1861C8] text-white px-3 py-2 rounded-lg shadow-xl text-left">
            <div className="flex items-center gap-1.5 mb-0.5">
              <div className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-bold">
                {step + 1}
              </div>
              <span className="text-xs font-medium">{tooltipPositions[step].label}</span>
            </div>
            <p className="text-[10px] text-white/70 pl-5">{tooltipPositions[step].desc}</p>
          </div>
          <div className="w-3 h-3 bg-[#1861C8] rotate-45 -mt-1.5 ml-4" />
        </div>
      )}

      {/* Progress indicator */}
      <div className="absolute bottom-3 right-3 flex items-center gap-1">
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className={`w-5 h-1 rounded-full transition-colors duration-300 ${
              isActive && i <= step ? 'bg-[#61AFF9]' : 'bg-[#1861C8]/30'
            }`}
          />
        ))}
      </div>
    </div>
  )
}

// Demo 3: Safe automation
export function AutomationDemo({ index = 2 }: { index?: number }) {
  const { isActive } = useAutoPlay(index)
  const [phase, setPhase] = useState<'running' | 'approval' | 'complete'>('running')
  const [progress, setProgress] = useState(0)

  // Reset when becoming active
  useEffect(() => {
    if (isActive) {
      setPhase('running')
      setProgress(0)
    }
  }, [isActive])

  // Animation loop
  useEffect(() => {
    if (!isActive) return

    if (phase === 'running') {
      const interval = setInterval(() => {
        setProgress(p => {
          if (p >= 60) {
            clearInterval(interval)
            setTimeout(() => setPhase('approval'), 200)
            return 60
          }
          return p + 15
        })
      }, 250)
      return () => clearInterval(interval)
    }

    if (phase === 'approval') {
      const timeout = setTimeout(() => {
        setPhase('complete')
        setProgress(100)
      }, 1200)
      return () => clearTimeout(timeout)
    }

    if (phase === 'complete') {
      const timeout = setTimeout(() => {
        setPhase('running')
        setProgress(0)
      }, 1500)
      return () => clearTimeout(timeout)
    }
  }, [isActive, phase])

  return (
    <div
      className={`relative h-40 bg-[#010329]/80 rounded-xl overflow-hidden border transition-all duration-300 ${
        isActive ? 'border-[#61AFF9]/60' : 'border-[#1861C8]/20'
      }`}
    >

      {/* Workflow steps */}
      <div className="absolute top-4 left-4 right-4 flex items-center">
        {['Start', 'Process', 'Review', 'Done'].map((label, i) => (
          <div key={label} className="flex items-center flex-1 last:flex-none">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-medium transition-all duration-300 shrink-0 ${
                isActive && progress >= (i + 1) * 25
                  ? 'bg-[#61AFF9] text-white'
                  : isActive && progress >= i * 25
                  ? 'bg-[#1861C8] text-white'
                  : 'bg-[#1861C8]/20 text-[#D7EEFC]/40'
              }`}
            >
              {isActive && progress >= (i + 1) * 25 ? (
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                i + 1
              )}
            </div>
            {i < 3 && (
              <div
                className={`flex-1 h-0.5 transition-colors duration-300 ${
                  isActive && progress >= (i + 1) * 25 ? 'bg-[#61AFF9]' : 'bg-[#1861C8]/20'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Center content */}
      <div className="absolute inset-0 flex items-center justify-center pt-6">
        {!isActive && (
          <div className="w-8 h-8 rounded-full bg-[#1861C8]/20 flex items-center justify-center">
            <svg className="w-4 h-4 text-[#D7EEFC]/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            </svg>
          </div>
        )}

        {isActive && phase === 'running' && (
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-[#61AFF9] animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span className="text-xs text-[#D7EEFC]/60">Processing...</span>
          </div>
        )}

        {isActive && phase === 'approval' && (
          <div className="animate-scale-in bg-[#000E2E] border border-[#1861C8]/40 rounded-xl p-3 shadow-xl">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-5 h-5 rounded-full bg-yellow-500/20 flex items-center justify-center">
                <svg className="w-3 h-3 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <span className="text-xs text-white font-medium">Approval required</span>
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-1 bg-[#1861C8] text-white text-[10px] rounded-md">Approve</button>
              <button className="px-3 py-1 bg-[#1861C8]/20 text-[#D7EEFC]/60 text-[10px] rounded-md">Reject</button>
            </div>
          </div>
        )}

        {isActive && phase === 'complete' && (
          <div className="flex items-center gap-2 animate-fade-in">
            <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
              <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-xs text-green-400 font-medium">Complete!</span>
          </div>
        )}
      </div>

      {/* Audit log indicator */}
      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <svg className="w-3 h-3 text-[#D7EEFC]/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span className="text-[10px] text-[#D7EEFC]/30">All actions logged</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
          <span className="text-[10px] text-[#D7EEFC]/30">Secure</span>
        </div>
      </div>
    </div>
  )
}

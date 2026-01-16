'use client'

import { useState, useEffect, useRef, createContext, useContext, useCallback, ReactNode } from 'react'
import ChromaText from './chroma-text'

// Context for coordinating auto-play across demos
interface AutoPlayContextType {
  activeIndex: number
  isAutoPlaying: boolean
  setActiveIndex: (index: number) => void
  pauseAutoPlay: () => void
  resumeAutoPlay: () => void
}

const AutoPlayContext = createContext<AutoPlayContextType | null>(null)

// Wrapper component that manages auto-play sequence
function FeatureDemosContainer({ children }: { children: React.ReactNode }) {
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
    }, 5000)

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

export default function Features() {
  return (
    <section id="features" className="py-20 md:py-28 lg:py-36 bg-gradient-to-b from-[#E2E8F0] to-[#F1F5F9] relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-[#1861C8]/5 rounded-full blur-[120px]" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative">
        {/* Section header */}
        <div className="max-w-3xl mx-auto text-center mb-16 md:mb-20">
          <p className="text-[#1861C8] text-sm font-medium mb-3 tracking-wide uppercase">How it works</p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 mb-5">
            <ChromaText color="inherit">Living</ChromaText> guides in 3 steps
          </h2>
          <p className="text-base md:text-lg text-slate-600 max-w-xl mx-auto">
            The easiest way to transform tribal knowledge into scalable documentation.
          </p>
        </div>

        {/* 3-step sequential layout */}
        <FeatureDemosContainer>
          <div className="grid md:grid-cols-3 gap-6 md:gap-4 lg:gap-8 items-start">
            {/* Step 1: Record */}
            <StepCard
              index={0}
              number={1}
              title="Record workflow"
              description="Click record before starting. Trope captures every click and keystroke."
            >
              <RecordDemo index={0} />
            </StepCard>

            {/* Arrow connector */}
            <div className="hidden md:flex items-center justify-center absolute left-[33%] top-1/2 -translate-y-1/2 -translate-x-1/2 z-10">
              <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>

            {/* Step 2: Guide */}
            <StepCard
              index={1}
              number={2}
              title="Deploy guide"
              description="Click stop when done. Your workflow becomes a living, interactive guide."
            >
              <GuidanceDemo index={1} />
            </StepCard>

            {/* Arrow connector */}
            <div className="hidden md:flex items-center justify-center absolute left-[66%] top-1/2 -translate-y-1/2 -translate-x-1/2 z-10">
              <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>

            {/* Step 3: Automate */}
            <StepCard
              index={2}
              number={3}
              title="Get results"
              description="Your team follows guides, automations run, everything is logged."
            >
              <AutomationDemo index={2} />
            </StepCard>
          </div>
        </FeatureDemosContainer>
      </div>
    </section>
  )
}

// Step Card component
interface StepCardProps {
  index: number
  number: number
  title: string
  description: string
  children: ReactNode
}

function StepCard({ index, number, title, description, children }: StepCardProps) {
  const { isActive, hoverProps } = useAutoPlay(index)

  return (
    <div {...hoverProps} className="relative">
      {/* Demo card */}
      <div
        className={`relative bg-gradient-to-b from-white to-slate-50 rounded-3xl overflow-hidden border transition-all duration-500 ${
          isActive ? 'border-[#1861C8]/40 shadow-lg shadow-[#1861C8]/10' : 'border-slate-200'
        }`}
      >
        {/* Demo area */}
        <div className="aspect-[4/3] relative">
          {children}
        </div>
      </div>

      {/* Text below */}
      <div className="mt-6 text-center md:text-left">
        <div className="flex items-center gap-3 justify-center md:justify-start mb-2">
          <span className={`text-4xl font-light transition-colors duration-300 ${
            isActive ? 'text-[#1861C8]' : 'text-slate-300'
          }`}>
            {number}
          </span>
          <h3 className="text-xl font-semibold text-slate-900">{title}</h3>
        </div>
        <p className="text-slate-600 text-sm leading-relaxed max-w-xs mx-auto md:mx-0">
          {description}
        </p>
      </div>
    </div>
  )
}

// Demo 1: Recording workflow - Floating window with cursor
function RecordDemo({ index = 0 }: { index?: number }) {
  const { isActive } = useAutoPlay(index)
  const [activeStep, setActiveStep] = useState(0)
  const [cursorPos, setCursorPos] = useState({ x: 30, y: 35 })
  const [isClicking, setIsClicking] = useState(false)

  const steps = [
    { x: 30, y: 35 },
    { x: 50, y: 50 },
    { x: 40, y: 65 },
  ]

  useEffect(() => {
    if (isActive) {
      setActiveStep(0)
      setCursorPos(steps[0])
      setIsClicking(false)
    }
  }, [isActive])

  useEffect(() => {
    if (!isActive) return
    const interval = setInterval(() => {
      setActiveStep(s => {
        const next = (s + 1) % steps.length
        setCursorPos(steps[next])
        setTimeout(() => {
          setIsClicking(true)
          setTimeout(() => setIsClicking(false), 150)
        }, 400)
        return next
      })
    }, 1400)
    return () => clearInterval(interval)
  }, [isActive])

  return (
    <div className="absolute inset-0 flex items-center justify-center p-6">
      {/* Floating window */}
      <div className="relative w-full max-w-[280px]">
        {/* Window shadow */}
        <div className="absolute inset-0 bg-slate-900/10 blur-2xl rounded-2xl transform translate-y-4 scale-95" />

        {/* Main window */}
        <div className="relative bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xl">
          {/* Window header */}
          <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
              </div>
              <span className="text-[10px] text-slate-400 ml-2">onboarding.flow</span>
            </div>
            <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full ${isActive ? 'bg-red-500/20' : 'bg-slate-100'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-red-500 animate-pulse' : 'bg-slate-400'}`} />
              <span className={`text-[9px] font-medium ${isActive ? 'text-red-600' : 'text-slate-500'}`}>
                {isActive ? 'REC' : 'READY'}
              </span>
            </div>
          </div>

          {/* Window content */}
          <div className="p-4 h-32 relative bg-slate-50">
            <div className="space-y-2">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className={`flex items-center gap-2 p-2 rounded-lg transition-all duration-300 ${
                    isActive && activeStep === i ? 'bg-[#1861C8]/10 ring-1 ring-[#1861C8]' : 'bg-white'
                  }`}
                >
                  <div className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center">
                    <div className="w-3 h-3 rounded-sm bg-[#1861C8]/30" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="h-1.5 bg-slate-200 rounded w-3/4" />
                    <div className="h-1 bg-slate-100 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>

            {/* Animated cursor */}
            {isActive && (
              <div
                className="absolute w-4 h-4 transition-all duration-500 ease-out z-20 pointer-events-none"
                style={{ left: `${cursorPos.x}%`, top: `${cursorPos.y}%` }}
              >
                <svg
                  className={`w-4 h-4 text-slate-800 drop-shadow-lg transition-transform duration-100 ${isClicking ? 'scale-75' : 'scale-100'}`}
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M4 4l16 8-7 2-2 7z" />
                </svg>
                {isClicking && (
                  <div className="absolute -top-1 -left-1 w-6 h-6 rounded-full bg-[#1861C8]/40 animate-ping" />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Demo 2: Just-in-time guidance - Tooltip overlay
function GuidanceDemo({ index = 1 }: { index?: number }) {
  const { isActive } = useAutoPlay(index)
  const [step, setStep] = useState(0)

  const tooltips = [
    { top: '25%', left: '55%', label: 'Click here to start' },
    { top: '45%', left: '60%', label: 'Enter customer name' },
    { top: '70%', left: '30%', label: 'Submit to continue' },
  ]

  useEffect(() => {
    if (isActive) {
      setStep(0)
    }
  }, [isActive])

  useEffect(() => {
    if (!isActive) return
    const interval = setInterval(() => {
      setStep(s => (s + 1) % tooltips.length)
    }, 1800)
    return () => clearInterval(interval)
  }, [isActive])

  return (
    <div className="absolute inset-0 flex items-center justify-center p-6">
      {/* Floating window */}
      <div className="relative w-full max-w-[280px]">
        <div className="absolute inset-0 bg-slate-900/10 blur-2xl rounded-2xl transform translate-y-4 scale-95" />

        <div className="relative bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xl">
          {/* Window header */}
          <div className="flex items-center px-4 py-3 bg-slate-50 border-b border-slate-200">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
            </div>
            <span className="text-[10px] text-slate-400 ml-3">Customer Form</span>
          </div>

          {/* Form content */}
          <div className="p-4 h-32 relative bg-slate-50">
            <div className="space-y-3">
              <div className={`h-6 rounded bg-white border border-slate-200 transition-all duration-300 ${isActive && step === 0 ? 'ring-2 ring-[#1861C8]' : ''}`} />
              <div className={`h-6 rounded bg-white border border-slate-200 transition-all duration-300 ${isActive && step === 1 ? 'ring-2 ring-[#1861C8]' : ''}`} />
              <div className={`h-5 w-20 rounded bg-slate-200 transition-all duration-300 ${isActive && step === 2 ? 'ring-2 ring-[#1861C8]' : ''}`} />
            </div>

            {/* Floating tooltip */}
            {isActive && (
              <div
                className="absolute z-10 transition-all duration-500 ease-out"
                style={{ top: tooltips[step].top, left: tooltips[step].left }}
              >
                <div className="bg-[#1861C8] text-white px-3 py-1.5 rounded-lg shadow-xl animate-bounce-subtle">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[9px] font-bold">
                      {step + 1}
                    </div>
                    <span className="text-[10px] font-medium whitespace-nowrap">{tooltips[step].label}</span>
                  </div>
                </div>
                <div className="w-2.5 h-2.5 bg-[#1861C8] rotate-45 -mt-1 ml-6" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Demo 3: Results/output - Document with notes
function AutomationDemo({ index = 2 }: { index?: number }) {
  const { isActive } = useAutoPlay(index)
  const [visibleLines, setVisibleLines] = useState(0)

  useEffect(() => {
    if (isActive) {
      setVisibleLines(0)
    }
  }, [isActive])

  useEffect(() => {
    if (!isActive) return
    const interval = setInterval(() => {
      setVisibleLines(v => (v + 1) % 5)
    }, 600)
    return () => clearInterval(interval)
  }, [isActive])

  return (
    <div className="absolute inset-0 flex items-center justify-center p-6">
      {/* Floating document */}
      <div className="relative w-full max-w-[280px]">
        <div className="absolute inset-0 bg-slate-900/10 blur-2xl rounded-2xl transform translate-y-4 scale-95" />

        <div className="relative bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xl">
          {/* Document header */}
          <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded bg-[#1861C8]/10 flex items-center justify-center">
                <svg className="w-3 h-3 text-[#1861C8]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span className="text-[10px] text-slate-500">Customer Onboarding Guide</span>
            </div>
            {isActive && (
              <div className="px-2 py-0.5 bg-green-500/20 rounded-full">
                <span className="text-[9px] text-green-600 font-medium">Live</span>
              </div>
            )}
          </div>

          {/* Document content - Notes/steps */}
          <div className="p-4 h-32 bg-slate-50">
            <div className="space-y-2">
              {['Open CRM dashboard', 'Navigate to Customers', 'Click "Add New"', 'Fill required fields'].map((text, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-2 transition-all duration-300 ${
                    isActive && i < visibleLines ? 'opacity-100' : 'opacity-20'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-medium ${
                    isActive && i < visibleLines ? 'bg-[#1861C8] text-white' : 'bg-slate-200 text-slate-400'
                  }`}>
                    {i + 1}
                  </div>
                  <span className="text-[11px] text-slate-600">{text}</span>
                  {isActive && i === visibleLines - 1 && (
                    <svg className="w-3 h-3 text-green-500 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

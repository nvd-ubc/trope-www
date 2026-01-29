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
            Guided workflows in <ChromaText color="inherit">three steps</ChromaText>
          </h2>
          <p className="text-base md:text-lg text-slate-600 max-w-xl mx-auto">
            Capture once, publish guidance, and keep every run consistent across desktop and web tools.
          </p>
        </div>

        {/* 3-step sequential layout */}
        <FeatureDemosContainer>
          <div className="grid md:grid-cols-3 gap-6 md:gap-4 lg:gap-8 items-start">
            {/* Step 1: Record */}
            <StepCard
              index={0}
              number={1}
              title="Capture the workflow"
              description="Record a real workflow across desktop apps and web tools, including context and screenshots."
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
              title="Publish the guide"
              description="Turn the recording into a guided playbook your team can follow inside their tools."
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
              title="Run and improve"
              description="Track every run, gather feedback, and keep workflows current as tools evolve."
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
  const contentRef = useRef<HTMLDivElement | null>(null)
  const rowRefs = useRef<(HTMLDivElement | null)[]>([])

  const steps = [0, 1, 2]

  useEffect(() => {
    if (isActive) {
      setActiveStep(0)
      setIsClicking(false)
    }
  }, [isActive])

  useEffect(() => {
    if (!isActive) return
    const interval = setInterval(() => {
      setActiveStep(s => {
        const next = (s + 1) % steps.length
        setTimeout(() => {
          setIsClicking(true)
          setTimeout(() => setIsClicking(false), 150)
        }, 400)
        return next
      })
    }, 1400)
    return () => clearInterval(interval)
  }, [isActive])

  useEffect(() => {
    if (!isActive) return
    const container = contentRef.current
    const row = rowRefs.current[activeStep]
    if (!container || !row) return
    const containerRect = container.getBoundingClientRect()
    const icon = row.querySelector('[data-demo-icon]') as HTMLElement | null
    const target = icon ?? row
    const targetRect = target.getBoundingClientRect()
    const x = ((targetRect.left - containerRect.left) + targetRect.width * 0.5) / containerRect.width * 100
    const y = ((targetRect.top - containerRect.top) + targetRect.height * 0.5) / containerRect.height * 100
    setCursorPos({ x, y })
  }, [activeStep, isActive])

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
          <div ref={contentRef} className="p-4 h-32 relative bg-slate-50">
            <div className="space-y-2">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  ref={(el) => { rowRefs.current[i] = el }}
                  className={`flex items-center gap-2 p-2 rounded-lg transition-all duration-300 ${
                    isActive && activeStep === i ? 'bg-[#1861C8]/10 ring-1 ring-[#1861C8]' : 'bg-white'
                  }`}
                >
                  <div data-demo-icon className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center">
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
  const [cursorPos, setCursorPos] = useState({ x: 52, y: 30 })
  const [radarPos, setRadarPos] = useState({ x: 52, y: 30 })
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 })
  const [isClicking, setIsClicking] = useState(false)
  const contentRef = useRef<HTMLDivElement | null>(null)
  const fieldRefs = useRef<(HTMLDivElement | null)[]>([])

  const tooltipLabels = [
    'Click here to start',
    'Enter customer name',
    'Submit to continue',
  ]

  useEffect(() => {
    if (isActive) {
      setStep(0)
    }
  }, [isActive])

  useEffect(() => {
    if (!isActive) return
    const interval = setInterval(() => {
      setStep(s => (s + 1) % tooltipLabels.length)
    }, 1800)
    return () => clearInterval(interval)
  }, [isActive])

  useEffect(() => {
    if (!isActive) return
    const container = contentRef.current
    const target = fieldRefs.current[step]
    if (!container || !target) return
    const containerRect = container.getBoundingClientRect()
    const targetRect = target.getBoundingClientRect()
    const centerX = (targetRect.left - containerRect.left) + targetRect.width * 0.5
    const centerY = (targetRect.top - containerRect.top) + targetRect.height * 0.5
    const cursorX = (targetRect.left - containerRect.left) + Math.min(16, targetRect.width * 0.2)
    const cursorY = centerY
    const tooltipLeft = Math.min(containerRect.width - 140, Math.max(8, centerX + 12))
    const tooltipTop = Math.max(8, centerY - 28)
    setCursorPos({
      x: (cursorX / containerRect.width) * 100,
      y: (cursorY / containerRect.height) * 100,
    })
    setRadarPos({
      x: (centerX / containerRect.width) * 100,
      y: (centerY / containerRect.height) * 100,
    })
    setTooltipPos({ top: tooltipTop, left: tooltipLeft })
    setIsClicking(true)
    const clickTimeout = setTimeout(() => setIsClicking(false), 180)
    return () => clearTimeout(clickTimeout)
  }, [isActive, step])

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
          <div ref={contentRef} className="p-4 h-32 relative bg-slate-50">
            <div className="space-y-3">
              <div
                ref={(el) => { fieldRefs.current[0] = el }}
                className={`h-6 rounded bg-white border border-slate-200 transition-all duration-300 ${isActive && step === 0 ? 'ring-2 ring-[#1861C8]' : ''}`}
              />
              <div
                ref={(el) => { fieldRefs.current[1] = el }}
                className={`h-6 rounded bg-white border border-slate-200 transition-all duration-300 ${isActive && step === 1 ? 'ring-2 ring-[#1861C8]' : ''}`}
              />
              <div
                ref={(el) => { fieldRefs.current[2] = el }}
                className={`h-5 w-20 rounded bg-slate-200 transition-all duration-300 ${isActive && step === 2 ? 'ring-2 ring-[#1861C8]' : ''}`}
              />
            </div>

            {/* Radar pulse */}
            {isActive && (
              <div
                className="absolute z-0 pointer-events-none"
                style={{ left: `${radarPos.x}%`, top: `${radarPos.y}%` }}
              >
                <div className="relative w-10 h-10 -translate-x-1/2 -translate-y-1/2">
                  <div className="absolute inset-0 rounded-full bg-[#1861C8]/10 animate-ping" />
                  <div className="absolute inset-1 rounded-full border border-[#1861C8]/35" />
                  <div className="absolute inset-[14px] rounded-full bg-[#1861C8]/40" />
                </div>
              </div>
            )}

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

            {/* Floating tooltip */}
            {isActive && (
              <div
                className="absolute z-10 transition-all duration-500 ease-out"
                style={{ top: tooltipPos.top, left: tooltipPos.left }}
              >
                <div className="relative bg-[#1861C8] text-white px-3 py-1.5 rounded-lg shadow-xl animate-bounce-subtle">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[9px] font-bold">
                      {step + 1}
                    </div>
                    <span className="text-[10px] font-medium whitespace-nowrap">{tooltipLabels[step]}</span>
                  </div>
                  <div className="absolute left-4 top-full w-2.5 h-2.5 bg-[#1861C8] rotate-45 -translate-y-1/2" />
                </div>
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
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[9px] text-emerald-700 font-semibold tracking-wide uppercase leading-none">Live</span>
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

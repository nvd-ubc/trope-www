'use client'

import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react'

// Context for coordinating auto-play across capability icons
interface CapabilityAutoPlayContextType {
  activeIndex: number
  setActiveIndex: (index: number) => void
  pauseAutoPlay: () => void
  resumeAutoPlay: () => void
}

const CapabilityAutoPlayContext = createContext<CapabilityAutoPlayContextType | null>(null)

// Timer indicator component - positioned by parent
function TimerIndicator({ duration, isActive }: { duration: number; isActive: boolean }) {
  return (
    <div className="w-4 h-4">
      <svg className="w-4 h-4 -rotate-90" viewBox="0 0 24 24">
        <circle
          cx="12"
          cy="12"
          r="10"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          className="text-[#1861C8]/20"
        />
        <circle
          cx="12"
          cy="12"
          r="10"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeDasharray={62.83}
          strokeDashoffset={isActive ? 0 : 62.83}
          className="text-[#61AFF9] transition-all ease-linear"
          style={{ transitionDuration: isActive ? `${duration}ms` : '0ms' }}
        />
      </svg>
    </div>
  )
}

// Wrapper component that manages auto-play sequence for capabilities
export function CapabilityIconsContainer({ children }: { children: React.ReactNode }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  const pauseAutoPlay = useCallback(() => {
    setIsPaused(true)
  }, [])

  const resumeAutoPlay = useCallback(() => {
    setIsPaused(false)
  }, [])

  // Auto-advance through capabilities
  useEffect(() => {
    if (isPaused) return

    const interval = setInterval(() => {
      setActiveIndex(i => (i + 1) % 4)
    }, 4000) // 4 seconds per capability

    return () => clearInterval(interval)
  }, [isPaused])

  return (
    <CapabilityAutoPlayContext.Provider value={{ activeIndex, setActiveIndex, pauseAutoPlay, resumeAutoPlay }}>
      {children}
    </CapabilityAutoPlayContext.Provider>
  )
}

// Hook to use capability auto-play context
function useCapabilityAutoPlay(index: number) {
  const context = useContext(CapabilityAutoPlayContext)
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

// Capability Card component - handles hover at card level
interface CapabilityCardProps {
  index: number
  title: string
  description: string
  children: ReactNode
}

export function CapabilityCard({ index, title, description, children }: CapabilityCardProps) {
  const { isActive, isAutoPlayActive, hoverProps } = useCapabilityAutoPlay(index)

  return (
    <div
      {...hoverProps}
      className={`relative bg-[#010329]/60 rounded-xl p-5 md:p-6 border transition-all duration-300 cursor-pointer ${
        isActive ? 'border-[#61AFF9]/40' : 'border-[#1861C8]/20'
      }`}
    >
      {/* Animated icon */}
      <div className="h-14 flex items-center mb-4">
        {children}
      </div>

      <h3 className="text-base md:text-lg font-semibold text-white mb-2">
        {title}
      </h3>
      <p className="text-[#D7EEFC]/60 text-sm leading-relaxed">
        {description}
      </p>

      {/* Timer at bottom right */}
      {isAutoPlayActive && (
        <div className="absolute bottom-4 right-4">
          <TimerIndicator duration={4000} isActive={true} />
        </div>
      )}
    </div>
  )
}

// Desktop-first: Animated app icons
export function DesktopFirstIcon({ index = 0 }: { index?: number }) {
  const { isActive } = useCapabilityAutoPlay(index)
  const [activeApp, setActiveApp] = useState(0)

  const apps = [
    { name: 'Excel', color: '#217346', icon: 'X' },
    { name: 'QB', color: '#2CA01C', icon: 'QB' },
    { name: 'Web', color: '#1861C8', icon: '◉' },
  ]

  // Reset when becoming active
  useEffect(() => {
    if (isActive) {
      setActiveApp(0)
    }
  }, [isActive])

  // Animation loop
  useEffect(() => {
    if (!isActive) return

    const interval = setInterval(() => {
      setActiveApp(a => (a + 1) % apps.length)
    }, 800)

    return () => clearInterval(interval)
  }, [isActive])

  return (
    <div className="relative">
      <div className="flex items-center gap-1">
        {apps.map((app, i) => (
          <div
            key={app.name}
            className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold transition-all duration-300 ${
              isActive && i === activeApp
                ? 'scale-110 ring-2 ring-[#61AFF9] ring-offset-2 ring-offset-[#010329]'
                : isActive && i < activeApp
                ? 'opacity-100'
                : !isActive
                ? 'opacity-40'
                : 'opacity-30'
            }`}
            style={{ backgroundColor: app.color }}
          >
            <span className="text-white">{app.icon}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// Drift detection: UI change animation
export function DriftDetectionIcon({ index = 1 }: { index?: number }) {
  const { isActive } = useCapabilityAutoPlay(index)
  const [hasDrift, setHasDrift] = useState(false)

  // Reset and trigger drift when becoming active
  useEffect(() => {
    if (isActive) {
      setHasDrift(false)
      const timeout = setTimeout(() => setHasDrift(true), 600)
      return () => clearTimeout(timeout)
    }
  }, [isActive])

  return (
    <div className="relative w-20 h-12">
      {/* Mock UI */}
      <div className="absolute inset-0 flex gap-1">
        <div className={`h-full rounded transition-all duration-500 ${isActive && hasDrift ? 'w-1/2 bg-[#1861C8]/40' : 'w-1/3 bg-[#1861C8]/20'}`} />
        <div className={`h-full rounded transition-all duration-500 ${isActive && hasDrift ? 'w-1/2 bg-red-500/30' : 'w-2/3 bg-[#1861C8]/20'}`} />
      </div>
      {/* Warning badge */}
      {isActive && hasDrift && (
        <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-yellow-500 flex items-center justify-center animate-scale-in">
          <svg className="w-3 h-3 text-yellow-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01" />
          </svg>
        </div>
      )}
    </div>
  )
}

// Audit trails: Animated log entries
export function AuditTrailsIcon({ index = 2 }: { index?: number }) {
  const { isActive } = useCapabilityAutoPlay(index)
  const [visibleLogs, setVisibleLogs] = useState(0)

  // Reset when becoming active
  useEffect(() => {
    if (isActive) {
      setVisibleLogs(0)
    }
  }, [isActive])

  // Animation loop
  useEffect(() => {
    if (!isActive) return

    const interval = setInterval(() => {
      setVisibleLogs(v => (v + 1) % 4)
    }, 600)

    return () => clearInterval(interval)
  }, [isActive])

  return (
    <div className="relative w-20 space-y-1">
      {[1, 2, 3].map(i => (
        <div
          key={i}
          className={`h-2.5 rounded-sm flex items-center gap-1 transition-all duration-300 ${
            isActive && i <= visibleLogs ? 'opacity-100' : 'opacity-20'
          }`}
        >
          <div className={`w-1.5 h-1.5 rounded-full transition-colors ${isActive && i === visibleLogs ? 'bg-[#61AFF9]' : isActive && i < visibleLogs ? 'bg-[#1861C8]/60' : 'bg-[#1861C8]/20'}`} />
          <div className={`flex-1 h-1.5 rounded transition-colors ${isActive && i === visibleLogs ? 'bg-[#61AFF9]/40' : isActive && i < visibleLogs ? 'bg-[#1861C8]/30' : 'bg-[#1861C8]/10'}`} />
          <div className={`w-6 h-1.5 rounded transition-colors ${isActive && i <= visibleLogs ? 'bg-[#1861C8]/20' : 'bg-[#1861C8]/5'}`} />
        </div>
      ))}
    </div>
  )
}

// Role-based access: User permission levels
export function RoleBasedIcon({ index = 3 }: { index?: number }) {
  const { isActive } = useCapabilityAutoPlay(index)
  const [activeRole, setActiveRole] = useState(0)

  const roles = [
    { color: '#61AFF9', level: 3 }, // Admin
    { color: '#1861C8', level: 2 }, // Editor
    { color: '#1861C8', level: 1 }, // Viewer
  ]

  // Reset when becoming active
  useEffect(() => {
    if (isActive) {
      setActiveRole(0)
    }
  }, [isActive])

  // Animation loop
  useEffect(() => {
    if (!isActive) return

    const interval = setInterval(() => {
      setActiveRole(r => (r + 1) % roles.length)
    }, 1000)

    return () => clearInterval(interval)
  }, [isActive])

  return (
    <div className="relative">
      <div className="flex items-end gap-1">
        {roles.map((role, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 ${
                isActive && i === activeRole ? 'ring-2 ring-[#61AFF9] ring-offset-1 ring-offset-[#010329]' : ''
              }`}
              style={{
                backgroundColor: isActive && i === activeRole ? role.color : '#1861C8',
                opacity: isActive ? (i === activeRole ? 1 : i < activeRole ? 0.6 : 0.2) : 0.3
              }}
            >
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </div>
            {/* Permission bars */}
            <div className="flex gap-0.5">
              {[1, 2, 3].map(level => (
                <div
                  key={level}
                  className={`w-1 h-1 rounded-sm transition-colors duration-300 ${
                    isActive && level <= roles[i].level && i === activeRole ? 'bg-[#61AFF9]' : 'bg-[#1861C8]/20'
                  }`}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

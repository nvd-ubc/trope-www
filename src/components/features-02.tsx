'use client'

import { useState, useEffect, useRef, createContext, useContext, useCallback } from 'react'

// Context for coordinating autoplay across all capability cards
interface CapabilityAutoPlayContextType {
  activeCard: number
  setActiveCard: (index: number) => void
  pauseAutoPlay: () => void
  resumeAutoPlay: () => void
}

const CapabilityAutoPlayContext = createContext<CapabilityAutoPlayContextType | null>(null)

function useCapabilityAutoPlay(cardIndex: number) {
  const context = useContext(CapabilityAutoPlayContext)
  const [isHovered, setIsHovered] = useState(false)

  const isActive = context ? context.activeCard === cardIndex || isHovered : false

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true)
    context?.pauseAutoPlay()
    context?.setActiveCard(cardIndex)
  }, [context, cardIndex])

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false)
    context?.resumeAutoPlay()
  }, [context])

  return {
    isActive,
    hoverProps: {
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
    },
  }
}

export default function Features02() {
  const [activeCard, setActiveCard] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)

  const pauseAutoPlay = useCallback(() => setIsPaused(true), [])
  const resumeAutoPlay = useCallback(() => setIsPaused(false), [])

  // Observe section visibility
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.2 }
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  // Auto-advance through cards: 0=Desktop, 1=Drift, 2=Audit, 3=Role
  useEffect(() => {
    if (!isVisible || isPaused) return

    const interval = setInterval(() => {
      setActiveCard(c => (c + 1) % 4)
    }, 4000)

    return () => clearInterval(interval)
  }, [isVisible, isPaused])

  return (
    <CapabilityAutoPlayContext.Provider value={{ activeCard, setActiveCard, pauseAutoPlay, resumeAutoPlay }}>
      <section ref={sectionRef} className="py-20 md:py-28 bg-slate-50 relative overflow-hidden">
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(24, 97, 200, 0.5) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(24, 97, 200, 0.5) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}
        />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative">
          {/* Section header */}
          <div className="max-w-3xl mx-auto text-center mb-16 md:mb-20">
            <p className="text-[#1861C8] text-sm font-medium mb-3 tracking-wide uppercase">Capabilities</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 mb-5">
              Built for real workflows
            </h2>
            <p className="text-base md:text-lg text-slate-600 max-w-xl mx-auto">
              Unlike browser-only tools, Trope works where your team actually works.
            </p>
          </div>

          {/* Two-column layout with featured capability */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Left - Featured capability: Desktop-first */}
            <DesktopFirstCard />

            {/* Right - Stacked capabilities */}
            <div className="grid gap-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <DriftDetectionCard />
                <AuditTrailsCard />
              </div>
              <RoleBasedCard />
            </div>
          </div>
        </div>
      </section>
    </CapabilityAutoPlayContext.Provider>
  )
}

// Desktop-first - Featured card (index 0)
function DesktopFirstCard() {
  const { isActive, hoverProps } = useCapabilityAutoPlay(0)
  const [activeApp, setActiveApp] = useState(0)

  const apps = [
    { name: 'Microsoft Excel', color: '#217346', icon: (
      <svg viewBox="0 0 24 24" className="w-6 h-6 text-white" fill="currentColor">
        <path d="M21.17 3H7.83A1.83 1.83 0 006 4.83v14.34A1.83 1.83 0 007.83 21h13.34A1.83 1.83 0 0023 19.17V4.83A1.83 1.83 0 0021.17 3zM17 17h-2v-4h-4v4H9v-4H7v-2h2V7h2v4h4V7h2v4h2v2h-2z"/>
        <path d="M1 4v16l5-1V5z"/>
      </svg>
    )},
    { name: 'QuickBooks', color: '#2CA01C', icon: (
      <svg viewBox="0 0 24 24" className="w-6 h-6 text-white" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
      </svg>
    )},
    { name: 'Salesforce', color: '#00A1E0', icon: (
      <svg viewBox="0 0 24 24" className="w-6 h-6 text-white" fill="currentColor">
        <circle cx="12" cy="12" r="8"/>
      </svg>
    )},
    { name: 'Web Browser', color: '#1861C8', icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={2}>
        <circle cx="12" cy="12" r="10"/>
        <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>
      </svg>
    )},
  ]

  // Reset and cycle through apps when this card becomes active
  useEffect(() => {
    if (!isActive) {
      setActiveApp(0)
      return
    }

    const interval = setInterval(() => {
      setActiveApp(a => (a + 1) % apps.length)
    }, 800)
    return () => clearInterval(interval)
  }, [isActive])

  return (
    <div
      {...hoverProps}
      className={`group relative bg-white rounded-3xl border p-8 overflow-hidden transition-all duration-500 shadow-sm ${
        isActive ? 'border-[#1861C8]/40 shadow-lg shadow-[#1861C8]/10' : 'border-slate-200'
      }`}
    >
      <div className={`absolute inset-0 bg-gradient-to-br from-[#1861C8]/5 to-transparent transition-opacity duration-500 rounded-3xl ${isActive ? 'opacity-100' : 'opacity-0'}`} />

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1861C8] to-[#61AFF9] flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <rect x="3" y="4" width="18" height="14" rx="2" />
              <path d="M3 10h18" />
              <rect x="6" y="14" width="4" height="2" rx="0.5" />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-slate-900">Desktop-first</h3>
            <p className="text-slate-500 text-sm">Not just browsers</p>
          </div>
        </div>
        <p className="text-slate-600 text-base mb-8 max-w-sm">
          Works natively with Excel, QuickBooks, and desktop apps—not just browsers.
          Record workflows anywhere your team works.
        </p>

        {/* App grid demo */}
        <div className="grid grid-cols-4 gap-3">
          {apps.map((app, i) => (
            <div key={app.name} className="flex flex-col items-center gap-2">
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                  isActive && i === activeApp
                    ? 'scale-110 ring-2 ring-[#61AFF9] ring-offset-2 ring-offset-white shadow-lg'
                    : isActive && i < activeApp
                    ? 'opacity-80'
                    : !isActive
                    ? 'opacity-30'
                    : 'opacity-20'
                }`}
                style={{
                  backgroundColor: app.color,
                  boxShadow: isActive && i === activeApp ? `0 8px 24px ${app.color}40` : 'none'
                }}
              >
                {app.icon}
              </div>
              <span className={`text-[10px] text-center transition-colors duration-300 ${
                isActive && i === activeApp ? 'text-slate-900' : 'text-slate-400'
              }`}>
                {app.name.split(' ')[0]}
              </span>
            </div>
          ))}
        </div>

        {/* Active indicator */}
        <div className="mt-6 flex items-center gap-2">
          <div className="flex gap-1">
            {apps.map((_, i) => (
              <div
                key={i}
                className={`w-8 h-1 rounded-full transition-all duration-300 ${
                  isActive && i === activeApp ? 'bg-[#1861C8]' : 'bg-slate-200'
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-slate-500 ml-2">
            {isActive ? `Recording: ${apps[activeApp].name}` : 'Hover to preview'}
          </span>
        </div>

      </div>

      {/* Floating app window - peeks from bottom, hidden on mobile */}
      <div className="hidden lg:block absolute bottom-0 left-0 right-0 h-44 overflow-hidden pointer-events-none">
        {apps.map((app, i) => (
          <div
            key={app.name}
            className={`absolute left-1/2 -translate-x-1/2 w-[420px] transition-all duration-500 ${
              isActive && i === activeApp
                ? 'opacity-100 bottom-0'
                : 'opacity-0 -bottom-8'
            }`}
          >
            {/* Window chrome */}
            <div
              className="rounded-t-2xl border border-b-0 overflow-hidden"
              style={{
                borderColor: `${app.color}40`,
                boxShadow: `0 -8px 40px ${app.color}20`
              }}
            >
              {/* Title bar */}
              <div
                className="px-4 py-2.5 flex items-center gap-2"
                style={{ backgroundColor: app.color }}
              >
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-white/30" />
                  <div className="w-3 h-3 rounded-full bg-white/30" />
                  <div className="w-3 h-3 rounded-full bg-white/30" />
                </div>
                <span className="text-xs text-white/80 font-medium ml-2">{app.name}</span>
              </div>
              {/* Window content preview */}
              <div className="bg-slate-50 p-4">
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <div className="w-20 h-4 rounded bg-slate-200" />
                    <div className="w-32 h-4 rounded bg-slate-200" />
                    <div className="w-16 h-4 rounded bg-slate-200" />
                  </div>
                  <div className="flex gap-3">
                    <div className="w-24 h-4 rounded bg-slate-100" />
                    <div className="w-20 h-4 rounded bg-slate-100" />
                    <div className="w-28 h-4 rounded bg-slate-100" />
                  </div>
                  <div className="flex gap-3">
                    <div className="w-16 h-4 rounded bg-slate-100" />
                    <div className="w-36 h-4 rounded bg-slate-100" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Drift Detection card (index 1)
function DriftDetectionCard() {
  const { isActive, hoverProps } = useCapabilityAutoPlay(1)
  const [phase, setPhase] = useState<'normal' | 'changing' | 'alert'>('normal')

  useEffect(() => {
    if (!isActive) {
      setPhase('normal')
      return
    }

    const cycle = () => {
      setPhase('normal')
      setTimeout(() => setPhase('changing'), 1000)
      setTimeout(() => setPhase('alert'), 2000)
    }

    cycle()
    const interval = setInterval(cycle, 3500)
    return () => clearInterval(interval)
  }, [isActive])

  return (
    <div
      {...hoverProps}
      className={`group relative bg-white rounded-2xl border p-5 overflow-hidden transition-all duration-500 shadow-sm ${
        isActive ? 'border-[#1861C8]/40 shadow-lg shadow-[#1861C8]/10' : 'border-slate-200'
      }`}
    >
      <div className={`absolute inset-0 bg-gradient-to-br from-[#1861C8]/5 to-transparent transition-opacity duration-500 rounded-2xl ${isActive ? 'opacity-100' : 'opacity-0'}`} />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500/20 to-orange-500/10 flex items-center justify-center">
            <svg className="w-5 h-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          {isActive && phase === 'alert' && (
            <div className="px-2 py-0.5 bg-yellow-100 rounded-full animate-scale-in">
              <span className="text-[10px] text-yellow-700 font-medium">UI Changed</span>
            </div>
          )}
        </div>

        <h3 className="text-base font-semibold text-slate-900 mb-1">Drift detection</h3>
        <p className="text-slate-600 text-sm mb-4">
          Auto-flags when apps change and workflows become outdated.
        </p>

        {/* UI change demo */}
        <div className="relative h-16 bg-slate-100 rounded-lg border border-slate-200 overflow-hidden">
          <div className="absolute inset-2 flex gap-2">
            <div className={`h-full rounded transition-all duration-500 ${
              !isActive ? 'w-1/3 bg-slate-200' :
              phase === 'normal' ? 'w-1/3 bg-slate-200' :
              phase === 'changing' ? 'w-1/2 bg-slate-300' :
              'w-1/2 bg-[#1861C8]/20 ring-1 ring-yellow-500/50'
            }`} />
            <div className={`h-full rounded transition-all duration-500 ${
              !isActive ? 'w-2/3 bg-slate-200' :
              phase === 'normal' ? 'w-2/3 bg-slate-200' :
              phase === 'changing' ? 'w-1/2 bg-red-200' :
              'w-1/2 bg-red-200 ring-1 ring-yellow-500/50'
            }`} />
          </div>
        </div>
      </div>
    </div>
  )
}

// Audit Trails card (index 2)
function AuditTrailsCard() {
  const { isActive, hoverProps } = useCapabilityAutoPlay(2)
  const [logCount, setLogCount] = useState(0)

  const logs = [
    { action: 'Opened form', time: '10:32 AM', user: 'S' },
    { action: 'Entered data', time: '10:33 AM', user: 'S' },
    { action: 'Approved', time: '10:34 AM', user: 'M' },
  ]

  useEffect(() => {
    if (!isActive) {
      setLogCount(0)
      return
    }

    const interval = setInterval(() => {
      setLogCount(c => (c + 1) % 4)
    }, 800)
    return () => clearInterval(interval)
  }, [isActive])

  return (
    <div
      {...hoverProps}
      className={`group relative bg-white rounded-2xl border p-5 overflow-hidden transition-all duration-500 shadow-sm ${
        isActive ? 'border-[#1861C8]/40 shadow-lg shadow-[#1861C8]/10' : 'border-slate-200'
      }`}
    >
      <div className={`absolute inset-0 bg-gradient-to-br from-[#1861C8]/5 to-transparent transition-opacity duration-500 rounded-2xl ${isActive ? 'opacity-100' : 'opacity-0'}`} />

      <div className="relative z-10">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1861C8]/20 to-[#61AFF9]/10 flex items-center justify-center mb-3">
          <svg className="w-5 h-5 text-[#1861C8]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>

        <h3 className="text-base font-semibold text-slate-900 mb-1">Audit trails</h3>
        <p className="text-slate-600 text-sm mb-4">
          Every action logged with full lineage.
        </p>

        {/* Log entries demo */}
        <div className="space-y-1.5">
          {logs.map((log, i) => (
            <div
              key={i}
              className={`flex items-center gap-2 px-2 py-1.5 rounded-lg transition-all duration-300 ${
                isActive && i < logCount ? 'bg-slate-100 opacity-100' : 'opacity-30'
              }`}
            >
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-medium ${
                isActive && i === logCount - 1 ? 'bg-[#1861C8] text-white' : 'bg-slate-200 text-slate-500'
              }`}>
                {log.user}
              </div>
              <span className="text-[11px] text-slate-600 flex-1">{log.action}</span>
              <span className="text-[10px] text-slate-400">{log.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Role-based access card (index 3)
function RoleBasedCard() {
  const { isActive, hoverProps } = useCapabilityAutoPlay(3)
  const [activeRole, setActiveRole] = useState(0)

  const roles = [
    { name: 'Admin', permissions: ['View', 'Edit', 'Delete', 'Manage'], color: '#61AFF9' },
    { name: 'Editor', permissions: ['View', 'Edit'], color: '#1861C8' },
    { name: 'Viewer', permissions: ['View'], color: '#1861C8' },
  ]

  useEffect(() => {
    if (!isActive) {
      setActiveRole(0)
      return
    }

    const interval = setInterval(() => {
      setActiveRole(r => (r + 1) % roles.length)
    }, 1200)
    return () => clearInterval(interval)
  }, [isActive])

  return (
    <div
      {...hoverProps}
      className={`group relative bg-white rounded-2xl border p-5 overflow-hidden transition-all duration-500 shadow-sm ${
        isActive ? 'border-[#1861C8]/40 shadow-lg shadow-[#1861C8]/10' : 'border-slate-200'
      }`}
    >
      <div className={`absolute inset-0 bg-gradient-to-br from-[#1861C8]/5 to-transparent transition-opacity duration-500 rounded-2xl ${isActive ? 'opacity-100' : 'opacity-0'}`} />

      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-6">
        <div className="flex-1">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1861C8]/20 to-[#61AFF9]/10 flex items-center justify-center mb-3">
            <svg className="w-5 h-5 text-[#1861C8]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
          </div>

          <h3 className="text-base font-semibold text-slate-900 mb-1">Role-based access</h3>
          <p className="text-slate-600 text-sm">
            Scope workflows and permissions by team role. Control who can view, edit, or automate.
          </p>
        </div>

        {/* Role selector */}
        <div className="flex sm:flex-col gap-2">
          {roles.map((role, i) => (
            <div
              key={role.name}
              className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-300 ${
                isActive && i === activeRole
                  ? 'bg-slate-100 ring-1 ring-[#1861C8]/30'
                  : 'bg-slate-50'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300`}
                style={{
                  backgroundColor: isActive && i === activeRole ? role.color : '#1861C8',
                  opacity: isActive ? (i === activeRole ? 1 : 0.3) : 0.2
                }}
              >
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              </div>
              <div className="hidden sm:block">
                <div className={`text-xs font-medium transition-colors ${
                  isActive && i === activeRole ? 'text-slate-900' : 'text-slate-400'
                }`}>
                  {role.name}
                </div>
                <div className="flex gap-1 mt-1">
                  {['V', 'E', 'D', 'M'].map((p, pi) => (
                    <div
                      key={p}
                      className={`w-4 h-4 rounded text-[8px] flex items-center justify-center font-medium transition-all duration-300 ${
                        isActive && i === activeRole && pi < role.permissions.length
                          ? 'bg-[#1861C8]/20 text-[#1861C8]'
                          : 'bg-slate-100 text-slate-300'
                      }`}
                    >
                      {p}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

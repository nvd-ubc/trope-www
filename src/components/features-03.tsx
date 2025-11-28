'use client'

import { useState, useEffect, useRef } from 'react'

export default function Features03() {
  return (
    <section className="py-20 md:py-28 bg-[#010329] relative overflow-hidden">
      {/* Subtle background elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#1861C8]/5 rounded-full blur-[100px]" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left - Transcript demo */}
          <TranscriptDemo />

          {/* Right - Stats */}
          <div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">
              Built for scale
            </h2>

            <div className="space-y-8">
              <StatItem
                value="10x"
                label="Faster onboarding"
                description="New team members get up to speed in days, not weeks. Interactive guides replace shadowing sessions."
              />
              <div className="border-t border-[#1861C8]/20" />
              <StatItem
                value="85%"
                label="Reduction in support tickets"
                description="Self-serve documentation means fewer interruptions. Your experts stay focused on high-value work."
              />
              <div className="border-t border-[#1861C8]/20" />
              <StatItem
                value="100%"
                label="Action traceability"
                description="Every workflow execution logged with full audit trail. Know who did what, when, and why."
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function StatItem({ value, label, description }: { value: string; label: string; description: string }) {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.3 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} className="grid grid-cols-[120px_1fr] gap-10 items-start">
      <div className={`text-4xl md:text-5xl font-bold transition-all duration-700 tabular-nums ${isVisible ? 'text-white' : 'text-[#1861C8]/30'}`}>
        {value}
      </div>
      <div>
        <div className={`text-lg md:text-xl font-semibold mb-1 transition-colors duration-500 ${isVisible ? 'text-white' : 'text-[#D7EEFC]/40'}`}>
          {label}
        </div>
        <p className="text-sm text-[#D7EEFC]/50 leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  )
}

function TranscriptDemo() {
  const [isVisible, setIsVisible] = useState(false)
  const [activeMessage, setActiveMessage] = useState(0)
  const ref = useRef<HTMLDivElement>(null)

  const messages = [
    { speaker: 'Sarah', time: '10:32 AM', text: 'Hi, this is Sarah from Acme Corp.' },
    { speaker: 'You', time: '10:32 AM', text: 'Hello Sarah, how can I help?' },
    { speaker: 'Sarah', time: '10:33 AM', text: 'I need to update our billing info.' },
    { speaker: 'You', time: '10:33 AM', text: 'Sure, let me pull up your account.' },
    { speaker: 'Sarah', time: '10:34 AM', text: 'The new card ends in 4242.' },
  ]

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.3 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!isVisible) {
      setActiveMessage(0)
      return
    }

    const interval = setInterval(() => {
      setActiveMessage(m => (m + 1) % (messages.length + 1))
    }, 1200)
    return () => clearInterval(interval)
  }, [isVisible])

  return (
    <div ref={ref} className="relative">
      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1861C8]/10 to-transparent rounded-3xl blur-2xl" />

      {/* Main card */}
      <div className="relative bg-gradient-to-br from-[#0d1a33]/90 to-[#0a1428]/95 rounded-3xl border border-[#1861C8]/20 overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#1861C8]/20">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-[#D7EEFC]/40 mb-1">Thursday, Oct 24 • Recorded</div>
              <h3 className="text-lg font-semibold text-white">Customer Support Call</h3>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                <div className="w-7 h-7 rounded-full bg-[#1861C8] flex items-center justify-center text-[10px] font-medium text-white ring-2 ring-[#0d1a33]">S</div>
                <div className="w-7 h-7 rounded-full bg-[#61AFF9] flex items-center justify-center text-[10px] font-medium text-white ring-2 ring-[#0d1a33]">Y</div>
              </div>
              <span className="text-[11px] text-[#D7EEFC]/40">+1 more</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-6 py-3 border-b border-[#1861C8]/20 flex gap-4">
          <button className="text-xs text-[#D7EEFC]/40 hover:text-[#D7EEFC]/60 transition-colors">Summary</button>
          <button className="text-xs text-white font-medium border-b-2 border-[#61AFF9] pb-1">Transcript</button>
          <button className="text-xs text-[#D7EEFC]/40 hover:text-[#D7EEFC]/60 transition-colors">Actions</button>
        </div>

        {/* Transcript */}
        <div className="p-6 h-64 overflow-hidden">
          <div className="space-y-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`transition-all duration-500 ${
                  isVisible && i < activeMessage ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
              >
                <div className="flex items-baseline gap-2 mb-1">
                  <span className={`text-sm font-medium ${msg.speaker === 'You' ? 'text-[#61AFF9]' : 'text-[#D7EEFC]/80'}`}>
                    {msg.speaker}
                  </span>
                  <span className="text-[10px] text-[#D7EEFC]/30">{msg.time}</span>
                </div>
                <p className="text-sm text-[#D7EEFC]/60 pl-0">{msg.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#0a1830]/50 border-t border-[#1861C8]/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-400" />
            <span className="text-[11px] text-[#D7EEFC]/40">Workflow captured</span>
          </div>
          <div className="text-[11px] text-[#D7EEFC]/30">
            {activeMessage} of {messages.length} interactions
          </div>
        </div>
      </div>
    </div>
  )
}

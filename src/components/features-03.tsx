'use client'

import { useState, useEffect, useRef } from 'react'
import ChromaText from './chroma-text'

export default function Features03() {
  return (
    <section className="py-20 md:py-28 bg-white relative overflow-hidden">
      {/* Subtle background elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#1861C8]/5 rounded-full blur-[100px]" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left - Transcript demo */}
          <TranscriptDemo />

          {/* Right - Stats */}
          <div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 mb-6">
              Built for <ChromaText color="inherit">operational scale</ChromaText>
            </h2>

            <div className="space-y-8">
              <StatItem
                value="2-3x"
                label="Faster onboarding"
                description="Reduce time to proficiency by turning expert procedures into guided runs that new hires can follow confidently."
              />
              <div className="border-t border-slate-200" />
              <StatItem
                value="50%"
                label="Fewer errors"
                description="Lower rework and exceptions by guiding operators through validated steps, checks, and required approvals."
              />
              <div className="border-t border-slate-200" />
              <StatItem
                value="100%"
                label="Run visibility"
                description="Keep a clear record of each run so teams can audit critical work, coach consistently, and improve workflows over time."
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
      <div className={`text-4xl md:text-5xl font-bold transition-all duration-700 tabular-nums ${isVisible ? 'text-[#1861C8]' : 'text-slate-200'}`}>
        {value}
      </div>
      <div>
        <div className={`text-lg md:text-xl font-semibold mb-1 transition-colors duration-500 ${isVisible ? 'text-slate-900' : 'text-slate-400'}`}>
          {label}
        </div>
        <p className="text-sm text-slate-600 leading-relaxed">
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
    { speaker: 'Agent', time: '10:32 AM', text: 'Opened invoice reconciliation workflow.' },
    { speaker: 'Guide', time: '10:32 AM', text: 'Step 1: Export current ledger entries.' },
    { speaker: 'Agent', time: '10:33 AM', text: 'Imported ledger into Q3 workbook.' },
    { speaker: 'Guide', time: '10:34 AM', text: 'Step 2: Validate variance thresholds.' },
    { speaker: 'Agent', time: '10:35 AM', text: 'Submitted reconciliation for approval.' },
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
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/5 to-transparent rounded-3xl blur-2xl" />

      {/* Main card */}
      <div className="relative bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-400 mb-1">Thursday, Jan 23 • Workflow run</div>
              <h3 className="text-lg font-semibold text-slate-900">Invoice Reconciliation</h3>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                <div className="w-7 h-7 rounded-full bg-[#1861C8] flex items-center justify-center text-[10px] font-medium text-white ring-2 ring-white">S</div>
                <div className="w-7 h-7 rounded-full bg-[#61AFF9] flex items-center justify-center text-[10px] font-medium text-white ring-2 ring-white">Y</div>
              </div>
              <span className="text-[11px] text-slate-400">+1 more</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-6 py-3 border-b border-slate-200 flex gap-4">
          <button className="text-xs text-slate-400 hover:text-slate-600 transition-colors">Summary</button>
          <button className="text-xs text-slate-900 font-medium border-b-2 border-[#1861C8] pb-1">Run log</button>
          <button className="text-xs text-slate-400 hover:text-slate-600 transition-colors">Outputs</button>
        </div>

        {/* Transcript */}
        <div className="p-6 h-64 overflow-hidden bg-slate-50">
          <div className="space-y-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`transition-all duration-500 ${
                  isVisible && i < activeMessage ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
              >
                <div className="flex items-baseline gap-2 mb-1">
                  <span className={`text-sm font-medium ${msg.speaker === 'You' ? 'text-[#1861C8]' : 'text-slate-700'}`}>
                    {msg.speaker}
                  </span>
                  <span className="text-[10px] text-slate-400">{msg.time}</span>
                </div>
                <p className="text-sm text-slate-600 pl-0">{msg.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-[11px] text-slate-500">Workflow run complete</span>
          </div>
          <div className="text-[11px] text-slate-500">
            {activeMessage} of {messages.length} interactions
          </div>
        </div>
      </div>
    </div>
  )
}

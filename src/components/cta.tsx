'use client'

import { useState, useEffect } from 'react'
import { CONTACT_EMAIL } from '@/lib/constants'
import AnimateIn from './animate-in'

// Floating window component with typing animation
function FloatingWindow({
  className,
  delay = 0,
  title,
  rows,
  typingRow,
  typingText
}: {
  className: string
  delay?: number
  title: string
  rows: { width: string; color?: string }[]
  typingRow?: number
  typingText?: string
}) {
  const [visible, setVisible] = useState(false)
  const [typedChars, setTypedChars] = useState(0)
  const [isTyping, setIsTyping] = useState(true)

  useEffect(() => {
    const timeout = setTimeout(() => setVisible(true), delay)
    return () => clearTimeout(timeout)
  }, [delay])

  // Typing animation with proper state management
  useEffect(() => {
    if (!visible || typingText === undefined) return

    if (isTyping) {
      // Typing phase
      if (typedChars < typingText.length) {
        const timeout = setTimeout(() => {
          setTypedChars(c => c + 1)
        }, 100)
        return () => clearTimeout(timeout)
      } else {
        // Done typing, pause then reset
        const timeout = setTimeout(() => {
          setIsTyping(false)
        }, 2000)
        return () => clearTimeout(timeout)
      }
    } else {
      // Reset phase - clear and start again
      const timeout = setTimeout(() => {
        setTypedChars(0)
        setIsTyping(true)
      }, 500)
      return () => clearTimeout(timeout)
    }
  }, [visible, typingText, typedChars, isTyping])

  return (
    <div
      className={`absolute transition-all duration-1000 ${className} ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
    >
      {/* Window chrome */}
      <div className="bg-[#0a1628]/80 backdrop-blur-sm rounded-lg border border-[#1861C8]/20 overflow-hidden shadow-2xl shadow-black/20">
        {/* Title bar */}
        <div className="flex items-center gap-1.5 px-3 py-2 bg-[#0a1628]/90 border-b border-[#1861C8]/10">
          <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]/60" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]/60" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]/60" />
          <span className="ml-2 text-[10px] text-[#D7EEFC]/30 font-medium">{title}</span>
        </div>
        {/* Content */}
        <div className="p-3 space-y-2">
          {rows.map((row, i) => (
            <div key={i} className="flex items-center gap-2 h-3">
              {typingRow === i && typingText ? (
                <div className="flex items-center">
                  <span className="text-[10px] text-[#61AFF9]/60 font-mono">
                    {typingText.slice(0, typedChars)}
                  </span>
                  <span className="w-0.5 h-3 bg-[#61AFF9]/60 animate-pulse ml-0.5" />
                </div>
              ) : (
                <div
                  className={`h-2 rounded ${row.color || 'bg-[#1861C8]/20'}`}
                  style={{ width: row.width }}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Cursor with trail effect
function AnimatedCursor({ className, delay = 0 }: { className: string; delay?: number }) {
  const [visible, setVisible] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const timeout = setTimeout(() => setVisible(true), delay)
    return () => clearTimeout(timeout)
  }, [delay])

  // Gentle floating movement
  useEffect(() => {
    if (!visible) return

    const interval = setInterval(() => {
      setPosition({
        x: Math.sin(Date.now() / 1000) * 10,
        y: Math.cos(Date.now() / 800) * 8
      })
    }, 50)

    return () => clearInterval(interval)
  }, [visible])

  if (!visible) return null

  return (
    <div
      className={`absolute transition-opacity duration-500 ${className}`}
      style={{ transform: `translate(${position.x}px, ${position.y}px)` }}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="drop-shadow-lg">
        <path
          d="M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 0 1 .35-.15h6.87c.48 0 .72-.58.38-.92L6.35 2.85a.5.5 0 0 0-.85.36Z"
          fill="#fff"
          fillOpacity="0.9"
          stroke="#1861C8"
          strokeWidth="1"
        />
      </svg>
      {/* Click ripple */}
      <div className="absolute top-0 left-0 w-4 h-4 rounded-full bg-[#61AFF9]/30 animate-ping" />
    </div>
  )
}

export default function Cta() {
  return (
    <section className="relative py-20 md:py-28 lg:py-36 bg-[#000E2E] overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        {/* Primary glow - centered top */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[#1861C8]/20 rounded-full blur-[120px]" />
        {/* Secondary glow - bottom right */}
        <div className="absolute bottom-0 right-0 translate-x-1/4 translate-y-1/4 w-[400px] h-[300px] bg-[#61AFF9]/10 rounded-full blur-[100px]" />
        {/* Accent glow - left */}
        <div className="absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[400px] bg-[#1861C8]/10 rounded-full blur-[80px]" />
      </div>

      {/* Animated floating windows - hidden on mobile */}
      <div className="hidden lg:block absolute inset-0 pointer-events-none" aria-hidden="true">
        {/* Left side - spreadsheet window */}
        <FloatingWindow
          className="left-[5%] top-[15%] w-48 animate-float-slow"
          delay={200}
          title="Q3 Report.xlsx"
          rows={[
            { width: '100%', color: 'bg-[#1861C8]/10' },
            { width: '60%' },
            { width: '80%' },
            { width: '45%', color: 'bg-[#61AFF9]/20' },
          ]}
        />

        {/* Right side - form window with typing */}
        <FloatingWindow
          className="right-[8%] top-[20%] w-44 animate-float-slower"
          delay={600}
          title="New Entry"
          rows={[
            { width: '40%' },
            { width: '100%' },
            { width: '70%' },
          ]}
          typingRow={1}
          typingText="$12,450.00"
        />

        {/* Bottom left - smaller window */}
        <FloatingWindow
          className="left-[12%] bottom-[20%] w-36 animate-float-slower"
          delay={1000}
          title="Tasks"
          rows={[
            { width: '80%', color: 'bg-[#28c840]/20' },
            { width: '65%' },
            { width: '90%' },
          ]}
        />

        {/* Bottom right - code/terminal style */}
        <FloatingWindow
          className="right-[5%] bottom-[25%] w-40 animate-float-slow"
          delay={400}
          title="Run Workflow"
          rows={[
            { width: '50%', color: 'bg-[#61AFF9]/15' },
            { width: '70%', color: 'bg-[#61AFF9]/15' },
            { width: '40%', color: 'bg-[#61AFF9]/15' },
          ]}
        />

        {/* Animated cursor */}
        <AnimatedCursor className="left-[18%] top-[35%]" delay={1500} />
      </div>

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(#61AFF9 1px, transparent 1px), linear-gradient(90deg, #61AFF9 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }}
        aria-hidden="true"
      />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
        <div className="max-w-2xl mx-auto text-center">
          {/* Eyebrow text */}
          <AnimateIn>
            <p className="text-[#61AFF9] text-sm font-medium mb-5 tracking-wide uppercase">
              Get Started
            </p>
          </AnimateIn>

          <AnimateIn delay={100}>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to transform how<br className="hidden sm:block" /> your team works?
            </h2>
          </AnimateIn>

          <AnimateIn delay={200}>
            <p className="text-lg text-[#D7EEFC]/50 mb-10 max-w-lg mx-auto">
              Join teams who have turned tribal knowledge into living documentation that scales.
            </p>
          </AnimateIn>

          <AnimateIn delay={300}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                className="group inline-flex items-center justify-center px-7 py-3.5 text-base font-semibold text-white bg-[#1861C8] rounded-full hover:bg-[#2171d8] transition-all duration-200"
                href={`mailto:${CONTACT_EMAIL}`}
              >
                Talk to Sales
                <svg
                  className="ml-2 w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
              <a
                className="inline-flex items-center justify-center px-7 py-3.5 text-base font-semibold text-[#D7EEFC]/80 border border-[#D7EEFC]/20 rounded-full hover:border-[#D7EEFC]/40 hover:text-white transition-all duration-200"
                href="#features"
              >
                Learn more
              </a>
            </div>
          </AnimateIn>
        </div>
      </div>
    </section>
  )
}

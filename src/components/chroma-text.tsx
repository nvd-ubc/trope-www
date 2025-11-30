'use client'

import { useEffect, useRef, useState } from 'react'

interface ChromaTextProps {
  children: React.ReactNode
  className?: string
  delay?: number
  color?: string  // Final color after animation, defaults to brand blue
}

export default function ChromaText({ children, className = '', delay = 0, color = '#1861C8' }: ChromaTextProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay)
          observer.disconnect()
        }
      },
      { threshold: 0.5 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [delay])

  return (
    <span
      ref={ref}
      className={`chroma-text ${isVisible ? 'chroma-text-animate' : ''} ${className}`}
      style={{ color }}
    >
      {children}
    </span>
  )
}

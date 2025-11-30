'use client'

import { useEffect, useRef, useState } from 'react'

interface ChromaTextProps {
  children: React.ReactNode
  className?: string
  delay?: number
}

export default function ChromaText({ children, className = '', delay = 0 }: ChromaTextProps) {
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
      style={{ color: '#1861C8' }}
    >
      {children}
    </span>
  )
}

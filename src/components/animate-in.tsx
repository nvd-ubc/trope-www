'use client'

import { useEffect, useRef, useState, ReactNode } from 'react'

interface AnimateInProps {
  children: ReactNode
  delay?: number
  duration?: number
  className?: string
  animation?: 'fade-up' | 'fade' | 'slide-left' | 'slide-right' | 'scale'
  once?: boolean
}

export default function AnimateIn({
  children,
  delay = 0,
  duration = 600,
  className = '',
  animation = 'fade-up',
  once = true
}: AnimateInProps) {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          if (once && ref.current) {
            observer.unobserve(ref.current)
          }
        } else if (!once) {
          setIsVisible(false)
        }
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [once])

  const getInitialStyles = () => {
    switch (animation) {
      case 'fade-up':
        return { opacity: 0, transform: 'translateY(20px)' }
      case 'fade':
        return { opacity: 0 }
      case 'slide-left':
        return { opacity: 0, transform: 'translateX(-20px)' }
      case 'slide-right':
        return { opacity: 0, transform: 'translateX(20px)' }
      case 'scale':
        return { opacity: 0, transform: 'scale(0.95)' }
      default:
        return { opacity: 0 }
    }
  }

  const getAnimatedStyles = () => {
    return {
      opacity: 1,
      transform: 'translateY(0) translateX(0) scale(1)'
    }
  }

  return (
    <div
      ref={ref}
      className={className}
      style={{
        ...(isVisible ? getAnimatedStyles() : getInitialStyles()),
        transition: `opacity ${duration}ms ease-out ${delay}ms, transform ${duration}ms ease-out ${delay}ms`
      }}
    >
      {children}
    </div>
  )
}

// Stagger container for animating multiple children
interface StaggerProps {
  children: ReactNode[]
  staggerDelay?: number
  baseDelay?: number
  duration?: number
  className?: string
  animation?: 'fade-up' | 'fade' | 'slide-left' | 'slide-right' | 'scale'
}

export function Stagger({
  children,
  staggerDelay = 100,
  baseDelay = 0,
  duration = 600,
  className = '',
  animation = 'fade-up'
}: StaggerProps) {
  return (
    <>
      {children.map((child, index) => (
        <AnimateIn
          key={index}
          delay={baseDelay + index * staggerDelay}
          duration={duration}
          className={className}
          animation={animation}
        >
          {child}
        </AnimateIn>
      ))}
    </>
  )
}

'use client'

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react'

type AnimationState = 'idle' | 'playing' | 'complete'

interface AnimationContextType {
  // Register an animation and get its state
  registerAnimation: (id: string) => void
  unregisterAnimation: (id: string) => void
  getAnimationState: (id: string) => AnimationState
  // Trigger animations
  triggerAnimation: (id: string) => void
  completeAnimation: (id: string) => void
  // Auto-play mode
  isAutoPlaying: boolean
  setAutoPlaying: (value: boolean) => void
}

const AnimationContext = createContext<AnimationContextType | null>(null)

export function AnimationProvider({ children }: { children: ReactNode }) {
  const [animations, setAnimations] = useState<Map<string, AnimationState>>(new Map())
  const [animationQueue, setAnimationQueue] = useState<string[]>([])
  const [isAutoPlaying, setAutoPlaying] = useState(false)
  const [currentAutoIndex, setCurrentAutoIndex] = useState(0)

  const registerAnimation = useCallback((id: string) => {
    setAnimations(prev => {
      const next = new Map(prev)
      if (!next.has(id)) {
        next.set(id, 'idle')
      }
      return next
    })
    setAnimationQueue(prev => prev.includes(id) ? prev : [...prev, id])
  }, [])

  const unregisterAnimation = useCallback((id: string) => {
    setAnimations(prev => {
      const next = new Map(prev)
      next.delete(id)
      return next
    })
    setAnimationQueue(prev => prev.filter(a => a !== id))
  }, [])

  const getAnimationState = useCallback((id: string): AnimationState => {
    return animations.get(id) || 'idle'
  }, [animations])

  const triggerAnimation = useCallback((id: string) => {
    setAnimations(prev => {
      const next = new Map(prev)
      next.set(id, 'playing')
      return next
    })
  }, [])

  const completeAnimation = useCallback((id: string) => {
    setAnimations(prev => {
      const next = new Map(prev)
      next.set(id, 'complete')
      return next
    })
    // Reset to idle after a short delay
    setTimeout(() => {
      setAnimations(prev => {
        const next = new Map(prev)
        if (next.get(id) === 'complete') {
          next.set(id, 'idle')
        }
        return next
      })
    }, 500)
  }, [])

  // Auto-play logic - cycle through animations sequentially
  useEffect(() => {
    if (!isAutoPlaying || animationQueue.length === 0) return

    const interval = setInterval(() => {
      const currentId = animationQueue[currentAutoIndex]
      if (currentId) {
        triggerAnimation(currentId)
      }
      setCurrentAutoIndex(prev => (prev + 1) % animationQueue.length)
    }, 4000) // 4 seconds between each animation

    return () => clearInterval(interval)
  }, [isAutoPlaying, animationQueue, currentAutoIndex, triggerAnimation])

  return (
    <AnimationContext.Provider
      value={{
        registerAnimation,
        unregisterAnimation,
        getAnimationState,
        triggerAnimation,
        completeAnimation,
        isAutoPlaying,
        setAutoPlaying,
      }}
    >
      {children}
    </AnimationContext.Provider>
  )
}

export function useAnimation(id: string) {
  const context = useContext(AnimationContext)

  if (!context) {
    // Fallback for when provider isn't present - just use local state
    const [isPlaying, setIsPlaying] = useState(false)
    const [isHovered, setIsHovered] = useState(false)

    return {
      isPlaying: isPlaying || isHovered,
      isHovered,
      trigger: () => setIsPlaying(true),
      complete: () => setIsPlaying(false),
      hoverProps: {
        onMouseEnter: () => setIsHovered(true),
        onMouseLeave: () => setIsHovered(false),
      },
    }
  }

  const { registerAnimation, unregisterAnimation, getAnimationState, triggerAnimation, completeAnimation } = context
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    registerAnimation(id)
    return () => unregisterAnimation(id)
  }, [id, registerAnimation, unregisterAnimation])

  const state = getAnimationState(id)

  return {
    isPlaying: state === 'playing' || isHovered,
    isHovered,
    trigger: () => triggerAnimation(id),
    complete: () => completeAnimation(id),
    hoverProps: {
      onMouseEnter: () => setIsHovered(true),
      onMouseLeave: () => setIsHovered(false),
    },
  }
}

// Simple hook for standalone animated components (hover to play)
export function useHoverAnimation(duration: number = 3000) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    if (isHovered && !isPlaying) {
      setIsPlaying(true)
    }
  }, [isHovered, isPlaying])

  useEffect(() => {
    if (isPlaying) {
      const timeout = setTimeout(() => {
        if (!isHovered) {
          setIsPlaying(false)
        }
      }, duration)
      return () => clearTimeout(timeout)
    }
  }, [isPlaying, isHovered, duration])

  return {
    isPlaying,
    hoverProps: {
      onMouseEnter: () => setIsHovered(true),
      onMouseLeave: () => setIsHovered(false),
    },
  }
}

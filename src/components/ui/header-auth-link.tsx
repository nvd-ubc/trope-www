'use client'

import { useEffect, useState } from 'react'
import type { MouseEventHandler } from 'react'
import Link from 'next/link'

type AuthLinkProps = {
  className?: string
  signedInLabel?: string
  signedOutLabel?: string
  signedInHref?: string
  signedOutHref?: string
  onClick?: MouseEventHandler<HTMLAnchorElement>
}

type AuthState = 'loading' | 'authenticated' | 'unauthenticated'

export default function AuthLink({
  className,
  signedInLabel = 'Dashboard',
  signedOutLabel = 'Sign in',
  signedInHref = '/dashboard',
  signedOutHref = '/signin',
  onClick,
}: AuthLinkProps) {
  const [authState, setAuthState] = useState<AuthState>('loading')

  useEffect(() => {
    let active = true
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/me', { cache: 'no-store' })
        if (!active) return
        if (response.ok) {
          setAuthState('authenticated')
          return
        }
        if (response.status === 401) {
          setAuthState('unauthenticated')
          return
        }
      } catch {
        // Fall through to unauthenticated state
      }
      if (active) setAuthState('unauthenticated')
    }

    checkAuth()
    return () => {
      active = false
    }
  }, [])

  const isAuthenticated = authState === 'authenticated'
  const href = isAuthenticated ? signedInHref : signedOutHref
  const label = isAuthenticated ? signedInLabel : signedOutLabel
  const fallbackClass = authState === 'loading' ? 'opacity-70' : ''

  return (
    <Link className={`${className ?? ''} ${fallbackClass}`.trim()} href={href} onClick={onClick}>
      {label}
    </Link>
  )
}

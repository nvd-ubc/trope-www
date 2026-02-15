'use client'

import type { MouseEventHandler } from 'react'
import Link from 'next/link'

type AuthLinkProps = {
  className?: string
  signedInLabel?: string
  signedOutLabel?: string
  signedInHref?: string
  signedOutHref?: string
  initialAuthState: AuthState
  onClick?: MouseEventHandler<HTMLAnchorElement>
}

type AuthState = 'authenticated' | 'unauthenticated'

export default function AuthLink({
  className,
  signedInLabel = 'Dashboard',
  signedOutLabel = 'Sign in',
  signedInHref = '/dashboard',
  signedOutHref = '/signin',
  initialAuthState,
  onClick,
}: AuthLinkProps) {
  const isAuthenticated = initialAuthState === 'authenticated'
  const href = isAuthenticated ? signedInHref : signedOutHref
  const label = isAuthenticated ? signedInLabel : signedOutLabel

  return (
    <Link className={className} href={href} onClick={onClick}>
      {label}
    </Link>
  )
}

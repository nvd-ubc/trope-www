'use client'

import { useEffect, useMemo } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { hasRequiredProfileNames } from '@/lib/profile-identity'

type ProfileCompletionGateProps = {
  children: React.ReactNode
}

type MeResponse = {
  first_name?: string | null
  last_name?: string | null
}

type ProfileCheckResult = 'unknown' | 'complete' | 'incomplete' | 'unauthorized'

const PROFILE_CHECK_TTL_MS = 5 * 60 * 1000

let cachedProfileCheck: ProfileCheckResult = 'unknown'
let cachedProfileCheckAt = 0
let inFlightProfileCheck: Promise<ProfileCheckResult> | null = null

const hasFreshProfileCheck = () =>
  cachedProfileCheck !== 'unknown' && Date.now() - cachedProfileCheckAt < PROFILE_CHECK_TTL_MS

const resolveProfileCheck = async (): Promise<ProfileCheckResult> => {
  if (hasFreshProfileCheck()) {
    return cachedProfileCheck
  }

  if (inFlightProfileCheck) {
    return inFlightProfileCheck
  }

  inFlightProfileCheck = (async () => {
    try {
      const response = await fetch('/api/me', { cache: 'no-store' })

      if (response.status === 401) {
        cachedProfileCheck = 'unauthorized'
        cachedProfileCheckAt = Date.now()
        return cachedProfileCheck
      }

      const payload = (await response.json().catch(() => null)) as MeResponse | null
      if (!response.ok || !payload) {
        cachedProfileCheck = 'unknown'
        cachedProfileCheckAt = 0
        return cachedProfileCheck
      }

      cachedProfileCheck = hasRequiredProfileNames(payload) ? 'complete' : 'incomplete'
      cachedProfileCheckAt = Date.now()
      return cachedProfileCheck
    } catch {
      cachedProfileCheck = 'unknown'
      cachedProfileCheckAt = 0
      return cachedProfileCheck
    } finally {
      inFlightProfileCheck = null
    }
  })()

  return inFlightProfileCheck
}

export default function ProfileCompletionGate({ children }: ProfileCompletionGateProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const isAccountPage = pathname === '/dashboard/account'

  const currentPath = useMemo(() => {
    const query = searchParams.toString()
    return query ? `${pathname}?${query}` : pathname
  }, [pathname, searchParams])

  useEffect(() => {
    let active = true

    if (isAccountPage) {
      return () => {
        active = false
      }
    }

    const enforceProfileCompletion = async () => {
      const result = await resolveProfileCheck()
      if (!active) return

      if (result === 'unauthorized') {
        router.replace(`/signin?next=${encodeURIComponent(currentPath)}`)
        return
      }

      if (result === 'incomplete') {
        router.replace(`/dashboard/account?completeProfile=1&next=${encodeURIComponent(currentPath)}`)
      }
    }

    if (hasFreshProfileCheck()) {
      if (cachedProfileCheck === 'unauthorized') {
        router.replace(`/signin?next=${encodeURIComponent(currentPath)}`)
      } else if (cachedProfileCheck === 'incomplete') {
        router.replace(`/dashboard/account?completeProfile=1&next=${encodeURIComponent(currentPath)}`)
      }
    } else {
      void enforceProfileCompletion()
    }

    return () => {
      active = false
    }
  }, [currentPath, isAccountPage, router])

  return <>{children}</>
}

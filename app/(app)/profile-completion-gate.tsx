'use client'

import { useEffect, useMemo, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { hasRequiredProfileNames } from '@/lib/profile-identity'

type ProfileCompletionGateProps = {
  children: React.ReactNode
}

type MeResponse = {
  first_name?: string | null
  last_name?: string | null
}

export default function ProfileCompletionGate({ children }: ProfileCompletionGateProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isAllowed, setIsAllowed] = useState(false)
  const isAccountPage = pathname === '/dashboard/account'

  const currentPath = useMemo(() => {
    const query = searchParams.toString()
    return query ? `${pathname}?${query}` : pathname
  }, [pathname, searchParams])

  useEffect(() => {
    let active = true

    if (isAccountPage) {
      setIsAllowed(true)
      return () => {
        active = false
      }
    }

    setIsAllowed(false)

    const checkProfile = async () => {
      try {
        const response = await fetch('/api/me', { cache: 'no-store' })
        if (!active) return

        if (response.status === 401) {
          router.replace(`/signin?next=${encodeURIComponent(currentPath)}`)
          return
        }

        const payload = (await response.json().catch(() => null)) as MeResponse | null
        if (!response.ok || !payload) {
          setIsAllowed(true)
          return
        }

        const missingName = !hasRequiredProfileNames(payload)
        if (missingName) {
          router.replace(`/dashboard/account?completeProfile=1&next=${encodeURIComponent(currentPath)}`)
          return
        }

        setIsAllowed(true)
      } catch {
        if (!active) return
        setIsAllowed(true)
      }
    }

    checkProfile()
    return () => {
      active = false
    }
  }, [currentPath, isAccountPage, router])

  if (isAccountPage || isAllowed) {
    return <>{children}</>
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
      Checking profile…
    </div>
  )
}

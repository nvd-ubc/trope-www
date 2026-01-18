'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

type OrgListResponse = {
  orgs: Array<{ org_id: string }>
  default_org_id?: string | null
}

let orgListCache: OrgListResponse | null | undefined
let orgListPromise: Promise<OrgListResponse | null> | null = null

const loadOrgList = async () => {
  if (orgListCache !== undefined) {
    return orgListCache
  }
  if (!orgListPromise) {
    orgListPromise = (async () => {
      try {
        const response = await fetch('/api/orgs', { cache: 'no-store' })
        if (!response.ok) return null
        return (await response.json().catch(() => null)) as OrgListResponse | null
      } catch {
        return null
      } finally {
        orgListPromise = null
      }
    })()
  }
  const payload = await orgListPromise
  orgListCache = payload
  return payload
}

const parseActiveOrgId = (pathname: string) => {
  const match = pathname.match(/\/dashboard\/workspaces\/([^/]+)/)
  return match ? decodeURIComponent(match[1]) : null
}

export default function WorkspaceNavLink({
  path,
  className,
  children,
}: {
  path: string
  className?: string
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [defaultOrgId, setDefaultOrgId] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    const load = async () => {
      const payload = await loadOrgList()
      if (!active) return
      setDefaultOrgId(payload?.default_org_id ?? null)
    }

    load()
    return () => {
      active = false
    }
  }, [])

  const activeOrgId = useMemo(() => {
    return parseActiveOrgId(pathname) || defaultOrgId
  }, [pathname, defaultOrgId])

  const href = activeOrgId
    ? `/dashboard/workspaces/${encodeURIComponent(activeOrgId)}/${path}`
    : '/dashboard/workspaces'

  return (
    <Link className={className} href={href}>
      {children}
    </Link>
  )
}

'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

type OrgListResponse = {
  orgs: Array<{ org_id: string }>
  default_org_id?: string | null
}

const parseActiveOrgId = (pathname: string) => {
  const match = pathname.match(/\/dashboard\/workspaces\/([^/]+)/)
  return match ? decodeURIComponent(match[1]) : null
}

export default function WorkflowsNavLink({ className }: { className?: string }) {
  const pathname = usePathname()
  const [defaultOrgId, setDefaultOrgId] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    const load = async () => {
      try {
        const response = await fetch('/api/orgs', { cache: 'no-store' })
        if (!response.ok) return
        const payload = (await response.json().catch(() => null)) as OrgListResponse | null
        if (!active) return
        setDefaultOrgId(payload?.default_org_id ?? null)
      } catch {
        if (!active) return
      }
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
    ? `/dashboard/workspaces/${encodeURIComponent(activeOrgId)}/workflows`
    : '/dashboard/workspaces'

  return (
    <Link className={className} href={href}>
      Workflows
    </Link>
  )
}

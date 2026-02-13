'use client'

import { type ComponentProps, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { loadOrgList, subscribeOrgListUpdates } from './org-list-cache'

const parseActiveOrgId = (pathname: string) => {
  const match = pathname.match(/\/dashboard\/workspaces\/([^/]+)/)
  return match ? decodeURIComponent(match[1]) : null
}

type WorkspaceNavLinkProps = Omit<ComponentProps<typeof Link>, 'href'> & {
  path: string
}

export default function WorkspaceNavLink({ path, ...props }: WorkspaceNavLinkProps) {
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
    const unsubscribe = subscribeOrgListUpdates(() => {
      load()
    })
    return () => {
      active = false
      unsubscribe()
    }
  }, [])

  const activeOrgId = useMemo(() => {
    return parseActiveOrgId(pathname) || defaultOrgId
  }, [pathname, defaultOrgId])

  const href = activeOrgId
    ? `/dashboard/workspaces/${encodeURIComponent(activeOrgId)}/${path}`
    : '/dashboard/workspaces'

  return (
    <Link href={href} {...props} />
  )
}

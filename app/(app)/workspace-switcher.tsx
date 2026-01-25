'use client'

import { useEffect, useMemo, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'

type OrgSummary = {
  org_id: string
  name: string
  role: string
  status: string
  created_at: string
}

type OrgListResponse = {
  orgs: OrgSummary[]
  personal_org_id?: string | null
  default_org_id?: string | null
}

const parseActiveOrgId = (pathname: string) => {
  const match = pathname.match(/\/dashboard\/workspaces\/([^/]+)/)
  return match ? decodeURIComponent(match[1]) : null
}

export default function WorkspaceSwitcher() {
  const router = useRouter()
  const pathname = usePathname()
  const [orgs, setOrgs] = useState<OrgSummary[]>([])
  const [defaultOrgId, setDefaultOrgId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    const load = async () => {
      try {
        const response = await fetch('/api/orgs', { cache: 'no-store' })
        if (response.status === 401) {
          router.replace('/signin?next=/dashboard')
          return
        }
        const payload = (await response.json().catch(() => null)) as OrgListResponse | null
        if (!active) return
        if (!response.ok || !payload) {
          throw new Error('Unable to load workspaces.')
        }
        setOrgs(payload.orgs ?? [])
        setDefaultOrgId(payload.default_org_id ?? null)
        setLoading(false)
      } catch {
        if (!active) return
        setLoading(false)
      }
    }

    load()
    return () => {
      active = false
    }
  }, [router])

  const activeOrgId = useMemo(() => {
    const fromPath = parseActiveOrgId(pathname)
    return fromPath || defaultOrgId
  }, [pathname, defaultOrgId])

  const activeOrg = useMemo(
    () => orgs.find((org) => org.org_id === activeOrgId) || null,
    [orgs, activeOrgId]
  )

  if (loading || orgs.length === 0) {
    return (
      <div className="hidden md:flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-500">
        Workspace
      </div>
    )
  }

  return (
    <div className="hidden md:flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600">
      <span className="text-slate-400">Workspace</span>
      <select
        className="bg-transparent text-slate-700 text-xs font-medium focus:outline-none"
        value={activeOrgId ?? ''}
        onChange={(event) => {
          const value = event.target.value
          if (!value) return
          router.push(`/dashboard/workspaces/${encodeURIComponent(value)}`)
        }}
      >
        {orgs.map((org) => (
          <option key={org.org_id} value={org.org_id}>
            {org.name || org.org_id}
          </option>
        ))}
      </select>
      {activeOrg?.role && (
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] uppercase tracking-wide text-slate-500">
          {activeOrg.role.replace('org_', '')}
        </span>
      )}
    </div>
  )
}

'use client'

import { useEffect, useMemo, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Badge from '@/components/ui/badge'
import { ButtonGroup, ButtonGroupText } from '@/components/ui/button-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

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
      <ButtonGroup className="hidden md:flex">
        <ButtonGroupText className="h-8 rounded-r-none px-3 text-xs font-medium text-muted-foreground">
          Workspace
        </ButtonGroupText>
        <ButtonGroupText className="h-8 rounded-l-none border-l-0 px-3 text-xs text-muted-foreground">
          Loading...
        </ButtonGroupText>
      </ButtonGroup>
    )
  }

  return (
    <div className="hidden items-center gap-2 md:flex">
      <ButtonGroup>
        <ButtonGroupText className="h-8 rounded-r-none px-3 text-xs font-medium text-muted-foreground">
          Workspace
        </ButtonGroupText>
        <Select
          value={activeOrgId ?? ''}
          onValueChange={(value) => {
            if (!value) return
            router.push(`/dashboard/workspaces/${encodeURIComponent(value)}`)
          }}
        >
          <SelectTrigger
            size="sm"
            className="h-8 min-w-[11.5rem] rounded-l-none border-l-0 text-xs shadow-none focus-visible:ring-0"
          >
            <SelectValue placeholder="Select workspace" />
          </SelectTrigger>
          <SelectContent>
            {orgs.map((org) => (
              <SelectItem key={org.org_id} value={org.org_id}>
                {org.name || org.org_id}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </ButtonGroup>
      {activeOrg?.role && (
        <Badge variant="outline" className="text-[10px] tracking-wide uppercase">
          {activeOrg.role.replace('org_', '')}
        </Badge>
      )}
    </div>
  )
}

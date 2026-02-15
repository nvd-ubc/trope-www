'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Search } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import Badge from '@/components/ui/badge'
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from '@/components/ui/input-group'
import {
  DashboardHomeSkeleton,
  ErrorNotice,
  MetricCard,
  PageHeader,
  SectionCard,
} from '@/components/dashboard'

type Teammate = {
  user_id: string
  email?: string | null
  display_name?: string | null
  primary_label: string
  role: string
  status: string
  joined_at: string
  contributions?: {
    guides_created?: number
    pages_created?: number
    views_30d?: number
    guided_completions_30d?: number
    successful_runs_30d?: number
    tasks_assigned?: number
    tasks_completed?: number
  }
}

type TeammatesBootstrapResponse = {
  teammates?: {
    teammates?: Teammate[]
  } | null
  error?: string
}

const initialsFor = (value: string) => {
  const parts = value
    .split(/\s+/)
    .map((entry) => entry.trim())
    .filter(Boolean)

  if (parts.length === 0) return 'U'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
}

const formatDate = (value?: string) => {
  if (!value) return 'Unknown'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function TeammatesClient({ orgId }: { orgId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [teammates, setTeammates] = useState<Teammate[]>([])

  useEffect(() => {
    let active = true

    const load = async () => {
      try {
        const response = await fetch(
          `/api/orgs/${encodeURIComponent(orgId)}/teammates/bootstrap`,
          { cache: 'no-store' }
        )

        if (response.status === 401) {
          router.replace(`/signin?next=/dashboard/workspaces/${encodeURIComponent(orgId)}/teammates`)
          return
        }

        const payload = (await response.json().catch(() => null)) as TeammatesBootstrapResponse | null
        if (!response.ok || !payload?.teammates?.teammates) {
          throw new Error('Unable to load teammates.')
        }

        if (!active) return
        setTeammates(payload.teammates.teammates ?? [])
        setLoading(false)
      } catch (err) {
        if (!active) return
        setError(err instanceof Error ? err.message : 'Unable to load teammates.')
        setLoading(false)
      }
    }

    load()
    return () => {
      active = false
    }
  }, [orgId, router])

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return teammates
    return teammates.filter((teammate) => {
      const text = `${teammate.primary_label} ${teammate.email ?? ''} ${teammate.role}`.toLowerCase()
      return text.includes(normalized)
    })
  }, [query, teammates])

  if (loading) {
    return <DashboardHomeSkeleton />
  }

  if (error) {
    return <ErrorNotice title="Unable to load teammates" message={error} />
  }

  const totalGuides = teammates.reduce(
    (sum, teammate) => sum + Number(teammate.contributions?.guides_created ?? 0),
    0
  )
  const totalViews = teammates.reduce(
    (sum, teammate) => sum + Number(teammate.contributions?.views_30d ?? 0),
    0
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title="Teammates"
        description="Directory-style team view with contribution metrics."
        backHref={`/dashboard/workspaces/${encodeURIComponent(orgId)}/home`}
        backLabel="Back to home"
        actions={
          <Link
            href={`/dashboard/workspaces/${encodeURIComponent(orgId)}/invites`}
            className="rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-foreground hover:bg-muted/40"
          >
            Invite teammate
          </Link>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Teammates" value={teammates.length} />
        <MetricCard label="Guides created" value={totalGuides} helper="Across active members" />
        <MetricCard label="Views (30d)" value={totalViews} helper="On authored docs" />
      </div>

      <SectionCard
        title="Directory"
        description="Search by name, email, or role."
        action={<Badge variant="neutral">{filtered.length}</Badge>}
      >
        <InputGroup className="max-w-sm">
          <InputGroupAddon>
            <InputGroupText>
              <Search className="size-4" />
            </InputGroupText>
          </InputGroupAddon>
          <InputGroupInput
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search teammates"
          />
        </InputGroup>

        {filtered.length === 0 && (
          <div className="rounded-lg border border-dashed border-border bg-muted/40 p-6 text-sm text-muted-foreground">
            No teammates match your search.
          </div>
        )}

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((teammate) => (
            <div
              key={teammate.user_id}
              className="rounded-xl border border-border bg-card p-4"
            >
              <div className="flex items-center gap-3">
                <Avatar size="sm">
                  <AvatarFallback>{initialsFor(teammate.primary_label)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-foreground">{teammate.primary_label}</div>
                  <div className="truncate text-xs text-muted-foreground">{teammate.email ?? teammate.user_id}</div>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Badge variant="info">{teammate.role.replace('org_', '')}</Badge>
                <Badge variant="neutral">Joined {formatDate(teammate.joined_at)}</Badge>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <div>
                  <div className="uppercase tracking-wide">Guides</div>
                  <div className="text-sm font-semibold text-foreground">{teammate.contributions?.guides_created ?? 0}</div>
                </div>
                <div>
                  <div className="uppercase tracking-wide">Views</div>
                  <div className="text-sm font-semibold text-foreground">{teammate.contributions?.views_30d ?? 0}</div>
                </div>
                <div>
                  <div className="uppercase tracking-wide">Runs</div>
                  <div className="text-sm font-semibold text-foreground">{teammate.contributions?.successful_runs_30d ?? 0}</div>
                </div>
                <div>
                  <div className="uppercase tracking-wide">Tasks</div>
                  <div className="text-sm font-semibold text-foreground">
                    {teammate.contributions?.tasks_completed ?? 0}/{teammate.contributions?.tasks_assigned ?? 0}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  )
}

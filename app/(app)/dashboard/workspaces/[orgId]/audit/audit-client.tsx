'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/button'
import Card from '@/components/ui/card'
import Input from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Table, TableCell, TableHead, TableHeaderCell, TableRow } from '@/components/ui/table'
import { DataToolbar, EmptyState, ErrorNotice, PageHeader } from '@/components/dashboard'

type AuditEvent = {
  actor_user_id: string
  org_id?: string | null
  action: string
  resource_type?: string | null
  resource_id?: string | null
  ip?: string | null
  user_agent?: string | null
  metadata?: Record<string, string> | null
  created_at: string
}

type AuditResponse = {
  events: AuditEvent[]
  next_cursor?: string | null
}

type MemberRecord = {
  user_id: string
  role: string
  status: string
  email?: string
  display_name?: string
}

type MembersResponse = {
  members: MemberRecord[]
}

const formatDateTime = (value?: string) => {
  if (!value) return 'Unknown'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

const formatAction = (value: string) =>
  value
    .split('.')
    .map((chunk) => chunk.replace(/_/g, ' '))
    .map((chunk) => (chunk ? chunk[0].toUpperCase() + chunk.slice(1) : chunk))
    .join(' · ')

const buildResourceLabel = (event: AuditEvent) => {
  const type = event.resource_type?.replace(/_/g, ' ') ?? ''
  const id = event.resource_id ?? ''
  if (type && id) return `${type} · ${id}`
  if (type) return type
  if (id) return id
  return null
}

const formatMemberLabel = (member: MemberRecord) => {
  if (member.display_name && member.email) {
    return `${member.display_name} (${member.email})`
  }
  if (member.display_name) return member.display_name
  if (member.email) return member.email
  return member.user_id
}

export default function AuditClient({ orgId }: { orgId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [requestId, setRequestId] = useState<string | null>(null)
  const [forbidden, setForbidden] = useState(false)
  const [events, setEvents] = useState<AuditEvent[]>([])
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [memberMap, setMemberMap] = useState<Record<string, string>>({})
  const [sortBy, setSortBy] = useState('newest')

  const loadMembers = useCallback(async () => {
    const response = await fetch(`/api/orgs/${encodeURIComponent(orgId)}/members`, {
      cache: 'no-store',
    })
    if (!response.ok) return
    const payload = (await response.json().catch(() => null)) as MembersResponse | null
    const map: Record<string, string> = {}
    for (const member of payload?.members ?? []) {
      map[member.user_id] = formatMemberLabel(member)
    }
    setMemberMap(map)
  }, [orgId])

  const loadEvents = useCallback(async (cursor?: string, append = false) => {
    const queryParams = new URLSearchParams()
    queryParams.set('limit', '25')
    if (cursor) {
      queryParams.set('cursor', cursor)
    }
    const response = await fetch(
      `/api/orgs/${encodeURIComponent(orgId)}/audit?${queryParams.toString()}`,
      { cache: 'no-store' }
    )

    if (response.status === 401) {
      router.replace(`/signin?next=/dashboard/workspaces/${encodeURIComponent(orgId)}/audit`)
      return
    }

    if (response.status === 403) {
      setForbidden(true)
      setError('Audit logs are only available to workspace admins.')
      return
    }

    const payload = (await response.json().catch(() => null)) as AuditResponse | null
    if (!response.ok || !payload) {
      setRequestId(response.headers.get('x-trope-request-id'))
      throw new Error('Unable to load audit log.')
    }

    setEvents((prev) => (append ? [...prev, ...(payload.events ?? [])] : payload.events ?? []))
    setNextCursor(payload.next_cursor ?? null)
  }, [orgId, router])

  useEffect(() => {
    let active = true
    const run = async () => {
      try {
        await Promise.all([loadEvents(), loadMembers()])
        if (!active) return
        setLoading(false)
      } catch (err) {
        if (!active) return
        setError(err instanceof Error ? err.message : 'Unable to load audit log.')
        setLoading(false)
      }
    }
    run()
    return () => {
      active = false
    }
  }, [loadEvents, loadMembers])

  const handleLoadMore = async () => {
    if (!nextCursor) return
    setLoadingMore(true)
    setError(null)
    setRequestId(null)
    try {
      await loadEvents(nextCursor, true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load audit log.')
    } finally {
      setLoadingMore(false)
    }
  }

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    const filteredList = events.filter((event) => {
      if (!normalized) return true
      const action = event.action.toLowerCase()
      const actor = (memberMap[event.actor_user_id] ?? event.actor_user_id).toLowerCase()
      const resource = buildResourceLabel(event)?.toLowerCase() ?? ''
      return (
        action.includes(normalized) ||
        actor.includes(normalized) ||
        resource.includes(normalized) ||
        event.actor_user_id.toLowerCase().includes(normalized)
      )
    })

    const sorted = [...filteredList]
    sorted.sort((a, b) => {
      if (sortBy === 'oldest') {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      }
      if (sortBy === 'action') {
        return a.action.localeCompare(b.action)
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })

    return sorted
  }, [events, query, memberMap, sortBy])

  const exportCsv = () => {
    const rows = [
      ['created_at', 'action', 'actor', 'actor_id', 'resource', 'ip', 'user_agent'],
      ...filtered.map((event) => [
        event.created_at,
        event.action,
        memberMap[event.actor_user_id] ?? event.actor_user_id,
        event.actor_user_id,
        buildResourceLabel(event) ?? '',
        event.ip ?? '',
        event.user_agent ?? '',
      ]),
    ]
    const csv = rows
      .map((row) => row.map((value) => `"${String(value).replace(/\"/g, '""')}"`).join(','))
      .join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `trope-audit-${orgId}.csv`)
    link.click()
    URL.revokeObjectURL(url)
  }

  const copyRequestId = async () => {
    if (!requestId) return
    try {
      await navigator.clipboard.writeText(requestId)
    } catch {
      // ignore
    }
  }

  if (loading) {
    return <Card className="p-6 text-sm text-muted-foreground">Loading audit log…</Card>
  }

  if (error && events.length === 0) {
    return (
      <ErrorNotice
        title="Unable to load audit log"
        message={error}
        requestId={requestId}
        onCopyRequestId={() => copyRequestId()}
      />
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit log"
        description="Track membership changes, invite actions, and governance updates."
        backHref={`/dashboard/workspaces/${encodeURIComponent(orgId)}`}
        backLabel="Back to workspace"
      />

      {error && (
        <ErrorNotice
          title="Audit data is partially unavailable"
          message={error}
          requestId={requestId}
          onCopyRequestId={() => copyRequestId()}
        />
      )}

      {forbidden && events.length === 0 && (
        <Card className="border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          You need admin access to view audit events.
        </Card>
      )}

      <DataToolbar
        summary={`${filtered.length} events`}
        filters={
          <>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger size="sm" className="min-w-[10rem]">
              <SelectValue placeholder="Newest first" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest first</SelectItem>
              <SelectItem value="oldest">Oldest first</SelectItem>
              <SelectItem value="action">Action A-Z</SelectItem>
            </SelectContent>
          </Select>
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search actions, actors, resources"
            className="w-72"
          />
          </>
        }
        actions={
          <Button variant="outline" size="sm" onClick={exportCsv}>
            Export CSV
          </Button>
        }
      />

      <Card className="overflow-hidden">
        {events.length === 0 && !forbidden ? (
          <div className="p-6">
            <EmptyState title="No audit events yet" description="Events appear as membership and workflow actions happen." className="py-8" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeaderCell>Timestamp</TableHeaderCell>
                  <TableHeaderCell>Action</TableHeaderCell>
                  <TableHeaderCell>Actor</TableHeaderCell>
                  <TableHeaderCell>Resource</TableHeaderCell>
                  <TableHeaderCell>IP</TableHeaderCell>
                  <TableHeaderCell>User agent</TableHeaderCell>
                </TableRow>
              </TableHead>
              <tbody>
                {filtered.map((event, index) => {
                  const resourceLabel = buildResourceLabel(event)
                  const actorLabel = memberMap[event.actor_user_id] ?? event.actor_user_id
                  return (
                    <TableRow key={`${event.created_at}-${event.action}-${index}`}>
                      <TableCell>{formatDateTime(event.created_at)}</TableCell>
                      <TableCell>
                        <div className="text-sm font-semibold text-foreground">
                          {formatAction(event.action)}
                        </div>
                        {event.metadata && Object.keys(event.metadata).length > 0 && (
                          <div className="mt-1 text-xs text-muted-foreground">
                            {Object.entries(event.metadata)
                              .map(([key, value]) => `${key}: ${value}`)
                              .join(' · ')}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-foreground">{actorLabel}</div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="mt-1 h-6 px-2 text-[10px] uppercase tracking-wide"
                          onClick={() => navigator.clipboard.writeText(event.actor_user_id)}
                        >
                          Copy ID
                        </Button>
                      </TableCell>
                      <TableCell>{resourceLabel ?? '-'}</TableCell>
                      <TableCell>{event.ip ?? '-'}</TableCell>
                      <TableCell className="max-w-[220px] truncate text-xs text-muted-foreground">
                        {event.user_agent ?? '-'}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </tbody>
            </Table>
          </div>
        )}
      </Card>

      {nextCursor && !forbidden && (
        <div className="flex justify-center">
          <Button variant="outline" size="md" onClick={handleLoadMore} disabled={loadingMore}>
            {loadingMore ? 'Loading…' : 'Load more'}
          </Button>
        </div>
      )}
    </div>
  )
}

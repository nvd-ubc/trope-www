'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

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

export default function AuditClient({ orgId }: { orgId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [forbidden, setForbidden] = useState(false)
  const [events, setEvents] = useState<AuditEvent[]>([])
  const [nextCursor, setNextCursor] = useState<string | null>(null)

  const loadEvents = async (cursor?: string, append = false) => {
    const query = new URLSearchParams()
    query.set('limit', '25')
    if (cursor) {
      query.set('cursor', cursor)
    }
    const response = await fetch(
      `/api/orgs/${encodeURIComponent(orgId)}/audit?${query.toString()}`,
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
      throw new Error('Unable to load audit log.')
    }

    setEvents((prev) => (append ? [...prev, ...(payload.events ?? [])] : payload.events ?? []))
    setNextCursor(payload.next_cursor ?? null)
  }

  useEffect(() => {
    let active = true
    const run = async () => {
      try {
        await loadEvents()
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
  }, [orgId])

  const handleLoadMore = async () => {
    if (!nextCursor) return
    setLoadingMore(true)
    setError(null)
    try {
      await loadEvents(nextCursor, true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load audit log.')
    } finally {
      setLoadingMore(false)
    }
  }

  if (loading) {
    return <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">Loading audit log…</div>
  }

  if (error && events.length === 0) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
        {error}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Audit log</h1>
          <p className="mt-1 text-sm text-slate-600">
            Track membership changes, invite actions, and workspace updates.
          </p>
        </div>
        <Link
          href={`/dashboard/workspaces/${encodeURIComponent(orgId)}`}
          className="text-sm font-medium text-[#1861C8] hover:text-[#1861C8]/80"
        >
          Back to workspace
        </Link>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      {forbidden && events.length === 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          You need admin access to view audit events.
        </div>
      )}

      <div className="space-y-4">
        {events.length === 0 && !forbidden && (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
            No audit events yet.
          </div>
        )}
        {events.map((event, index) => {
          const resourceLabel = buildResourceLabel(event)
          return (
            <div
              key={`${event.created_at}-${event.action}-${index}`}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-slate-900">
                    {formatAction(event.action)}
                  </div>
                  <div className="text-xs text-slate-500">{formatDateTime(event.created_at)}</div>
                </div>
                {resourceLabel && (
                  <div className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-medium uppercase tracking-wide text-slate-600">
                    {resourceLabel}
                  </div>
                )}
              </div>

              <div className="mt-4 grid gap-2 text-xs text-slate-600">
                <div>
                  <span className="font-medium text-slate-700">Actor</span>: {event.actor_user_id}
                </div>
                {event.ip && (
                  <div>
                    <span className="font-medium text-slate-700">IP</span>: {event.ip}
                  </div>
                )}
                {event.user_agent && (
                  <div>
                    <span className="font-medium text-slate-700">User agent</span>: {event.user_agent}
                  </div>
                )}
              </div>

              {event.metadata && Object.keys(event.metadata).length > 0 && (
                <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">Metadata</div>
                  <div className="mt-2 grid gap-2 text-xs text-slate-600">
                    {Object.entries(event.metadata).map(([key, value]) => (
                      <div key={key} className="flex flex-wrap justify-between gap-2">
                        <span className="font-medium text-slate-700">{key}</span>
                        <span className="text-slate-600">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {nextCursor && !forbidden && (
        <div className="flex justify-center">
          <button
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:border-slate-300 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
            onClick={handleLoadMore}
            disabled={loadingMore}
          >
            {loadingMore ? 'Loading…' : 'Load more'}
          </button>
        </div>
      )}
    </div>
  )
}

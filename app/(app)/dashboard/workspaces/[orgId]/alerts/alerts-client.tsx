'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Badge from '@/components/ui/badge'
import Button from '@/components/ui/button'
import Card from '@/components/ui/card'
import Input from '@/components/ui/input'
import { Table, TableCell, TableHead, TableHeaderCell, TableRow } from '@/components/ui/table'
import { useCsrfToken } from '@/lib/client/use-csrf-token'

type WorkflowAlert = {
  alert_id: string
  workflow_id: string
  alert_type: string
  status: string
  severity: string
  title: string
  description: string
  last_triggered_at?: string | null
  snoozed_until?: string | null
  resolved_at?: string | null
  assigned_to?: string | null
}

type AlertsResponse = {
  alerts: WorkflowAlert[]
}

type WorkflowDefinition = {
  workflow_id: string
  title: string
}

type WorkflowListResponse = {
  workflows: WorkflowDefinition[]
}

type MeResponse = {
  sub: string
  email?: string
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

const formatDateTime = (value?: string | null) => {
  if (!value) return '—'
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

const severityVariant = (severity?: string | null) => {
  const normalized = (severity ?? '').toLowerCase()
  if (normalized === 'high') return 'danger'
  if (normalized === 'medium') return 'warning'
  if (normalized === 'low') return 'neutral'
  return 'info'
}

const statusVariant = (status?: string | null) => {
  const normalized = (status ?? '').toLowerCase()
  if (normalized === 'open') return 'danger'
  if (normalized === 'snoozed') return 'warning'
  if (normalized === 'resolved') return 'neutral'
  return 'info'
}

export default function AlertsClient({ orgId }: { orgId: string }) {
  const router = useRouter()
  const { token: csrfToken } = useCsrfToken()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [requestId, setRequestId] = useState<string | null>(null)
  const [alerts, setAlerts] = useState<WorkflowAlert[]>([])
  const [workflowMap, setWorkflowMap] = useState<Record<string, string>>({})
  const [memberMap, setMemberMap] = useState<Record<string, string>>({})
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('open')
  const [sortBy, setSortBy] = useState('triggered_desc')
  const [pendingAction, setPendingAction] = useState<string | null>(null)

  const loadWorkflows = useCallback(async () => {
    const response = await fetch(`/api/orgs/${encodeURIComponent(orgId)}/workflows`, {
      cache: 'no-store',
    })
    if (!response.ok) return
    const payload = (await response.json().catch(() => null)) as WorkflowListResponse | null
    const map: Record<string, string> = {}
    for (const workflow of payload?.workflows ?? []) {
      map[workflow.workflow_id] = workflow.title
    }
    setWorkflowMap(map)
  }, [orgId])

  const loadMe = useCallback(async () => {
    const response = await fetch('/api/me', { cache: 'no-store' })
    if (response.status === 401) {
      router.replace(`/signin?next=/dashboard/workspaces/${encodeURIComponent(orgId)}/alerts`)
      return
    }
    if (!response.ok) return
    const payload = (await response.json().catch(() => null)) as MeResponse | null
    if (payload?.sub) setCurrentUserId(payload.sub)
    if (payload?.email) setCurrentUserEmail(payload.email)
  }, [orgId, router])

  const loadMembers = useCallback(async () => {
    const response = await fetch(`/api/orgs/${encodeURIComponent(orgId)}/members`, {
      cache: 'no-store',
    })
    if (!response.ok) return
    const payload = (await response.json().catch(() => null)) as MembersResponse | null
    const map: Record<string, string> = {}
    for (const member of payload?.members ?? []) {
      if (member.display_name && member.email) {
        map[member.user_id] = `${member.display_name} (${member.email})`
      } else if (member.display_name) {
        map[member.user_id] = member.display_name
      } else if (member.email) {
        map[member.user_id] = member.email
      } else {
        map[member.user_id] = member.user_id
      }
    }
    setMemberMap(map)
  }, [orgId])

  const loadAlerts = useCallback(async () => {
    const queryParams = new URLSearchParams()
    if (statusFilter) {
      queryParams.set('status', statusFilter)
    }
    const response = await fetch(
      `/api/orgs/${encodeURIComponent(orgId)}/alerts?${queryParams.toString()}`,
      { cache: 'no-store' }
    )

    if (response.status === 401) {
      router.replace(`/signin?next=/dashboard/workspaces/${encodeURIComponent(orgId)}/alerts`)
      return
    }

    const payload = (await response.json().catch(() => null)) as AlertsResponse | null
    if (!response.ok || !payload) {
      const reqId = response.headers.get('x-trope-request-id')
      setRequestId(reqId)
      throw new Error('Unable to load alerts.')
    }

    setAlerts(payload.alerts ?? [])
  }, [orgId, router, statusFilter])

  useEffect(() => {
    let active = true
    const run = async () => {
      try {
        await Promise.all([loadAlerts(), loadWorkflows(), loadMe(), loadMembers()])
        if (!active) return
        setLoading(false)
      } catch (err) {
        if (!active) return
        setError(err instanceof Error ? err.message : 'Unable to load alerts.')
        setLoading(false)
      }
    }
    run()
    return () => {
      active = false
    }
  }, [loadAlerts, loadWorkflows, loadMe, loadMembers])

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    const filteredList = alerts.filter((alert) => {
      if (!normalized) return true
      const title = workflowMap[alert.workflow_id] ?? alert.workflow_id
      return (
        title.toLowerCase().includes(normalized) ||
        alert.title.toLowerCase().includes(normalized) ||
        alert.workflow_id.toLowerCase().includes(normalized)
      )
    })

    const sorted = [...filteredList]
    sorted.sort((a, b) => {
      if (sortBy === 'severity') {
        const order = { high: 0, medium: 1, low: 2 } as Record<string, number>
        return (order[a.severity ?? 'low'] ?? 3) - (order[b.severity ?? 'low'] ?? 3)
      }
      if (sortBy === 'status') {
        return a.status.localeCompare(b.status)
      }
      return new Date(b.last_triggered_at ?? 0).getTime() - new Date(a.last_triggered_at ?? 0).getTime()
    })

    return sorted
  }, [alerts, query, workflowMap, sortBy])

  const copyRequestId = async () => {
    if (!requestId) return
    try {
      await navigator.clipboard.writeText(requestId)
    } catch {
      // ignore
    }
  }

  const exportCsv = () => {
    const rows = [
      [
        'alert_id',
        'workflow_id',
        'workflow_title',
        'alert_type',
        'severity',
        'status',
        'last_triggered_at',
        'assigned_to',
      ],
      ...filtered.map((alert) => [
        alert.alert_id,
        alert.workflow_id,
        workflowMap[alert.workflow_id] ?? '',
        alert.alert_type,
        alert.severity,
        alert.status,
        alert.last_triggered_at ?? '',
        alert.assigned_to ?? '',
      ]),
    ]
    const csv = rows
      .map((row) => row.map((value) => `\"${String(value).replace(/\\\"/g, '\"\"')}\"`).join(','))
      .join('\\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `trope-alerts-${orgId}.csv`)
    link.click()
    URL.revokeObjectURL(url)
  }

  const postAlertAction = async (alertId: string, action: string, extra?: Record<string, unknown>) => {
    if (!csrfToken) {
      setError('Missing CSRF token. Reload and try again.')
      return
    }
    setPendingAction(`${alertId}:${action}`)
    setError(null)
    setRequestId(null)
    try {
      const response = await fetch(
        `/api/orgs/${encodeURIComponent(orgId)}/alerts/${encodeURIComponent(alertId)}`,
        {
          method: 'POST',
          headers: { 'content-type': 'application/json', 'x-csrf-token': csrfToken },
          body: JSON.stringify({ action, ...extra }),
        }
      )
      if (!response.ok) {
        const reqId = response.headers.get('x-trope-request-id')
        setRequestId(reqId)
        throw new Error('Unable to update alert.')
      }
      await loadAlerts()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update alert.')
    } finally {
      setPendingAction(null)
    }
  }

  if (loading) {
    return <Card className="p-6 text-sm text-slate-600">Loading alerts…</Card>
  }

  if (error && alerts.length === 0) {
    return (
      <Card className="border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
        {error}
        {requestId && (
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-rose-600">
            <span>Request ID: {requestId}</span>
            <button
              onClick={copyRequestId}
              className="rounded-full border border-rose-200 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-rose-600"
            >
              Copy
            </button>
          </div>
        )}
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Alerts</h1>
          <p className="mt-1 text-sm text-slate-600">
            Resolve staleness, failures, and governance risks.
          </p>
        </div>
        <Link
          href={`/dashboard/workspaces/${encodeURIComponent(orgId)}`}
          className="text-sm font-medium text-[color:var(--trope-accent)] hover:text-[color:var(--trope-accent)]/80"
        >
          Back to workspace
        </Link>
      </div>

      {error && (
        <Card className="border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
          {requestId && (
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-rose-600">
              <span>Request ID: {requestId}</span>
              <button
                onClick={copyRequestId}
                className="rounded-full border border-rose-200 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-rose-600"
              >
                Copy
              </button>
            </div>
          )}
        </Card>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm text-slate-500">{filtered.length} alerts</div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="rounded-full border border-slate-200 px-3 py-1.5 text-xs text-slate-600"
          >
            <option value="open">Open</option>
            <option value="snoozed">Snoozed</option>
            <option value="resolved">Resolved</option>
            <option value="all">All</option>
          </select>
          <select
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value)}
            className="rounded-full border border-slate-200 px-3 py-1.5 text-xs text-slate-600"
          >
            <option value="triggered_desc">Most recent</option>
            <option value="severity">Severity</option>
            <option value="status">Status</option>
          </select>
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search alerts"
            className="w-64"
          />
          <Button variant="outline" size="sm" onClick={exportCsv}>
            Export CSV
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-6 text-sm text-slate-500">
            No alerts for this filter. You are in the clear.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeaderCell>Alert</TableHeaderCell>
                  <TableHeaderCell>Workflow</TableHeaderCell>
                  <TableHeaderCell>Severity</TableHeaderCell>
                  <TableHeaderCell>Status</TableHeaderCell>
                  <TableHeaderCell>Triggered</TableHeaderCell>
                  <TableHeaderCell className="text-right">Actions</TableHeaderCell>
                </TableRow>
              </TableHead>
              <tbody>
                {filtered.map((alert) => (
                  <TableRow key={alert.alert_id}>
                    <TableCell>
                      <div className="text-sm font-semibold text-slate-900">{alert.title}</div>
                      <div className="text-xs text-slate-500">{alert.description}</div>
                      {alert.assigned_to && (
                        <div className="mt-2 text-xs text-slate-500">
                          Assigned to {memberMap[alert.assigned_to] ?? alert.assigned_to}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-slate-700">
                        {workflowMap[alert.workflow_id] ?? alert.workflow_id}
                      </div>
                      <div className="text-xs text-slate-400">{alert.workflow_id}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={severityVariant(alert.severity)}>{alert.severity}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(alert.status)}>{alert.status}</Badge>
                    </TableCell>
                    <TableCell>
                      {formatDateTime(alert.last_triggered_at)}
                      {alert.snoozed_until && (
                        <div className="text-xs text-slate-400">
                          Snoozed until {formatDateTime(alert.snoozed_until)}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {currentUserId && alert.assigned_to !== currentUserId && (
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={pendingAction !== null}
                            onClick={() =>
                              postAlertAction(alert.alert_id, 'assign', {
                                assigned_to: currentUserId,
                                note: currentUserEmail ? `Assigned to ${currentUserEmail}` : undefined,
                              })
                            }
                          >
                            Assign to me
                          </Button>
                        )}
                        {alert.assigned_to && currentUserId === alert.assigned_to && (
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={pendingAction !== null}
                            onClick={() =>
                              postAlertAction(alert.alert_id, 'assign', { assigned_to: '' })
                            }
                          >
                            Clear
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={pendingAction !== null}
                          onClick={() => postAlertAction(alert.alert_id, 'snooze', { snooze_hours: 24 })}
                        >
                          Snooze
                        </Button>
                        {alert.status !== 'resolved' ? (
                          <Button
                            variant="secondary"
                            size="sm"
                            disabled={pendingAction !== null}
                            onClick={() => postAlertAction(alert.alert_id, 'resolve')}
                          >
                            Resolve
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={pendingAction !== null}
                            onClick={() => postAlertAction(alert.alert_id, 'reopen')}
                          >
                            Reopen
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </tbody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  )
}

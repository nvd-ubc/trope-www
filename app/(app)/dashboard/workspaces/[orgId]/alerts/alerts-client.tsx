'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { BellRing, CheckCheck, Copy, MoreHorizontal, Search, UserMinus, UserPlus } from 'lucide-react'
import Badge from '@/components/ui/badge'
import Button from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'
import Card from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from '@/components/ui/input-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from '@/components/ui/table'
import { useCsrfToken } from '@/lib/client/use-csrf-token'
import { DataTableSkeleton, DataToolbar, EmptyState, ErrorNotice, PageHeader } from '@/components/dashboard'

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
  if (!value) return '-'
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

  const copyToClipboard = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value)
    } catch {
      // ignore clipboard failures
    }
  }

  if (loading) {
    return <DataTableSkeleton rows={7} columns={7} />
  }

  if (error && alerts.length === 0) {
    return (
      <ErrorNotice
        title="Unable to load alerts"
        message={error}
        requestId={requestId}
        onCopyRequestId={() => copyRequestId()}
      />
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Alerts"
        description="Resolve staleness, failures, and governance risks."
        backHref={`/dashboard/workspaces/${encodeURIComponent(orgId)}`}
        backLabel="Back to workspace"
      />

      {error && (
        <ErrorNotice
          title="Alerts data is partially unavailable"
          message={error}
          requestId={requestId}
          onCopyRequestId={() => copyRequestId()}
        />
      )}

      <DataToolbar
        summary={`${filtered.length} alerts`}
        filters={
          <>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger size="sm" className="min-w-[8.5rem]">
              <SelectValue placeholder="Open" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="snoozed">Snoozed</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="all">All</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger size="sm" className="min-w-[10rem]">
              <SelectValue placeholder="Most recent" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="triggered_desc">Most recent</SelectItem>
              <SelectItem value="severity">Severity</SelectItem>
              <SelectItem value="status">Status</SelectItem>
            </SelectContent>
          </Select>
          <InputGroup className="w-64">
            <InputGroupAddon>
              <InputGroupText>
                <Search />
              </InputGroupText>
            </InputGroupAddon>
            <InputGroupInput
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search alerts"
            />
          </InputGroup>
          </>
        }
        actions={
          <ButtonGroup>
            <Button variant="outline" size="sm" onClick={exportCsv}>
              Export CSV
            </Button>
          </ButtonGroup>
        }
      />

      <Card className="overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title="No alerts for this filter"
              description="You are in the clear."
              className="py-8"
            />
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
                  <TableHeaderCell className="w-[3rem] text-right">Actions</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((alert) => (
                  <TableRow key={alert.alert_id}>
                    <TableCell>
                      <div className="text-sm font-semibold text-foreground">{alert.title}</div>
                      <div className="text-xs text-muted-foreground">{alert.description}</div>
                      {alert.assigned_to && (
                        <div className="mt-2 text-xs text-muted-foreground">
                          Assigned to {memberMap[alert.assigned_to] ?? alert.assigned_to}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-foreground">
                        {workflowMap[alert.workflow_id] ?? alert.workflow_id}
                      </div>
                      <div className="text-xs text-muted-foreground">{alert.workflow_id}</div>
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
                        <div className="text-xs text-muted-foreground">
                          Snoozed until {formatDateTime(alert.snoozed_until)}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label="Alert actions"
                            disabled={pendingAction !== null}
                          >
                            <MoreHorizontal />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onSelect={(event) => {
                              event.preventDefault()
                              void copyToClipboard(alert.alert_id)
                            }}
                          >
                            <Copy />
                            Copy alert ID
                          </DropdownMenuItem>
                          {currentUserId && alert.assigned_to !== currentUserId && (
                            <DropdownMenuItem
                              onSelect={(event) => {
                                event.preventDefault()
                                void postAlertAction(alert.alert_id, 'assign', {
                                  assigned_to: currentUserId,
                                  note: currentUserEmail ? `Assigned to ${currentUserEmail}` : undefined,
                                })
                              }}
                            >
                              <UserPlus />
                              Assign to me
                            </DropdownMenuItem>
                          )}
                          {alert.assigned_to && currentUserId === alert.assigned_to && (
                            <DropdownMenuItem
                              onSelect={(event) => {
                                event.preventDefault()
                                void postAlertAction(alert.alert_id, 'assign', { assigned_to: '' })
                              }}
                            >
                              <UserMinus />
                              Clear assignee
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onSelect={(event) => {
                              event.preventDefault()
                              void postAlertAction(alert.alert_id, 'snooze', { snooze_hours: 24 })
                            }}
                          >
                            <BellRing />
                            Snooze 24 hours
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {alert.status !== 'resolved' ? (
                            <DropdownMenuItem
                              onSelect={(event) => {
                                event.preventDefault()
                                void postAlertAction(alert.alert_id, 'resolve')
                              }}
                            >
                              <CheckCheck />
                              Resolve alert
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              onSelect={(event) => {
                                event.preventDefault()
                                void postAlertAction(alert.alert_id, 'reopen')
                              }}
                            >
                              <BellRing />
                              Reopen alert
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  )
}

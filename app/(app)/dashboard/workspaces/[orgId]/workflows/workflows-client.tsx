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

type WorkflowDefinition = {
  org_id: string
  workflow_id: string
  title: string
  status: string
  created_at: string
  updated_at: string
  latest_version_id?: string | null
  source?: string | null
  last_run_at?: string | null
  last_success_at?: string | null
  health_state?: string | null
  success_rate_7d?: number | null
  run_stats_7d?: {
    total: number
    success: number
    failed: number
    canceled: number
  } | null
  metrics_7d?: {
    views: number
    guided_starts: number
    guided_completions: number
  } | null
  expected_run_cadence?: string | null
  expected_run_cadence_days?: number | null
  review_cadence_days?: number | null
  last_reviewed_at?: string | null
  criticality?: string | null
  owner_user_id?: string | null
  maintainer_user_ids?: string[] | null
  contexts?: string[] | null
  required?: boolean | null
}

type WorkflowListResponse = {
  workflows: WorkflowDefinition[]
}

type WorkflowVersion = {
  version_id: string
  created_at: string
  created_by?: string
  steps_count?: number | null
}

type WorkflowDetailResponse = {
  workflow: WorkflowDefinition
  latest_version?: WorkflowVersion | null
}

type OrgProfileResponse = {
  membership?: { role: string }
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

const formatDate = (value?: string) => {
  if (!value) return 'Unknown'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

const statusVariant = (status?: string | null) => {
  const normalized = (status ?? 'unknown').toLowerCase()
  if (normalized === 'published') return 'success'
  if (normalized === 'draft') return 'warning'
  if (normalized === 'review') return 'info'
  if (normalized === 'archived') return 'neutral'
  return 'neutral'
}

const healthVariant = (health?: string | null) => {
  const normalized = (health ?? 'unknown').toLowerCase()
  if (normalized === 'healthy') return 'success'
  if (normalized === 'warning') return 'warning'
  if (normalized === 'failing') return 'danger'
  return 'neutral'
}

const formatStatus = (status?: string | null) => {
  if (!status) return 'Unknown'
  return status.replace(/_/g, ' ')
}

const formatSource = (source?: string | null) => {
  if (!source) return '-'
  if (source === 'share') return 'Imported'
  return source.replace(/_/g, ' ')
}

const resolveCadenceDays = (cadence?: string | null, customDays?: number | null) => {
  const normalized = (cadence ?? '').trim().toLowerCase()
  if (!normalized || normalized === 'on_demand') return null
  if (normalized === 'daily') return 1
  if (normalized === 'weekly') return 7
  if (normalized === 'monthly') return 30
  if (normalized === 'custom') {
    return typeof customDays === 'number' && customDays > 0 ? customDays : null
  }
  const numeric = Number.parseInt(normalized, 10)
  if (Number.isFinite(numeric) && numeric > 0) return numeric
  return typeof customDays === 'number' && customDays > 0 ? customDays : null
}

const formatMemberLabel = (member: MemberRecord) => {
  if (member.display_name && member.email) {
    return `${member.display_name} (${member.email})`
  }
  if (member.display_name) return member.display_name
  if (member.email) return member.email
  return member.user_id
}

export default function WorkflowsClient({ orgId }: { orgId: string }) {
  const router = useRouter()
  const { token: csrfToken } = useCsrfToken()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [requestId, setRequestId] = useState<string | null>(null)
  const [workflows, setWorkflows] = useState<WorkflowDefinition[]>([])
  const [latestVersions, setLatestVersions] = useState<Record<string, WorkflowVersion | null>>({})
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [healthFilter, setHealthFilter] = useState('all')
  const [viewFilter, setViewFilter] = useState('all')
  const [sortBy, setSortBy] = useState('updated_desc')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [bulkAction, setBulkAction] = useState('')
  const [bulkOwner, setBulkOwner] = useState('')
  const [bulkCadence, setBulkCadence] = useState('on_demand')
  const [bulkCadenceDays, setBulkCadenceDays] = useState('')
  const [bulkReviewDays, setBulkReviewDays] = useState('')
  const [bulkPending, setBulkPending] = useState(false)
  const [bulkError, setBulkError] = useState<string | null>(null)
  const [bulkRequestId, setBulkRequestId] = useState<string | null>(null)
  const [membershipRole, setMembershipRole] = useState<string | null>(null)
  const [members, setMembers] = useState<MemberRecord[]>([])

  const isAdmin = membershipRole === 'org_owner' || membershipRole === 'org_admin'

  const copyRequestId = async () => {
    if (!requestId) return
    try {
      await navigator.clipboard.writeText(requestId)
    } catch {
      // ignore
    }
  }

  const loadWorkflows = useCallback(async () => {
    setRequestId(null)
    const [workflowRes, orgRes] = await Promise.all([
      fetch(`/api/orgs/${encodeURIComponent(orgId)}/workflows`, { cache: 'no-store' }),
      fetch(`/api/orgs/${encodeURIComponent(orgId)}`, { cache: 'no-store' }),
    ])

    if (workflowRes.status === 401 || orgRes.status === 401) {
      router.replace(`/signin?next=/dashboard/workspaces/${encodeURIComponent(orgId)}/workflows`)
      return
    }

    const fallbackRequestId =
      workflowRes.headers.get('x-trope-request-id') || orgRes.headers.get('x-trope-request-id')

    const workflowPayload = (await workflowRes.json().catch(() => null)) as WorkflowListResponse | null
    const orgPayload = (await orgRes.json().catch(() => null)) as OrgProfileResponse | null
    if (!workflowRes.ok || !workflowPayload) {
      setRequestId(fallbackRequestId)
      throw new Error('Unable to load workflows.')
    }

    const list = workflowPayload.workflows ?? []
    setWorkflows(list)
    setMembershipRole(orgPayload?.membership?.role ?? null)

    if (orgPayload?.membership?.role === 'org_owner' || orgPayload?.membership?.role === 'org_admin') {
      const membersRes = await fetch(`/api/orgs/${encodeURIComponent(orgId)}/members`, {
        cache: 'no-store',
      })
      if (membersRes.ok) {
        const membersPayload = (await membersRes.json().catch(() => null)) as MembersResponse | null
        setMembers(membersPayload?.members ?? [])
      }
    } else {
      setMembers([])
    }

    const details = await Promise.all(
      list.map(async (workflow) => {
        try {
          const detailResponse = await fetch(
            `/api/orgs/${encodeURIComponent(orgId)}/workflows/${encodeURIComponent(workflow.workflow_id)}`,
            { cache: 'no-store' }
          )
          if (!detailResponse.ok) {
            return { workflowId: workflow.workflow_id, latest: null }
          }
          const detail = (await detailResponse.json().catch(() => null)) as
            | WorkflowDetailResponse
            | null
          return {
            workflowId: workflow.workflow_id,
            latest: detail?.latest_version ?? null,
          }
        } catch {
          return { workflowId: workflow.workflow_id, latest: null }
        }
      })
    )

    const latestMap: Record<string, WorkflowVersion | null> = {}
    for (const entry of details) {
      latestMap[entry.workflowId] = entry.latest
    }
    setLatestVersions(latestMap)
  }, [orgId, router])

  useEffect(() => {
    let active = true
    const run = async () => {
      try {
        await loadWorkflows()
        if (!active) return
        setLoading(false)
      } catch (err) {
        if (!active) return
        setError(err instanceof Error ? err.message : 'Unable to load workflows.')
        setLoading(false)
      }
    }
    run()
    return () => {
      active = false
    }
  }, [loadWorkflows])

  useEffect(() => {
    setSelectedIds([])
  }, [query, statusFilter, healthFilter, viewFilter])

  const memberMap = useMemo(() => {
    const map: Record<string, string> = {}
    for (const member of members) {
      map[member.user_id] = formatMemberLabel(member)
    }
    return map
  }, [members])

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    const status = statusFilter.toLowerCase()
    const health = healthFilter.toLowerCase()
    const filteredList = workflows.filter((workflow) => {
      if (status !== 'all' && workflow.status.toLowerCase() !== status) {
        return false
      }
      const workflowHealth = (workflow.health_state ?? 'unknown').toLowerCase()
      if (health !== 'all' && workflowHealth !== health) {
        return false
      }
      if (viewFilter === 'needs-review') {
        if (!workflow.review_cadence_days) return false
        if (!workflow.last_reviewed_at) return true
        const lastReviewed = new Date(workflow.last_reviewed_at)
        if (Number.isNaN(lastReviewed.getTime())) return true
        const due = new Date(lastReviewed)
        due.setUTCDate(due.getUTCDate() + workflow.review_cadence_days)
        if (Date.now() <= due.getTime()) return false
      }
      if (viewFilter === 'overdue') {
        const cadenceDays = resolveCadenceDays(
          workflow.expected_run_cadence,
          workflow.expected_run_cadence_days
        )
        if (!cadenceDays) return false
        if (!workflow.last_success_at) return true
        const lastSuccess = new Date(workflow.last_success_at)
        if (Number.isNaN(lastSuccess.getTime())) return true
        const due = new Date(lastSuccess)
        due.setUTCDate(due.getUTCDate() + cadenceDays)
        if (Date.now() <= due.getTime()) return false
      }
      if (viewFilter === 'failing' && workflowHealth !== 'failing') return false
      if (viewFilter === 'unowned' && workflow.owner_user_id) return false
      if (viewFilter === 'critical' && workflow.criticality !== 'high') return false
      if (normalized) {
        return (
          workflow.title.toLowerCase().includes(normalized) ||
          workflow.workflow_id.toLowerCase().includes(normalized)
        )
      }
      return true
    })

    const sorted = [...filteredList]
    sorted.sort((a, b) => {
      if (sortBy === 'title_asc') {
        return a.title.localeCompare(b.title)
      }
      if (sortBy === 'last_success_desc') {
        return (new Date(b.last_success_at ?? 0).getTime() || 0) - (new Date(a.last_success_at ?? 0).getTime() || 0)
      }
      if (sortBy === 'runs_desc') {
        return (b.run_stats_7d?.total ?? 0) - (a.run_stats_7d?.total ?? 0)
      }
      if (sortBy === 'health') {
        const order = { failing: 0, warning: 1, healthy: 2, unknown: 3 } as Record<string, number>
        const aVal = order[(a.health_state ?? 'unknown').toLowerCase()] ?? 3
        const bVal = order[(b.health_state ?? 'unknown').toLowerCase()] ?? 3
        return aVal - bVal
      }
      return (new Date(b.updated_at).getTime() || 0) - (new Date(a.updated_at).getTime() || 0)
    })

    return sorted
  }, [workflows, query, statusFilter, healthFilter, viewFilter, sortBy])

  const allSelected = filtered.length > 0 && selectedIds.length === filtered.length

  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filtered.map((workflow) => workflow.workflow_id))
    } else {
      setSelectedIds([])
    }
  }

  const toggleSelected = (workflowId: string) => {
    setSelectedIds((prev) =>
      prev.includes(workflowId)
        ? prev.filter((value) => value !== workflowId)
        : [...prev, workflowId]
    )
  }

  const applyBulkAction = async () => {
    if (!csrfToken) {
      setBulkError('Missing CSRF token. Reload and try again.')
      return
    }
    if (!isAdmin) {
      setBulkError('Admin access is required for bulk actions.')
      return
    }
    if (!bulkAction || selectedIds.length === 0) return

    setBulkPending(true)
    setBulkError(null)
    setBulkRequestId(null)

    try {
      for (const workflowId of selectedIds) {
        if (bulkAction === 'archive') {
          const response = await fetch(
            `/api/orgs/${encodeURIComponent(orgId)}/workflows/${encodeURIComponent(workflowId)}`,
            { method: 'DELETE', headers: { 'x-csrf-token': csrfToken } }
          )
          if (!response.ok) {
            setBulkRequestId(response.headers.get('x-trope-request-id'))
            throw new Error('Failed to archive workflows.')
          }
          continue
        }

        let payload: Record<string, unknown> = {}
        if (bulkAction === 'owner') {
          payload = { owner_user_id: bulkOwner || null }
        } else if (bulkAction === 'cadence') {
          const cadenceDaysValue = Number.parseInt(bulkCadenceDays, 10)
          payload = {
            expected_run_cadence: bulkCadence,
            expected_run_cadence_days:
              bulkCadence === 'custom' && Number.isFinite(cadenceDaysValue) && cadenceDaysValue > 0
                ? cadenceDaysValue
                : null,
          }
        } else if (bulkAction === 'review') {
          const reviewValue = Number.parseInt(bulkReviewDays, 10)
          payload = {
            review_cadence_days: Number.isFinite(reviewValue) && reviewValue > 0 ? reviewValue : null,
          }
        }

        const response = await fetch(
          `/api/orgs/${encodeURIComponent(orgId)}/workflows/${encodeURIComponent(workflowId)}`,
          {
            method: 'PATCH',
            headers: {
              'content-type': 'application/json',
              'x-csrf-token': csrfToken,
            },
            body: JSON.stringify(payload),
          }
        )
        if (!response.ok) {
          setBulkRequestId(response.headers.get('x-trope-request-id'))
          throw new Error('Failed to update workflows.')
        }
      }

      await loadWorkflows()
      setSelectedIds([])
      setBulkAction('')
      setBulkOwner('')
      setBulkCadence('on_demand')
      setBulkCadenceDays('')
      setBulkReviewDays('')
    } catch (err) {
      setBulkError(err instanceof Error ? err.message : 'Bulk update failed.')
    } finally {
      setBulkPending(false)
    }
  }

  const exportCsv = () => {
    const rows = [
      [
        'workflow_id',
        'title',
        'status',
        'health',
        'last_success_at',
        'runs_7d',
        'success_rate_7d',
        'review_due',
        'owner',
        'required',
        'views_7d',
      ],
      ...filtered.map((workflow) => {
        let reviewDue = ''
        if (workflow.review_cadence_days && workflow.last_reviewed_at) {
          const lastReviewed = new Date(workflow.last_reviewed_at)
          if (!Number.isNaN(lastReviewed.getTime())) {
            const due = new Date(lastReviewed)
            due.setUTCDate(due.getUTCDate() + workflow.review_cadence_days)
            reviewDue = due.toISOString()
          }
        }
        return [
          workflow.workflow_id,
          workflow.title,
          workflow.status,
          workflow.health_state ?? 'unknown',
          workflow.last_success_at ?? '',
          String(workflow.run_stats_7d?.total ?? 0),
          typeof workflow.success_rate_7d === 'number' ? String(workflow.success_rate_7d) : '',
          reviewDue,
          workflow.owner_user_id ?? '',
          workflow.required ? 'true' : 'false',
          String(workflow.metrics_7d?.views ?? 0),
        ]
      }),
    ]
    const csv = rows
      .map((row) => row.map((value) => `"${String(value).replace(/\"/g, '""')}"`).join(','))
      .join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `trope-workflows-${orgId}.csv`)
    link.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return <Card className="p-6 text-sm text-slate-600">Loading workflows…</Card>
  }

  if (error && workflows.length === 0) {
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
          <h1 className="text-2xl font-semibold text-slate-900">Workflows</h1>
          <p className="mt-1 text-sm text-slate-600">
            Browse the SOP library for this workspace.
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
        <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
          {filtered.length} workflows
          <Badge variant="neutral">{statusFilter}</Badge>
          <Badge variant="neutral">{healthFilter}</Badge>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={viewFilter}
            onChange={(event) => setViewFilter(event.target.value)}
            className="rounded-full border border-slate-200 px-3 py-1.5 text-xs text-slate-600"
          >
            <option value="all">All workflows</option>
            <option value="needs-review">Needs review</option>
            <option value="overdue">Overdue runs</option>
            <option value="failing">Failing</option>
            <option value="unowned">Unowned</option>
            <option value="critical">Critical</option>
          </select>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="rounded-full border border-slate-200 px-3 py-1.5 text-xs text-slate-600"
          >
            <option value="all">All statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="review">Review</option>
            <option value="archived">Archived</option>
          </select>
          <select
            value={healthFilter}
            onChange={(event) => setHealthFilter(event.target.value)}
            className="rounded-full border border-slate-200 px-3 py-1.5 text-xs text-slate-600"
          >
            <option value="all">All health</option>
            <option value="healthy">Healthy</option>
            <option value="warning">Warning</option>
            <option value="failing">Failing</option>
            <option value="unknown">Unknown</option>
          </select>
          <select
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value)}
            className="rounded-full border border-slate-200 px-3 py-1.5 text-xs text-slate-600"
          >
            <option value="updated_desc">Newest updated</option>
            <option value="title_asc">Title A-Z</option>
            <option value="last_success_desc">Last success</option>
            <option value="runs_desc">Runs (7d)</option>
            <option value="health">Health</option>
          </select>
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by title or ID"
            className="w-64"
          />
          <Button variant="outline" size="sm" onClick={exportCsv}>
            Export CSV
          </Button>
        </div>
      </div>

      {selectedIds.length > 0 && (
        <Card className="border-slate-200 bg-slate-50 p-4">
          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
            <div className="font-semibold text-slate-800">
              {selectedIds.length} selected
            </div>
            <select
              value={bulkAction}
              onChange={(event) => setBulkAction(event.target.value)}
              className="rounded-full border border-slate-200 px-3 py-1.5 text-xs text-slate-600"
              disabled={!isAdmin}
            >
              <option value="">Bulk actions</option>
              <option value="owner">Set owner</option>
              <option value="cadence">Set run cadence</option>
              <option value="review">Set review cadence</option>
              <option value="archive">Archive</option>
            </select>
            {bulkAction === 'owner' && (
              <select
                value={bulkOwner}
                onChange={(event) => setBulkOwner(event.target.value)}
                className="rounded-full border border-slate-200 px-3 py-1.5 text-xs text-slate-600"
                disabled={!isAdmin}
              >
                <option value="">Unassigned</option>
                {members.map((member) => (
                  <option key={member.user_id} value={member.user_id}>
                    {formatMemberLabel(member)}
                  </option>
                ))}
              </select>
            )}
            {bulkAction === 'cadence' && (
              <>
                <select
                  value={bulkCadence}
                  onChange={(event) => setBulkCadence(event.target.value)}
                  className="rounded-full border border-slate-200 px-3 py-1.5 text-xs text-slate-600"
                  disabled={!isAdmin}
                >
                  <option value="on_demand">On demand</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="custom">Custom</option>
                </select>
                {bulkCadence === 'custom' && (
                  <Input
                    value={bulkCadenceDays}
                    onChange={(event) => setBulkCadenceDays(event.target.value)}
                    placeholder="Days"
                    className="w-24"
                  />
                )}
              </>
            )}
            {bulkAction === 'review' && (
              <Input
                value={bulkReviewDays}
                onChange={(event) => setBulkReviewDays(event.target.value)}
                placeholder="Review days"
                className="w-28"
              />
            )}
            <Button
              variant="primary"
              size="sm"
              disabled={!bulkAction || bulkPending || !isAdmin}
              onClick={applyBulkAction}
            >
              {bulkPending ? 'Applying…' : 'Apply'}
            </Button>
            {!isAdmin && (
              <span className="text-xs text-amber-600">Admin access required.</span>
            )}
          </div>
          {bulkError && (
            <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
              {bulkError}
              {bulkRequestId && (
                <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-rose-600">
                  <span>Request ID: {bulkRequestId}</span>
                  <button
                    onClick={() => navigator.clipboard.writeText(bulkRequestId)}
                    className="rounded-full border border-rose-200 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-rose-600"
                  >
                    Copy
                  </button>
                </div>
              )}
            </div>
          )}
        </Card>
      )}

      <Card className="overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-6 text-sm text-slate-500">
            <p>No workflows yet. Publish a guide from the desktop app to populate the library.</p>
            <div className="mt-3 flex flex-wrap gap-3 text-xs">
              <Link className="rounded-full border border-slate-200 px-3 py-1 text-slate-600" href="/download">
                Download desktop app
              </Link>
              <Link className="rounded-full border border-slate-200 px-3 py-1 text-slate-600" href="/get-started">
                Getting started
              </Link>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeaderCell>
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={(event) => toggleSelectAll(event.target.checked)}
                      className="h-4 w-4"
                    />
                  </TableHeaderCell>
                  <TableHeaderCell>Workflow</TableHeaderCell>
                  <TableHeaderCell>Status</TableHeaderCell>
                  <TableHeaderCell>Health</TableHeaderCell>
                  <TableHeaderCell>Owner</TableHeaderCell>
                  <TableHeaderCell>Review due</TableHeaderCell>
                  <TableHeaderCell>Last success</TableHeaderCell>
                  <TableHeaderCell>Runs (7d)</TableHeaderCell>
                </TableRow>
              </TableHead>
              <tbody>
                {filtered.map((workflow) => {
                  const latest = latestVersions[workflow.workflow_id]
                  const runStats = workflow.run_stats_7d
                  const successRate =
                    typeof workflow.success_rate_7d === 'number'
                      ? `${Math.round(workflow.success_rate_7d * 100)}%`
                      : '-'
                  let reviewDue = '-'
                  if (workflow.review_cadence_days && workflow.last_reviewed_at) {
                    const lastReviewed = new Date(workflow.last_reviewed_at)
                    if (!Number.isNaN(lastReviewed.getTime())) {
                      const due = new Date(lastReviewed)
                      due.setUTCDate(due.getUTCDate() + workflow.review_cadence_days)
                      reviewDue = formatDate(due.toISOString())
                    }
                  }
                  const ownerLabel = workflow.owner_user_id
                    ? memberMap[workflow.owner_user_id] ?? workflow.owner_user_id
                    : 'Unassigned'
                  return (
                    <TableRow key={workflow.workflow_id}>
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(workflow.workflow_id)}
                          onChange={() => toggleSelected(workflow.workflow_id)}
                          className="h-4 w-4"
                        />
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/dashboard/workspaces/${encodeURIComponent(orgId)}/workflows/${encodeURIComponent(
                            workflow.workflow_id
                          )}`}
                          className="text-sm font-semibold text-slate-900 hover:text-[color:var(--trope-accent)]"
                        >
                          {workflow.title || workflow.workflow_id}
                        </Link>
                        <div className="text-xs text-slate-500">{workflow.workflow_id}</div>
                        {workflow.contexts && workflow.contexts.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {workflow.contexts.slice(0, 2).map((context) => (
                              <span
                                key={context}
                                className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-500"
                              >
                                {context}
                              </span>
                            ))}
                            {workflow.contexts.length > 2 && (
                              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-500">
                                +{workflow.contexts.length - 2}
                              </span>
                            )}
                          </div>
                        )}
                        <div className="mt-2 text-[11px] text-slate-500">
                          Source: {formatSource(workflow.source)} · Views 7d: {workflow.metrics_7d?.views ?? 0}
                        </div>
                        {latest?.version_id && (
                          <div className="text-[11px] text-slate-400">Latest version: {latest.version_id}</div>
                        )}
                        {latest?.steps_count !== undefined && (
                          <div className="text-[11px] text-slate-400">Steps: {latest.steps_count}</div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusVariant(workflow.status)}>{formatStatus(workflow.status)}</Badge>
                        {workflow.required && (
                          <div className="mt-2">
                            <Badge variant="warning">Required</Badge>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={healthVariant(workflow.health_state ?? undefined)}>
                          {workflow.health_state ?? 'unknown'}
                        </Badge>
                      </TableCell>
                      <TableCell>{ownerLabel}</TableCell>
                      <TableCell>{reviewDue}</TableCell>
                      <TableCell>{formatDate(workflow.last_success_at ?? undefined)}</TableCell>
                      <TableCell>
                        <div className="text-sm text-slate-700">{runStats?.total ?? '-'}</div>
                        <div className="text-xs text-slate-400">Success {successRate}</div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </tbody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  )
}

'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Copy, ExternalLink, MoreHorizontal, Search } from 'lucide-react'
import Badge from '@/components/ui/badge'
import Button from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'
import Card from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import { DataToolbar, EmptyState, ErrorNotice, PageHeader } from '@/components/dashboard'

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

const toTitleCase = (value?: string | null) => {
  if (!value) return 'Unknown'
  return value
    .replace(/[_-]+/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
    .join(' ')
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
  return toTitleCase(status)
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

  const copyToClipboard = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value)
    } catch {
      // ignore clipboard failures
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

  const activeFilters = useMemo(() => {
    const filters: string[] = []
    if (viewFilter !== 'all') filters.push(`View: ${toTitleCase(viewFilter)}`)
    if (statusFilter !== 'all') filters.push(`Status: ${toTitleCase(statusFilter)}`)
    if (healthFilter !== 'all') filters.push(`Health: ${toTitleCase(healthFilter)}`)
    return filters
  }, [healthFilter, statusFilter, viewFilter])

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
    return <Card className="p-6 text-sm text-muted-foreground">Loading workflows…</Card>
  }

  if (error && workflows.length === 0) {
    return (
      <ErrorNotice
        title="Unable to load workflows"
        message={error}
        requestId={requestId}
        onCopyRequestId={() => copyRequestId()}
      />
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Workflows"
        description="Browse the SOP library for this workspace."
        backHref={`/dashboard/workspaces/${encodeURIComponent(orgId)}`}
        backLabel="Back to workspace"
      />

      {error && (
        <ErrorNotice
          title="Workflow data is partially unavailable"
          message={error}
          requestId={requestId}
          onCopyRequestId={() => copyRequestId()}
        />
      )}

      <DataToolbar
        summary={
          <div className="flex flex-wrap items-center gap-2">
            <span>
              {filtered.length} workflow{filtered.length === 1 ? '' : 's'}
            </span>
            {activeFilters.map((filter) => (
              <Badge key={filter} variant="outline">
                {filter}
              </Badge>
            ))}
          </div>
        }
        filters={
          <>
          <Select value={viewFilter} onValueChange={setViewFilter}>
            <SelectTrigger size="sm" className="min-w-[11rem]">
              <SelectValue placeholder="All workflows" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All workflows</SelectItem>
              <SelectItem value="needs-review">Needs review</SelectItem>
              <SelectItem value="overdue">Overdue runs</SelectItem>
              <SelectItem value="failing">Failing</SelectItem>
              <SelectItem value="unowned">Unowned</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger size="sm" className="min-w-[9.5rem]">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="review">Review</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
          <Select value={healthFilter} onValueChange={setHealthFilter}>
            <SelectTrigger size="sm" className="min-w-[8.5rem]">
              <SelectValue placeholder="All health" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All health</SelectItem>
              <SelectItem value="healthy">Healthy</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
              <SelectItem value="failing">Failing</SelectItem>
              <SelectItem value="unknown">Unknown</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger size="sm" className="min-w-[11rem]">
              <SelectValue placeholder="Newest updated" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="updated_desc">Newest updated</SelectItem>
              <SelectItem value="title_asc">Title A-Z</SelectItem>
              <SelectItem value="last_success_desc">Last success</SelectItem>
              <SelectItem value="runs_desc">Runs (7d)</SelectItem>
              <SelectItem value="health">Health</SelectItem>
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
              placeholder="Search by title or ID"
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

      {selectedIds.length > 0 && (
        <Card className="border-border bg-muted/40 p-4">
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <div className="font-semibold text-foreground">
              {selectedIds.length} selected
            </div>
            <Select
              value={bulkAction || '__bulk_action_none'}
              onValueChange={(value) => setBulkAction(value === '__bulk_action_none' ? '' : value)}
              disabled={!isAdmin}
            >
              <SelectTrigger size="sm" className="min-w-[10rem]">
                <SelectValue placeholder="Bulk actions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__bulk_action_none">Bulk actions</SelectItem>
                <SelectItem value="owner">Set owner</SelectItem>
                <SelectItem value="cadence">Set run cadence</SelectItem>
                <SelectItem value="review">Set review cadence</SelectItem>
                <SelectItem value="archive">Archive</SelectItem>
              </SelectContent>
            </Select>
            {bulkAction === 'owner' && (
              <Select
                value={bulkOwner || '__bulk_owner_unassigned'}
                onValueChange={(value) => setBulkOwner(value === '__bulk_owner_unassigned' ? '' : value)}
                disabled={!isAdmin}
              >
                <SelectTrigger size="sm" className="min-w-[11rem]">
                  <SelectValue placeholder="Unassigned" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__bulk_owner_unassigned">Unassigned</SelectItem>
                  {members.map((member) => (
                    <SelectItem key={member.user_id} value={member.user_id}>
                      {formatMemberLabel(member)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {bulkAction === 'cadence' && (
              <>
                <Select
                  value={bulkCadence}
                  onValueChange={setBulkCadence}
                  disabled={!isAdmin}
                >
                  <SelectTrigger size="sm" className="min-w-[10rem]">
                    <SelectValue placeholder="On demand" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="on_demand">On demand</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
                {bulkCadence === 'custom' && (
                  <InputGroup className="w-24">
                    <InputGroupInput
                      value={bulkCadenceDays}
                      onChange={(event) => setBulkCadenceDays(event.target.value)}
                      placeholder="Days"
                    />
                  </InputGroup>
                )}
              </>
            )}
            {bulkAction === 'review' && (
              <InputGroup className="w-28">
                <InputGroupInput
                  value={bulkReviewDays}
                  onChange={(event) => setBulkReviewDays(event.target.value)}
                  placeholder="Review days"
                />
              </InputGroup>
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
            <div className="mt-3 rounded-xl border border-destructive/20 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {bulkError}
              {bulkRequestId && (
                <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-destructive/80">
                  <span>Request ID: {bulkRequestId}</span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-6 px-2 text-[10px] uppercase tracking-wide"
                    onClick={() => void copyToClipboard(bulkRequestId)}
                  >
                    Copy
                  </Button>
                </div>
              )}
            </div>
          )}
        </Card>
      )}

      <Card className="overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title="No workflows yet"
              description="Publish a guide from the desktop app to populate the library."
              actions={
                <>
                  <Button asChild variant="outline" size="sm">
                    <Link href="/download">Download desktop app</Link>
                  </Button>
                  <Button asChild variant="outline" size="sm">
                    <Link href="/get-started">Getting started</Link>
                  </Button>
                </>
              }
              className="py-10"
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeaderCell>
                    <Checkbox
                      checked={allSelected}
                      onCheckedChange={(checked) => toggleSelectAll(checked === true)}
                    />
                  </TableHeaderCell>
                  <TableHeaderCell>Workflow</TableHeaderCell>
                  <TableHeaderCell>Status</TableHeaderCell>
                  <TableHeaderCell>Health</TableHeaderCell>
                  <TableHeaderCell>Owner</TableHeaderCell>
                  <TableHeaderCell>Review due</TableHeaderCell>
                  <TableHeaderCell>Last success</TableHeaderCell>
                  <TableHeaderCell>Runs (7d)</TableHeaderCell>
                  <TableHeaderCell className="w-[3rem] text-right">Actions</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
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
                        <Checkbox
                          checked={selectedIds.includes(workflow.workflow_id)}
                          onCheckedChange={() => toggleSelected(workflow.workflow_id)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <Link
                            href={`/dashboard/workspaces/${encodeURIComponent(orgId)}/workflows/${encodeURIComponent(
                              workflow.workflow_id
                            )}`}
                            className="block text-sm font-semibold text-foreground hover:text-primary"
                          >
                            {workflow.title || workflow.workflow_id}
                          </Link>
                          <div className="max-w-[30rem] truncate text-xs text-muted-foreground">
                            {workflow.workflow_id}
                          </div>
                          <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
                            <span>{typeof latest?.steps_count === 'number' ? `${latest.steps_count} steps` : 'Steps -'}</span>
                            <span>•</span>
                            <span>Views {workflow.metrics_7d?.views ?? 0}</span>
                            {workflow.contexts && workflow.contexts.length > 0 && (
                              <>
                                <span>•</span>
                                <span className="max-w-[14rem] truncate">{workflow.contexts[0]}</span>
                                {workflow.contexts.length > 1 && <span>+{workflow.contexts.length - 1}</span>}
                              </>
                            )}
                          </div>
                        </div>
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
                          {toTitleCase(workflow.health_state ?? 'unknown')}
                        </Badge>
                      </TableCell>
                      <TableCell>{ownerLabel}</TableCell>
                      <TableCell>{reviewDue}</TableCell>
                      <TableCell>{formatDate(workflow.last_success_at ?? undefined)}</TableCell>
                      <TableCell>
                        <div className="text-sm text-foreground">{runStats?.total ?? '-'}</div>
                        <div className="text-xs text-muted-foreground">Success {successRate}</div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon-sm" aria-label="Workflow actions">
                              <MoreHorizontal />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onSelect={(event) => {
                                event.preventDefault()
                                void copyToClipboard(workflow.workflow_id)
                              }}
                            >
                              <Copy />
                              Copy workflow ID
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link
                                href={`/dashboard/workspaces/${encodeURIComponent(orgId)}/workflows/${encodeURIComponent(
                                  workflow.workflow_id
                                )}`}
                              >
                                <ExternalLink />
                                Open workflow
                              </Link>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  )
}

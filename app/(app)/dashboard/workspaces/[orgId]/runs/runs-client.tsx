'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Badge from '@/components/ui/badge'
import Button from '@/components/ui/button'
import Card from '@/components/ui/card'
import Input from '@/components/ui/input'
import { Table, TableCell, TableHead, TableHeaderCell, TableRow } from '@/components/ui/table'

type WorkflowRun = {
  org_id: string
  workflow_id: string
  run_id: string
  version_id?: string | null
  status: string
  started_at: string
  finished_at?: string | null
  duration_ms?: number | null
  actor_user_id: string
  actor_email?: string | null
  client?: string | null
  error_summary?: string | null
  steps_total?: number | null
  steps_completed?: number | null
}

type RunListResponse = {
  runs: WorkflowRun[]
  next_cursor?: string | null
}

type WorkflowDefinition = {
  workflow_id: string
  title: string
}

type WorkflowListResponse = {
  workflows: WorkflowDefinition[]
}

const formatDateTime = (value?: string | null) => {
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

const formatDuration = (ms?: number | null) => {
  if (!ms || ms <= 0) return '—'
  const seconds = Math.round(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  if (minutes <= 0) return `${seconds}s`
  const remaining = seconds % 60
  return `${minutes}m ${remaining}s`
}

const statusVariant = (status?: string | null) => {
  const normalized = (status ?? '').toLowerCase()
  if (normalized === 'success') return 'success'
  if (normalized === 'failed') return 'danger'
  if (normalized === 'canceled') return 'warning'
  return 'neutral'
}

export default function RunsClient({ orgId }: { orgId: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [requestId, setRequestId] = useState<string | null>(null)
  const [runs, setRuns] = useState<WorkflowRun[]>([])
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [workflowMap, setWorkflowMap] = useState<Record<string, string>>({})
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const workflowFromUrl = searchParams.get('workflow_id') ?? ''
  const [workflowFilter, setWorkflowFilter] = useState(workflowFromUrl)
  const [sortBy, setSortBy] = useState('started_desc')

  const copyRequestId = async () => {
    if (!requestId) return
    try {
      await navigator.clipboard.writeText(requestId)
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    if (workflowFromUrl !== workflowFilter) {
      setWorkflowFilter(workflowFromUrl)
    }
  }, [workflowFromUrl, workflowFilter])

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

  const loadRuns = useCallback(
    async (cursor?: string, append = false) => {
      const queryParams = new URLSearchParams()
      queryParams.set('limit', '25')
      if (workflowFilter) queryParams.set('workflow_id', workflowFilter)
      if (cursor) queryParams.set('cursor', cursor)
      const response = await fetch(
        `/api/orgs/${encodeURIComponent(orgId)}/runs?${queryParams.toString()}`,
        { cache: 'no-store' }
      )

      if (response.status === 401) {
        router.replace(`/signin?next=/dashboard/workspaces/${encodeURIComponent(orgId)}/runs`)
        return
      }

      const payload = (await response.json().catch(() => null)) as RunListResponse | null
      if (!response.ok || !payload) {
        setRequestId(response.headers.get('x-trope-request-id'))
        throw new Error('Unable to load runs.')
      }
      setRuns((prev) => (append ? [...prev, ...(payload.runs ?? [])] : payload.runs ?? []))
      setNextCursor(payload.next_cursor ?? null)
    },
    [orgId, router, workflowFilter]
  )

  useEffect(() => {
    let active = true
    const run = async () => {
      try {
        await Promise.all([loadRuns(), loadWorkflows()])
        if (!active) return
        setLoading(false)
      } catch (err) {
        if (!active) return
        setError(err instanceof Error ? err.message : 'Unable to load runs.')
        setLoading(false)
      }
    }
    run()
    return () => {
      active = false
    }
  }, [loadRuns, loadWorkflows])

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    const status = statusFilter.toLowerCase()
    const filteredList = runs.filter((run) => {
      if (status !== 'all' && run.status.toLowerCase() !== status) {
        return false
      }
      if (!normalized) return true
      const title = workflowMap[run.workflow_id] ?? run.workflow_id
      return (
        title.toLowerCase().includes(normalized) ||
        run.workflow_id.toLowerCase().includes(normalized) ||
        run.run_id.toLowerCase().includes(normalized)
      )
    })

    const sorted = [...filteredList]
    sorted.sort((a, b) => {
      if (sortBy === 'started_asc') {
        return new Date(a.started_at).getTime() - new Date(b.started_at).getTime()
      }
      if (sortBy === 'duration_desc') {
        return (b.duration_ms ?? 0) - (a.duration_ms ?? 0)
      }
      if (sortBy === 'status') {
        return a.status.localeCompare(b.status)
      }
      return new Date(b.started_at).getTime() - new Date(a.started_at).getTime()
    })

    return sorted
  }, [runs, query, statusFilter, workflowMap, sortBy])

  const handleLoadMore = async () => {
    if (!nextCursor) return
    setLoadingMore(true)
    setError(null)
    setRequestId(null)
    try {
      await loadRuns(nextCursor, true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load runs.')
    } finally {
      setLoadingMore(false)
    }
  }

  const exportCsv = () => {
    const rows = [
      [
        'run_id',
        'workflow_id',
        'workflow_title',
        'status',
        'started_at',
        'finished_at',
        'duration_ms',
        'actor',
        'client',
      ],
      ...filtered.map((run) => [
        run.run_id,
        run.workflow_id,
        workflowMap[run.workflow_id] ?? '',
        run.status,
        run.started_at,
        run.finished_at ?? '',
        run.duration_ms?.toString() ?? '',
        run.actor_email ?? run.actor_user_id,
        run.client ?? '',
      ]),
    ]
    const csv = rows.map((row) => row.map((value) => `"${String(value).replace(/\"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `trope-runs-${orgId}.csv`)
    link.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <Card className="p-6 text-sm text-slate-600">
        Loading runs…
      </Card>
    )
  }

  if (error && runs.length === 0) {
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
          <h1 className="text-2xl font-semibold text-slate-900">Runs</h1>
          <p className="mt-1 text-sm text-slate-600">
            Recent guided executions across this workspace.
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
        <div className="text-sm text-slate-500">{filtered.length} runs</div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="rounded-full border border-slate-200 px-3 py-1.5 text-xs text-slate-600"
          >
            <option value="all">All statuses</option>
            <option value="success">Success</option>
            <option value="failed">Failed</option>
            <option value="canceled">Canceled</option>
          </select>
          <select
            value={workflowFilter}
            onChange={(event) => setWorkflowFilter(event.target.value)}
            className="rounded-full border border-slate-200 px-3 py-1.5 text-xs text-slate-600"
          >
            <option value="">All workflows</option>
            {Object.entries(workflowMap)
              .sort((a, b) => a[1].localeCompare(b[1]))
              .map(([id, title]) => (
                <option key={id} value={id}>
                  {title || id}
                </option>
              ))}
          </select>
          <select
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value)}
            className="rounded-full border border-slate-200 px-3 py-1.5 text-xs text-slate-600"
          >
            <option value="started_desc">Newest start</option>
            <option value="started_asc">Oldest start</option>
            <option value="duration_desc">Longest duration</option>
            <option value="status">Status A–Z</option>
          </select>
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search workflow or run ID"
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
            No runs yet. Start a guided workflow from the desktop app to populate this list.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeaderCell>Workflow</TableHeaderCell>
                  <TableHeaderCell>Status</TableHeaderCell>
                  <TableHeaderCell>Started</TableHeaderCell>
                  <TableHeaderCell>Duration</TableHeaderCell>
                  <TableHeaderCell>Actor</TableHeaderCell>
                  <TableHeaderCell>Client</TableHeaderCell>
                  <TableHeaderCell>Error</TableHeaderCell>
                </TableRow>
              </TableHead>
              <tbody>
                {filtered.map((run) => (
                  <TableRow key={run.run_id}>
                    <TableCell>
                      <div className="text-sm font-semibold text-slate-900">
                        {workflowMap[run.workflow_id] ?? run.workflow_id}
                      </div>
                      <div className="text-xs text-slate-500">{run.workflow_id}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(run.status)}>
                        {run.status || 'unknown'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-slate-700">{formatDateTime(run.started_at)}</div>
                      <div className="text-xs text-slate-400">{run.run_id}</div>
                    </TableCell>
                    <TableCell>{formatDuration(run.duration_ms)}</TableCell>
                    <TableCell>
                      {run.actor_email ?? run.actor_user_id}
                    </TableCell>
                    <TableCell>{run.client ?? '—'}</TableCell>
                    <TableCell>{run.error_summary ?? '—'}</TableCell>
                  </TableRow>
                ))}
              </tbody>
            </Table>
          </div>
        )}
      </Card>

      {nextCursor && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            size="md"
            onClick={handleLoadMore}
            disabled={loadingMore}
          >
            {loadingMore ? 'Loading…' : 'Load more'}
          </Button>
        </div>
      )}
    </div>
  )
}

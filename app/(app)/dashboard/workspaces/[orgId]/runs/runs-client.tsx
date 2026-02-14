'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Copy, Filter, MoreHorizontal, Search, Workflow } from 'lucide-react'
import Badge from '@/components/ui/badge'
import Button from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'
import Card from '@/components/ui/card'
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
import { DataTableSkeleton, DataToolbar, EmptyState, ErrorNotice, PageHeader } from '@/components/dashboard'

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
  if (!ms || ms <= 0) return '-'
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

  const copyToClipboard = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value)
    } catch {
      // ignore clipboard failures
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
    return <DataTableSkeleton rows={8} columns={8} />
  }

  if (error && runs.length === 0) {
    return (
      <ErrorNotice
        title="Unable to load runs"
        message={error}
        requestId={requestId}
        onCopyRequestId={() => copyRequestId()}
      />
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Runs"
        description="Recent guided executions across this workspace."
        backHref={`/dashboard/workspaces/${encodeURIComponent(orgId)}`}
        backLabel="Back to workspace"
      />

      {error && (
        <ErrorNotice
          title="Runs data is partially unavailable"
          message={error}
          requestId={requestId}
          onCopyRequestId={() => copyRequestId()}
        />
      )}

      <DataToolbar
        summary={`${filtered.length} runs`}
        filters={
          <>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger size="sm" className="min-w-[9.75rem]">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="success">Success</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="canceled">Canceled</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={workflowFilter || '__all_workflows'}
            onValueChange={(value) => setWorkflowFilter(value === '__all_workflows' ? '' : value)}
          >
            <SelectTrigger size="sm" className="min-w-[11rem]">
              <SelectValue placeholder="All workflows" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all_workflows">All workflows</SelectItem>
              {Object.entries(workflowMap)
                .sort((a, b) => a[1].localeCompare(b[1]))
                .map(([id, title]) => (
                  <SelectItem key={id} value={id}>
                    {title || id}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger size="sm" className="min-w-[10rem]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="started_desc">Newest start</SelectItem>
              <SelectItem value="started_asc">Oldest start</SelectItem>
              <SelectItem value="duration_desc">Longest duration</SelectItem>
              <SelectItem value="status">Status A-Z</SelectItem>
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
              placeholder="Search workflow or run ID"
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
              title="No runs for this filter"
              description="Start a guided workflow from the desktop app to populate this list."
              className="py-8"
            />
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
                  <TableHeaderCell className="w-[3rem] text-right">Actions</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((run) => (
                  <TableRow key={run.run_id}>
                    <TableCell>
                      <div className="text-sm font-semibold text-foreground">
                        {workflowMap[run.workflow_id] ?? run.workflow_id}
                      </div>
                      <div className="text-xs text-muted-foreground">{run.workflow_id}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(run.status)}>
                        {run.status || 'unknown'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-foreground">{formatDateTime(run.started_at)}</div>
                      <div className="text-xs text-muted-foreground">{run.run_id}</div>
                    </TableCell>
                    <TableCell>{formatDuration(run.duration_ms)}</TableCell>
                    <TableCell>
                      {run.actor_email ?? run.actor_user_id}
                    </TableCell>
                    <TableCell>{run.client ?? '-'}</TableCell>
                    <TableCell>{run.error_summary ?? '-'}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon-sm" aria-label="Run actions">
                            <MoreHorizontal />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onSelect={(event) => {
                              event.preventDefault()
                              void copyToClipboard(run.run_id)
                            }}
                          >
                            <Copy />
                            Copy run ID
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onSelect={(event) => {
                              event.preventDefault()
                              void copyToClipboard(run.workflow_id)
                            }}
                          >
                            <Copy />
                            Copy workflow ID
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onSelect={(event) => {
                              event.preventDefault()
                              router.push(
                                `/dashboard/workspaces/${encodeURIComponent(
                                  orgId
                                )}/runs?workflow_id=${encodeURIComponent(run.workflow_id)}`
                              )
                            }}
                          >
                            <Filter />
                            Filter to this workflow
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onSelect={(event) => {
                              event.preventDefault()
                              router.push(
                                `/dashboard/workspaces/${encodeURIComponent(
                                  orgId
                                )}/workflows/${encodeURIComponent(run.workflow_id)}`
                              )
                            }}
                          >
                            <Workflow />
                            Open workflow
                          </DropdownMenuItem>
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

'use client'

import { Fragment, useCallback, useEffect, useMemo, useState } from 'react'
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
import { DataTableSkeleton, DataToolbar, EmptyState, ErrorNotice, MetricCard, PageHeader } from '@/components/dashboard'
import {
  formatMetricMap,
  formatTokenSummary,
  normalizeStepMetricsPayload,
  summarizeStepInsights,
  type RunStepMetricsResponse,
  type WorkflowRunStepMetricsPayload,
} from '@/lib/workflow-run-step-metrics'
import { aggregateRunLifecycle, computeDurationPercentileMs } from '@/lib/workflow-run-lifecycle'

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
  run_stats_7d?: {
    total: number
    success: number
    failed: number
    canceled: number
  } | null
  metrics_7d?: {
    guided_starts: number
    guided_completions: number
  } | null
}

type WorkflowListResponse = {
  workflows: WorkflowDefinition[]
}

type RunsBootstrapResponse = {
  runs?: RunListResponse | null
  workflows?: WorkflowListResponse | null
  error?: string
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

const formatPercent = (value?: number | null) => {
  if (typeof value !== 'number' || Number.isNaN(value)) return '-'
  return `${Math.round(value * 100)}%`
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
  const [workflowDefinitions, setWorkflowDefinitions] = useState<Record<string, WorkflowDefinition>>({})
  const [expandedRunIds, setExpandedRunIds] = useState<string[]>([])
  const [runStepDetails, setRunStepDetails] = useState<Record<string, WorkflowRunStepMetricsPayload>>(
    {}
  )
  const [runStepLoading, setRunStepLoading] = useState<Record<string, boolean>>({})
  const [runStepErrors, setRunStepErrors] = useState<Record<string, string | null>>({})
  const [runStepRequestIds, setRunStepRequestIds] = useState<Record<string, string | null>>({})
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
        const queryParams = new URLSearchParams()
        queryParams.set('limit', '25')
        if (workflowFilter) {
          queryParams.set('workflow_id', workflowFilter)
        }

        const response = await fetch(
          `/api/orgs/${encodeURIComponent(orgId)}/runs/bootstrap?${queryParams.toString()}`,
          { cache: 'no-store' }
        )

        if (response.status === 401) {
          router.replace(`/signin?next=/dashboard/workspaces/${encodeURIComponent(orgId)}/runs`)
          return
        }

        const payload = (await response.json().catch(() => null)) as RunsBootstrapResponse | null
        if (!response.ok || !payload?.runs) {
          setRequestId(response.headers.get('x-trope-request-id'))
          throw new Error('Unable to load runs.')
        }

        const workflowLookup: Record<string, string> = {}
        const workflowDetails: Record<string, WorkflowDefinition> = {}
        for (const workflow of payload.workflows?.workflows ?? []) {
          workflowLookup[workflow.workflow_id] = workflow.title
          workflowDetails[workflow.workflow_id] = workflow
        }
        if (!active) return
        setWorkflowMap(workflowLookup)
        setWorkflowDefinitions(workflowDetails)
        setRuns(payload.runs.runs ?? [])
        setNextCursor(payload.runs.next_cursor ?? null)
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
  }, [orgId, router, workflowFilter])

  useEffect(() => {
    const runIds = new Set(runs.map((run) => run.run_id))
    setExpandedRunIds((prev) => prev.filter((runId) => runIds.has(runId)))
  }, [runs])

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

  const lifecycleSummary = useMemo(() => {
    if (workflowFilter) {
      const selected = workflowDefinitions[workflowFilter]
      if (!selected) {
        return aggregateRunLifecycle([])
      }
      return aggregateRunLifecycle([selected])
    }
    return aggregateRunLifecycle(Object.values(workflowDefinitions))
  }, [workflowDefinitions, workflowFilter])

  const durationP95 = useMemo(
    () => computeDurationPercentileMs(filtered, 0.95),
    [filtered]
  )

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

  const loadRunStepDetails = async (run: WorkflowRun) => {
    setRunStepLoading((prev) => ({ ...prev, [run.run_id]: true }))
    setRunStepErrors((prev) => ({ ...prev, [run.run_id]: null }))
    setRunStepRequestIds((prev) => ({ ...prev, [run.run_id]: null }))

    try {
      const response = await fetch(
        `/api/orgs/${encodeURIComponent(orgId)}/workflows/${encodeURIComponent(
          run.workflow_id
        )}/runs/${encodeURIComponent(run.run_id)}/steps`,
        { cache: 'no-store' }
      )
      if (response.status === 401) {
        router.replace(`/signin?next=/dashboard/workspaces/${encodeURIComponent(orgId)}/runs`)
        return
      }

      const payload = (await response.json().catch(() => null)) as RunStepMetricsResponse | null
      if (!response.ok || !payload) {
        setRunStepRequestIds((prev) => ({
          ...prev,
          [run.run_id]: response.headers.get('x-trope-request-id'),
        }))
        throw new Error(payload?.message || payload?.error || 'Unable to load run step detail.')
      }

      setRunStepDetails((prev) => ({
        ...prev,
        [run.run_id]: normalizeStepMetricsPayload(payload.step_metrics),
      }))
    } catch (err) {
      setRunStepErrors((prev) => ({
        ...prev,
        [run.run_id]: err instanceof Error ? err.message : 'Unable to load run step detail.',
      }))
    } finally {
      setRunStepLoading((prev) => ({ ...prev, [run.run_id]: false }))
    }
  }

  const toggleRunDetails = async (run: WorkflowRun) => {
    const isExpanded = expandedRunIds.includes(run.run_id)
    if (isExpanded) {
      setExpandedRunIds((prev) => prev.filter((value) => value !== run.run_id))
      return
    }
    setExpandedRunIds((prev) => (prev.includes(run.run_id) ? prev : [...prev, run.run_id]))
    if (runStepDetails[run.run_id] || runStepLoading[run.run_id]) return
    await loadRunStepDetails(run)
  }

  const expandedRunIdSet = new Set(expandedRunIds)

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
      <div className="space-y-6">
        <PageHeader
          title="Runs"
          description="Recent guided executions across this workspace."
          backHref={`/dashboard/workspaces/${encodeURIComponent(orgId)}`}
          backLabel="Back to workspace"
        />
        <DataTableSkeleton rows={8} columns={8} />
      </div>
    )
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

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Run attempts (7d)"
          value={lifecycleSummary.attempted}
          helper={workflowFilter ? 'Selected workflow' : 'Workspace total'}
        />
        <MetricCard
          label="Runs completed (7d)"
          value={lifecycleSummary.completed}
          helper={`${lifecycleSummary.success} success · ${lifecycleSummary.failed} failed · ${lifecycleSummary.canceled} canceled`}
        />
        <MetricCard
          label="Attempt to complete"
          value={formatPercent(lifecycleSummary.completionRate)}
          helper="Completed / attempted"
        />
        <MetricCard
          label="Duration p95 (loaded)"
          value={formatDuration(durationP95)}
          helper={`${filtered.length} runs in current view`}
        />
      </div>

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
                  <TableHeaderCell>Details</TableHeaderCell>
                  <TableHeaderCell className="w-[3rem] text-right">Actions</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((run) => {
                  const isExpanded = expandedRunIdSet.has(run.run_id)
                  const loadingStepDetail = runStepLoading[run.run_id] === true
                  const stepError = runStepErrors[run.run_id]
                  const stepRequestId = runStepRequestIds[run.run_id]
                  const stepMetrics = runStepDetails[run.run_id]
                  const sortedSteps = [...(stepMetrics?.steps ?? [])].sort((left, right) => {
                    if (left.step_index !== right.step_index) return left.step_index - right.step_index
                    return left.step_id.localeCompare(right.step_id)
                  })
                  const stepInsights = summarizeStepInsights(sortedSteps, formatDuration)

                  return (
                    <Fragment key={run.run_id}>
                      <TableRow>
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
                        <TableCell>{run.actor_email ?? run.actor_user_id}</TableCell>
                        <TableCell>{run.client ?? '-'}</TableCell>
                        <TableCell>{run.error_summary ?? '-'}</TableCell>
                        <TableCell>
                          <Button
                            type="button"
                            variant="ghost"
                            size="xs"
                            onClick={() => void toggleRunDetails(run)}
                          >
                            {isExpanded ? 'Hide details' : 'View details'}
                          </Button>
                        </TableCell>
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
                      {isExpanded && (
                        <TableRow>
                          <TableCell colSpan={9} className="bg-muted/20 px-3 py-3 align-top whitespace-normal">
                            {loadingStepDetail && (
                              <div className="text-xs text-muted-foreground">Loading step metrics…</div>
                            )}
                            {!loadingStepDetail && stepError && (
                              <div className="rounded-xl border border-destructive/20 bg-destructive/10 px-3 py-3 text-xs text-destructive">
                                <div>{stepError}</div>
                                <div className="mt-2 flex flex-wrap items-center gap-2">
                                  {stepRequestId && (
                                    <>
                                      <span className="text-destructive/80">Request ID: {stepRequestId}</span>
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="xs"
                                        onClick={() => void copyToClipboard(stepRequestId)}
                                      >
                                        Copy
                                      </Button>
                                    </>
                                  )}
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="xs"
                                    onClick={() => void loadRunStepDetails(run)}
                                  >
                                    Retry
                                  </Button>
                                </div>
                              </div>
                            )}
                            {!loadingStepDetail && !stepError && stepMetrics && (
                              <div className="space-y-3">
                                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                  <Badge variant="neutral">Step metrics {stepMetrics.version || 'v2'}</Badge>
                                  <span>Run tokens: {formatTokenSummary(stepMetrics.totals)}</span>
                                  <span>Steps captured: {sortedSteps.length}</span>
                                </div>
                                {stepInsights.length > 0 && (
                                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                    {stepInsights.map((insight) => (
                                      <Badge key={`${run.run_id}:${insight}`} variant="outline">
                                        {insight}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                                {sortedSteps.length === 0 ? (
                                  <div className="text-xs text-muted-foreground">
                                    No step-level metrics captured for this run.
                                  </div>
                                ) : (
                                  <div className="overflow-x-auto">
                                    <Table className="min-w-[1080px]">
                                      <TableHead>
                                        <TableRow>
                                          <TableHeaderCell>Step</TableHeaderCell>
                                          <TableHeaderCell>Timing</TableHeaderCell>
                                          <TableHeaderCell>Completion</TableHeaderCell>
                                          <TableHeaderCell>Guidance</TableHeaderCell>
                                          <TableHeaderCell>Alignment</TableHeaderCell>
                                          <TableHeaderCell>Highlight</TableHeaderCell>
                                          <TableHeaderCell>Tokens</TableHeaderCell>
                                        </TableRow>
                                      </TableHead>
                                      <TableBody>
                                        {sortedSteps.map((step) => (
                                          <TableRow key={`${run.run_id}:${step.step_index}:${step.step_id}`}>
                                            <TableCell className="whitespace-normal">
                                              <div className="font-medium text-foreground">#{step.step_index + 1}</div>
                                              <div className="font-mono text-xs text-muted-foreground">
                                                {step.step_id}
                                              </div>
                                            </TableCell>
                                            <TableCell className="text-xs text-muted-foreground whitespace-normal">
                                              <div>Started: {formatDateTime(step.started_at)}</div>
                                              <div>Completed: {formatDateTime(step.completed_at ?? null)}</div>
                                              <div>Duration: {formatDuration(step.duration_ms)}</div>
                                            </TableCell>
                                            <TableCell className="text-xs text-muted-foreground whitespace-normal">
                                              <div>Method: {step.completion_method ?? '-'}</div>
                                              <div>Reason: {step.completion_reason_code ?? '-'}</div>
                                            </TableCell>
                                            <TableCell className="text-xs text-muted-foreground whitespace-normal">
                                              <div>
                                                Req/Res/No: {step.guidance?.requests ?? 0}/
                                                {step.guidance?.results ?? 0}/{step.guidance?.no_result ?? 0}
                                              </div>
                                              <div>Latency: {formatMetricMap(step.guidance?.latency_ms_buckets)}</div>
                                              <div>Reasons: {formatMetricMap(step.guidance?.reason_counts)}</div>
                                            </TableCell>
                                            <TableCell className="text-xs text-muted-foreground whitespace-normal">
                                              <div>
                                                Req/Res: {step.alignment?.requests ?? 0}/
                                                {step.alignment?.results ?? 0}
                                              </div>
                                              <div>Latency: {formatMetricMap(step.alignment?.latency_ms_buckets)}</div>
                                              <div>Reasons: {formatMetricMap(step.alignment?.reason_counts)}</div>
                                            </TableCell>
                                            <TableCell className="text-xs text-muted-foreground whitespace-normal">
                                              <div>
                                                Shown/Hit/Miss: {step.highlight?.shown ?? 0}/
                                                {step.highlight?.click_hit ?? 0}/{step.highlight?.click_miss ?? 0}
                                              </div>
                                              <div>Distance: {formatMetricMap(step.highlight?.distance_buckets)}</div>
                                            </TableCell>
                                            <TableCell className="text-xs text-muted-foreground whitespace-normal">
                                              {formatTokenSummary(step.tokens)}
                                            </TableCell>
                                          </TableRow>
                                        ))}
                                      </TableBody>
                                    </Table>
                                  </div>
                                )}
                              </div>
                            )}
                            {!loadingStepDetail && !stepError && !stepMetrics && (
                              <div className="text-xs text-muted-foreground">
                                Step detail unavailable for this run.
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      )}
                    </Fragment>
                  )
                })}
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

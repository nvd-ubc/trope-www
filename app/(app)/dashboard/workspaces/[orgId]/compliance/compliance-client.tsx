'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ExternalLink, MoreHorizontal, Search, Users } from 'lucide-react'
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

type OrgProfile = {
  org_id: string
  name: string
  run_retention_days?: number | null
}

type OrgProfileResponse = {
  org: OrgProfile
}

type WorkflowDefinition = {
  workflow_id: string
  title: string
  status?: string | null
  required?: boolean | null
}

type WorkflowListResponse = {
  workflows: WorkflowDefinition[]
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

type RunRecord = {
  run_id: string
  workflow_id: string
  status: string
  started_at: string
  finished_at?: string | null
  actor_user_id?: string | null
}

type RunsResponse = {
  runs: RunRecord[]
  next_cursor?: string | null
}

type ComplianceBootstrapResponse = {
  org?: OrgProfileResponse | null
  workflows?: WorkflowListResponse | null
  members?: MembersResponse | null
  error?: string
}

type WorkflowCompletion = {
  workflow: WorkflowDefinition
  successByUser: Record<string, string>
  latestSuccessAt?: string | null
}

const formatDate = (value?: string | null) => {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
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

const statusVariant = (status?: string | null) => {
  const normalized = (status ?? '').toLowerCase()
  if (normalized === 'published') return 'success'
  if (normalized === 'review') return 'info'
  if (normalized === 'archived') return 'warning'
  return 'neutral'
}

export default function ComplianceClient({ orgId }: { orgId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [loadingRuns, setLoadingRuns] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [requestId, setRequestId] = useState<string | null>(null)
  const [org, setOrg] = useState<OrgProfile | null>(null)
  const [workflows, setWorkflows] = useState<WorkflowDefinition[]>([])
  const [members, setMembers] = useState<MemberRecord[]>([])
  const [completionByWorkflow, setCompletionByWorkflow] = useState<Record<string, WorkflowCompletion>>({})
  const [selectedWorkflowId, setSelectedWorkflowId] = useState('all')
  const [query, setQuery] = useState('')

  const activeMembers = useMemo(
    () => members.filter((member) => member.status === 'active'),
    [members]
  )
  const requiredWorkflows = useMemo(
    () => workflows.filter((workflow) => workflow.required),
    [workflows]
  )

  const lookbackDays = org?.run_retention_days && org.run_retention_days > 0 ? org.run_retention_days : 90
  const lookbackEpoch = useMemo(() => {
    const date = new Date()
    date.setUTCDate(date.getUTCDate() - lookbackDays)
    return date.getTime()
  }, [lookbackDays])

  useEffect(() => {
    let active = true
    const load = async () => {
      try {
        setLoading(true)
        setError(null)
        setRequestId(null)

        const response = await fetch(`/api/orgs/${encodeURIComponent(orgId)}/compliance/bootstrap`, {
          cache: 'no-store',
        })

        if (response.status === 401) {
          router.replace(`/signin?next=/dashboard/workspaces/${encodeURIComponent(orgId)}/compliance`)
          return
        }

        const payload = (await response.json().catch(() => null)) as ComplianceBootstrapResponse | null
        if (!response.ok || !payload?.org) {
          setRequestId(response.headers.get('x-trope-request-id'))
          throw new Error('Unable to load compliance data.')
        }

        if (!active) return
        setOrg(payload.org.org)
        setWorkflows(payload.workflows?.workflows ?? [])
        setMembers(payload.members?.members ?? [])
        setLoading(false)
      } catch (err) {
        if (!active) return
        setError(err instanceof Error ? err.message : 'Unable to load compliance data.')
        setLoading(false)
      }
    }

    load()
    return () => {
      active = false
    }
  }, [orgId, router])

  useEffect(() => {
    let active = true

    const loadRuns = async () => {
      if (requiredWorkflows.length === 0) {
        setCompletionByWorkflow({})
        return
      }

      setLoadingRuns(true)
      setError(null)
      setRequestId(null)

      const nextCompletion: Record<string, WorkflowCompletion> = {}

      const fetchCompletion = async (workflow: WorkflowDefinition) => {
        let cursor: string | null = null
        let pages = 0
        const maxPages = 10
        const successByUser: Record<string, string> = {}
        let latestSuccessAt: string | null = null

        while (pages < maxPages) {
          const params = new URLSearchParams({
            workflow_id: workflow.workflow_id,
            limit: '100',
          })
          if (cursor) params.set('cursor', cursor)

          const response = await fetch(
            `/api/orgs/${encodeURIComponent(orgId)}/runs?${params.toString()}`,
            { cache: 'no-store' }
          )

          if (response.status === 401) {
            router.replace(`/signin?next=/dashboard/workspaces/${encodeURIComponent(orgId)}/compliance`)
            return { successByUser, latestSuccessAt }
          }

          const payload = (await response.json().catch(() => null)) as RunsResponse | null

          if (!response.ok || !payload) {
            setRequestId(response.headers.get('x-trope-request-id'))
            throw new Error('Unable to load run history.')
          }

          const runs = payload.runs ?? []
          for (const run of runs) {
            if (run.status !== 'success') continue
            if (!run.actor_user_id) continue
            const timestamp = run.finished_at ?? run.started_at
            if (!timestamp) continue
            const timeValue = new Date(timestamp).getTime()
            if (Number.isNaN(timeValue) || timeValue < lookbackEpoch) continue

            const existing = successByUser[run.actor_user_id]
            if (!existing || new Date(existing).getTime() < timeValue) {
              successByUser[run.actor_user_id] = timestamp
            }
            if (!latestSuccessAt || new Date(latestSuccessAt).getTime() < timeValue) {
              latestSuccessAt = timestamp
            }
          }

          if (!payload.next_cursor) break

          const lastRun = runs[runs.length - 1]
          if (lastRun) {
            const lastTimestamp = lastRun.started_at ?? lastRun.finished_at
            if (lastTimestamp) {
              const lastTimeValue = new Date(lastTimestamp).getTime()
              if (!Number.isNaN(lastTimeValue) && lastTimeValue < lookbackEpoch) {
                break
              }
            }
          }

          cursor = payload.next_cursor ?? null
          pages += 1
        }

        return { successByUser, latestSuccessAt }
      }

      try {
        for (const workflow of requiredWorkflows) {
          const completion = await fetchCompletion(workflow)
          if (!active) return
          nextCompletion[workflow.workflow_id] = {
            workflow,
            successByUser: completion.successByUser,
            latestSuccessAt: completion.latestSuccessAt,
          }
        }
        if (!active) return
        setCompletionByWorkflow(nextCompletion)
      } catch (err) {
        if (!active) return
        setError(err instanceof Error ? err.message : 'Unable to load run history.')
      } finally {
        if (active) setLoadingRuns(false)
      }
    }

    loadRuns()
    return () => {
      active = false
    }
  }, [lookbackEpoch, orgId, requiredWorkflows, router])

  const summaryRows = useMemo(() => {
    return requiredWorkflows.map((workflow) => {
      const completion = completionByWorkflow[workflow.workflow_id]
      const totalMembers = activeMembers.length
      const completedCount = activeMembers.reduce((sum, member) => {
        return completion?.successByUser[member.user_id] ? sum + 1 : sum
      }, 0)
      const completionRate = totalMembers > 0 ? Math.round((completedCount / totalMembers) * 100) : 0

      return {
        workflow,
        completedCount,
        totalMembers,
        completionRate,
        latestSuccessAt: completion?.latestSuccessAt ?? null,
      }
    })
  }, [activeMembers, completionByWorkflow, requiredWorkflows])

  const selectedWorkflow = useMemo(() => {
    if (selectedWorkflowId === 'all') return null
    return requiredWorkflows.find((workflow) => workflow.workflow_id === selectedWorkflowId) ?? null
  }, [requiredWorkflows, selectedWorkflowId])

  const memberRows = useMemo(() => {
    if (!selectedWorkflow) return []
    const completion = completionByWorkflow[selectedWorkflow.workflow_id]
    const normalizedQuery = query.trim().toLowerCase()

    return activeMembers
      .map((member) => {
        const lastSuccessAt = completion?.successByUser[member.user_id] ?? null
        const completed = Boolean(lastSuccessAt)
        const name = member.display_name || member.email || member.user_id
        return {
          member,
          name,
          completed,
          lastSuccessAt,
        }
      })
      .filter((row) => {
        if (!normalizedQuery) return true
        return (
          row.name.toLowerCase().includes(normalizedQuery) ||
          (row.member.email ?? '').toLowerCase().includes(normalizedQuery)
        )
      })
  }, [activeMembers, completionByWorkflow, query, selectedWorkflow])

  const exportCsv = () => {
    if (selectedWorkflow) {
      const rows = [
        ['workflow_id', 'workflow_title', 'member_id', 'member_name', 'email', 'status', 'last_success_at'],
        ...memberRows.map((row) => [
          selectedWorkflow.workflow_id,
          selectedWorkflow.title,
          row.member.user_id,
          row.name,
          row.member.email ?? '',
          row.completed ? 'completed' : 'overdue',
          row.lastSuccessAt ?? '',
        ]),
      ]

      const csv = rows
        .map((row) => row.map((value) => `"${String(value).replace(/\"/g, '""')}"`).join(','))
        .join('\n')
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `trope-compliance-${orgId}-${selectedWorkflow.workflow_id}.csv`)
      link.click()
      URL.revokeObjectURL(url)
      return
    }

    const rows = [
      ['workflow_id', 'workflow_title', 'status', 'required', 'completed_members', 'total_members', 'completion_rate', 'latest_success_at'],
      ...summaryRows.map((row) => [
        row.workflow.workflow_id,
        row.workflow.title,
        row.workflow.status ?? '',
        row.workflow.required ? 'true' : 'false',
        String(row.completedCount),
        String(row.totalMembers),
        `${row.completionRate}%`,
        row.latestSuccessAt ?? '',
      ]),
    ]

    const csv = rows
      .map((row) => row.map((value) => `"${String(value).replace(/\"/g, '""')}"`).join(','))
      .join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `trope-compliance-${orgId}.csv`)
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
    return (
      <div className="space-y-6">
        <PageHeader
          title="Compliance"
          description={`Track required SOP completion across your workspace. Reporting window: last ${lookbackDays} days.`}
          backHref={`/dashboard/workspaces/${encodeURIComponent(orgId)}`}
          backLabel="Back to workspace"
        />
        <DataTableSkeleton rows={7} columns={8} />
      </div>
    )
  }

  if (error && requiredWorkflows.length === 0) {
    return (
      <ErrorNotice
        title="Unable to load compliance data"
        message={error}
        requestId={requestId}
        onCopyRequestId={() => copyRequestId()}
      />
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Compliance"
        description={`Track required SOP completion across your workspace. Reporting window: last ${lookbackDays} days.`}
        backHref={`/dashboard/workspaces/${encodeURIComponent(orgId)}`}
        backLabel="Back to workspace"
      />

      {error && (
        <ErrorNotice
          title="Compliance data is partially unavailable"
          message={error}
          requestId={requestId}
          onCopyRequestId={() => copyRequestId()}
        />
      )}

      {requiredWorkflows.length === 0 ? (
        <EmptyState
          title="No required workflows yet"
          description="Mark a workflow as required to track completion."
          className="py-10"
        />
      ) : (
        <>
          <DataToolbar
            summary={loadingRuns ? 'Refreshing runs…' : `${requiredWorkflows.length} required workflows`}
            filters={
              <div className="flex flex-wrap items-center gap-2">
              <Select value={selectedWorkflowId} onValueChange={setSelectedWorkflowId}>
                <SelectTrigger size="sm" className="min-w-[13rem]">
                  <SelectValue placeholder="All required workflows" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All required workflows</SelectItem>
                  {requiredWorkflows.map((workflow) => (
                    <SelectItem key={workflow.workflow_id} value={workflow.workflow_id}>
                      {workflow.title || workflow.workflow_id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedWorkflow && (
                <InputGroup className="w-64">
                  <InputGroupAddon>
                    <InputGroupText>
                      <Search />
                    </InputGroupText>
                  </InputGroupAddon>
                  <InputGroupInput
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search members"
                  />
                </InputGroup>
              )}
              </div>
            }
            actions={
              <ButtonGroup>
                <Button variant="outline" size="sm" onClick={exportCsv}>
                  Export CSV
                </Button>
              </ButtonGroup>
            }
          />

          {selectedWorkflow ? (
            <Card className="overflow-hidden">
              <div className="border-b border-border p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="text-sm font-semibold text-foreground">
                      {selectedWorkflow.title || selectedWorkflow.workflow_id}
                    </div>
                    <div className="text-xs text-muted-foreground">{selectedWorkflow.workflow_id}</div>
                  </div>
                  <Badge variant={statusVariant(selectedWorkflow.status)}>
                    {selectedWorkflow.status || 'draft'}
                  </Badge>
                </div>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableHeaderCell>Member</TableHeaderCell>
                      <TableHeaderCell>Role</TableHeaderCell>
                      <TableHeaderCell>Status</TableHeaderCell>
                      <TableHeaderCell>Last success</TableHeaderCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {memberRows.map((row) => (
                      <TableRow key={row.member.user_id}>
                        <TableCell>
                          <div className="text-sm font-semibold text-foreground">{row.name}</div>
                          <div className="text-xs text-muted-foreground">{row.member.email ?? row.member.user_id}</div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {row.member.role.replace('org_', '')}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant={row.completed ? 'success' : 'warning'}>
                            {row.completed ? 'Completed' : 'Overdue'}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDateTime(row.lastSuccessAt)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          ) : (
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableHeaderCell>Workflow</TableHeaderCell>
                      <TableHeaderCell>Status</TableHeaderCell>
                      <TableHeaderCell>Completion</TableHeaderCell>
                      <TableHeaderCell>Latest success</TableHeaderCell>
                      <TableHeaderCell className="w-[3rem] text-right">Action</TableHeaderCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {summaryRows.map((row) => (
                      <TableRow key={row.workflow.workflow_id}>
                        <TableCell>
                          <div className="text-sm font-semibold text-foreground">
                            {row.workflow.title || row.workflow.workflow_id}
                          </div>
                          <div className="text-xs text-muted-foreground">{row.workflow.workflow_id}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusVariant(row.workflow.status)}>
                            {row.workflow.status || 'draft'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-foreground">
                            {row.completedCount}/{row.totalMembers} ({row.completionRate}%)
                          </div>
                        </TableCell>
                        <TableCell>{formatDate(row.latestSuccessAt)}</TableCell>
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
                                  setSelectedWorkflowId(row.workflow.workflow_id)
                                }}
                              >
                                <Users />
                                View completion by member
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onSelect={(event) => {
                                  event.preventDefault()
                                  router.push(
                                    `/dashboard/workspaces/${encodeURIComponent(
                                      orgId
                                    )}/workflows/${encodeURIComponent(row.workflow.workflow_id)}`
                                  )
                                }}
                              >
                                <ExternalLink />
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
            </Card>
          )}
        </>
      )}
    </div>
  )
}

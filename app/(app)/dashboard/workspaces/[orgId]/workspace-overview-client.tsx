'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Badge from '@/components/ui/badge'
import Button from '@/components/ui/button'
import Card from '@/components/ui/card'

type OrgProfile = {
  org_id: string
  name: string
  created_at?: string
  created_by?: string
}

type OrgMembership = {
  org_id: string
  user_id: string
  role: string
  status: string
  created_at: string
}

type OrgProfileResponse = {
  org: OrgProfile
  membership: OrgMembership
}

type WorkflowDefinition = {
  workflow_id: string
  title: string
  status: string
  health_state?: string | null
  run_stats_7d?: {
    total: number
    success: number
    failed: number
    canceled: number
  } | null
  last_success_at?: string | null
  expected_run_cadence?: string | null
  expected_run_cadence_days?: number | null
  review_cadence_days?: number | null
  last_reviewed_at?: string | null
  owner_user_id?: string | null
  criticality?: string | null
  required?: boolean | null
}

type WorkflowListResponse = {
  workflows: WorkflowDefinition[]
}

type WorkflowAlert = {
  alert_id: string
  status: string
  severity: string
  last_triggered_at?: string | null
}

type AlertsResponse = {
  alerts: WorkflowAlert[]
}

const formatDate = (value?: string) => {
  if (!value) return 'Unknown'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
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

export default function WorkspaceOverviewClient({ orgId }: { orgId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [requestId, setRequestId] = useState<string | null>(null)
  const [org, setOrg] = useState<OrgProfile | null>(null)
  const [membership, setMembership] = useState<OrgMembership | null>(null)
  const [workflows, setWorkflows] = useState<WorkflowDefinition[]>([])
  const [alerts, setAlerts] = useState<WorkflowAlert[]>([])

  const copyRequestId = async () => {
    if (!requestId) return
    try {
      await navigator.clipboard.writeText(requestId)
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    let active = true

    const load = async () => {
      try {
        setRequestId(null)
        const [orgRes, workflowsRes, alertsRes] = await Promise.all([
          fetch(`/api/orgs/${encodeURIComponent(orgId)}`, { cache: 'no-store' }),
          fetch(`/api/orgs/${encodeURIComponent(orgId)}/workflows`, { cache: 'no-store' }),
          fetch(`/api/orgs/${encodeURIComponent(orgId)}/alerts?status=open`, { cache: 'no-store' }),
        ])

        if (orgRes.status === 401 || workflowsRes.status === 401 || alertsRes.status === 401) {
          router.replace(`/signin?next=/dashboard/workspaces/${encodeURIComponent(orgId)}`)
          return
        }

        const fallbackRequestId =
          orgRes.headers.get('x-trope-request-id') ||
          workflowsRes.headers.get('x-trope-request-id') ||
          alertsRes.headers.get('x-trope-request-id')

        const orgPayload = (await orgRes.json().catch(() => null)) as OrgProfileResponse | null
        const workflowsPayload = (await workflowsRes.json().catch(() => null)) as WorkflowListResponse | null
        const alertsPayload = (await alertsRes.json().catch(() => null)) as AlertsResponse | null

        if (!orgRes.ok || !orgPayload) {
          setRequestId(fallbackRequestId)
          throw new Error('Unable to load workspace.')
        }

        if (!active) return
        setOrg(orgPayload.org)
        setMembership(orgPayload.membership)
        setWorkflows(workflowsPayload?.workflows ?? [])
        setAlerts(alertsPayload?.alerts ?? [])
        setLoading(false)
      } catch (err) {
        if (!active) return
        setError(err instanceof Error ? err.message : 'Unable to load workspace.')
        setLoading(false)
      }
    }

    load()
    return () => {
      active = false
    }
  }, [orgId, router])

  const summary = useMemo(() => {
    const total = workflows.length
    const published = workflows.filter((workflow) => workflow.status === 'published').length
    const draft = workflows.filter((workflow) => workflow.status === 'draft').length
    const failing = workflows.filter((workflow) => workflow.health_state === 'failing').length
    const warning = workflows.filter((workflow) => workflow.health_state === 'warning').length
    const unowned = workflows.filter((workflow) => !workflow.owner_user_id).length
    const requiredCount = workflows.filter((workflow) => workflow.required).length
    const totalRuns = workflows.reduce((sum, workflow) => sum + (workflow.run_stats_7d?.total ?? 0), 0)
    const totalSuccess = workflows.reduce(
      (sum, workflow) => sum + (workflow.run_stats_7d?.success ?? 0),
      0
    )
    const successRate = totalRuns > 0 ? Math.round((totalSuccess / totalRuns) * 100) : null
    const overdueRuns = workflows.filter((workflow) => {
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
      return Date.now() > due.getTime()
    }).length
    const reviewDue = workflows.filter((workflow) => {
      if (!workflow.review_cadence_days) return false
      if (!workflow.last_reviewed_at) return true
      const lastReviewed = new Date(workflow.last_reviewed_at)
      if (Number.isNaN(lastReviewed.getTime())) return true
      const due = new Date(lastReviewed)
      due.setUTCDate(due.getUTCDate() + workflow.review_cadence_days)
      return Date.now() > due.getTime()
    }).length

    return {
      total,
      published,
      draft,
      failing,
      warning,
      unowned,
      requiredCount,
      totalRuns,
      successRate,
      overdueRuns,
      reviewDue,
      openAlerts: alerts.filter((alert) => alert.status === 'open').length,
    }
  }, [alerts, workflows])

  if (loading) {
    return <Card className="p-6 text-sm text-slate-600">Loading workspace…</Card>
  }

  if (error || !org || !membership) {
    return (
      <Card className="border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
        {error ?? 'Unable to load workspace.'}
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

  const canViewAudit = membership.role === 'org_owner' || membership.role === 'org_admin'

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">{org.name || org.org_id}</h1>
          <p className="mt-1 text-sm text-slate-600">
            Created {formatDate(org.created_at)} · Role {membership.role.replace('org_', '')}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link href={`/dashboard/workspaces/${encodeURIComponent(orgId)}/workflows`}>
            <Button variant="outline" size="sm">Workflows</Button>
          </Link>
          <Link href={`/dashboard/workspaces/${encodeURIComponent(orgId)}/runs`}>
            <Button variant="outline" size="sm">Runs</Button>
          </Link>
          <Link href={`/dashboard/workspaces/${encodeURIComponent(orgId)}/alerts`}>
            <Button variant="outline" size="sm">Alerts</Button>
          </Link>
          <Link href={`/dashboard/workspaces/${encodeURIComponent(orgId)}/compliance`}>
            <Button variant="outline" size="sm">Compliance</Button>
          </Link>
          <Link href={`/dashboard/workspaces/${encodeURIComponent(orgId)}/members`}>
            <Button variant="outline" size="sm">Members</Button>
          </Link>
          {canViewAudit && (
            <Link href={`/dashboard/workspaces/${encodeURIComponent(orgId)}/audit`}>
              <Button variant="outline" size="sm">Audit</Button>
            </Link>
          )}
          <Link href={`/dashboard/workspaces/${encodeURIComponent(orgId)}/settings`}>
            <Button variant="outline" size="sm">Settings</Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">Workflow library</h2>
            <Badge variant="info">{summary.total}</Badge>
          </div>
          <div className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
            <div>
              <div className="text-xs uppercase tracking-wide text-slate-400">Published</div>
              <div className="text-slate-900">{summary.published}</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide text-slate-400">Drafts</div>
              <div className="text-slate-900">{summary.draft}</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide text-slate-400">Unowned</div>
              <div className="text-slate-900">{summary.unowned}</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide text-slate-400">Required</div>
              <div className="text-slate-900">{summary.requiredCount}</div>
            </div>
          </div>
          {summary.requiredCount > 0 && (
            <div className="mt-4">
              <Link href={`/dashboard/workspaces/${encodeURIComponent(orgId)}/compliance`}>
                <Button variant="ghost" size="sm">View compliance</Button>
              </Link>
            </div>
          )}
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">Operational health</h2>
            {summary.failing > 0 ? (
              <Badge variant="danger">{summary.failing} failing</Badge>
            ) : (
              <Badge variant="success">Healthy</Badge>
            )}
          </div>
          <div className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
            <div>
              <div className="text-xs uppercase tracking-wide text-slate-400">Warning</div>
              <div className="text-slate-900">{summary.warning}</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide text-slate-400">Runs (7d)</div>
              <div className="text-slate-900">{summary.totalRuns}</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide text-slate-400">Success rate</div>
              <div className="text-slate-900">{summary.successRate ? `${summary.successRate}%` : '—'}</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide text-slate-400">Overdue runs</div>
              <div className="text-slate-900">{summary.overdueRuns}</div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">Governance</h2>
            <Badge variant={summary.reviewDue > 0 ? 'warning' : 'neutral'}>
              {summary.reviewDue > 0 ? 'Review due' : 'Up to date'}
            </Badge>
          </div>
          <div className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
            <div>
              <div className="text-xs uppercase tracking-wide text-slate-400">Review due</div>
              <div className="text-slate-900">{summary.reviewDue}</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide text-slate-400">Critical workflows</div>
              <div className="text-slate-900">
                {workflows.filter((workflow) => workflow.criticality === 'high').length}
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">Alerts</h2>
            <Badge variant={summary.openAlerts > 0 ? 'warning' : 'success'}>
              {summary.openAlerts > 0 ? `${summary.openAlerts} open` : 'Clear'}
            </Badge>
          </div>
          <div className="mt-4 text-sm text-slate-600">
            Resolve alerts to keep workflows healthy and reviewed.
          </div>
          <div className="mt-4">
            <Link href={`/dashboard/workspaces/${encodeURIComponent(orgId)}/alerts`}>
              <Button variant="secondary" size="sm">Open alerts</Button>
            </Link>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="text-base font-semibold text-slate-900">Workspace summary</h2>
        <div className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-3">
          <div>
            <div className="text-xs uppercase tracking-wide text-slate-400">Workspace ID</div>
            <div className="text-slate-900">{org.org_id}</div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wide text-slate-400">Role</div>
            <div className="text-slate-900">{membership.role.replace('org_', '')}</div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wide text-slate-400">Joined</div>
            <div className="text-slate-900">{formatDate(membership.created_at)}</div>
          </div>
        </div>
      </Card>
    </div>
  )
}

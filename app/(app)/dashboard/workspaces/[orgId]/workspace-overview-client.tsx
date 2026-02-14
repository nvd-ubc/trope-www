'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Badge from '@/components/ui/badge'
import Button from '@/components/ui/button'
import Card from '@/components/ui/card'
import {
  ErrorNotice,
  MetricCard,
  PageHeader,
  SectionCard,
  WorkspaceOverviewSkeleton,
} from '@/components/dashboard'

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

type WorkspaceSummary = {
  org: OrgProfile
  membership: OrgMembership
  workflow_counts?: {
    total?: number
    published?: number
    draft?: number
    review?: number
    archived?: number
  } | null
  health_counts?: {
    healthy?: number
    warning?: number
    failing?: number
    unknown?: number
  } | null
  governance_counts?: {
    unowned?: number
    required?: number
    overdue_runs?: number
    review_due?: number
    critical_high?: number
  } | null
  run_totals_7d?: {
    total?: number
    success?: number
    failed?: number
    canceled?: number
  } | null
  alert_counts?: {
    open?: number
    snoozed?: number
    resolved?: number
  } | null
}

type WorkspaceOverviewBootstrapResponse = {
  summary?: WorkspaceSummary | null
  error?: string
}

const formatDate = (value?: string) => {
  if (!value) return 'Unknown'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function WorkspaceOverviewClient({ orgId }: { orgId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [requestId, setRequestId] = useState<string | null>(null)
  const [org, setOrg] = useState<OrgProfile | null>(null)
  const [membership, setMembership] = useState<OrgMembership | null>(null)
  const [summaryData, setSummaryData] = useState<WorkspaceSummary | null>(null)

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
        const response = await fetch(
          `/api/orgs/${encodeURIComponent(orgId)}/workspace-overview/bootstrap`,
          { cache: 'no-store' }
        )

        if (response.status === 401) {
          router.replace(`/signin?next=/dashboard/workspaces/${encodeURIComponent(orgId)}`)
          return
        }

        const payload = (await response.json().catch(() => null)) as WorkspaceOverviewBootstrapResponse | null
        if (!response.ok || !payload?.summary?.org || !payload.summary.membership) {
          setRequestId(response.headers.get('x-trope-request-id'))
          throw new Error('Unable to load workspace.')
        }

        if (!active) return
        setOrg(payload.summary.org)
        setMembership(payload.summary.membership)
        setSummaryData(payload.summary)
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
    const workflowCounts = summaryData?.workflow_counts ?? {}
    const healthCounts = summaryData?.health_counts ?? {}
    const governanceCounts = summaryData?.governance_counts ?? {}
    const runTotals = summaryData?.run_totals_7d ?? {}
    const alertCounts = summaryData?.alert_counts ?? {}
    const total = workflowCounts.total ?? 0
    const published = workflowCounts.published ?? 0
    const draft = workflowCounts.draft ?? 0
    const failing = healthCounts.failing ?? 0
    const warning = healthCounts.warning ?? 0
    const unowned = governanceCounts.unowned ?? 0
    const requiredCount = governanceCounts.required ?? 0
    const totalRuns = runTotals.total ?? 0
    const totalSuccess = runTotals.success ?? 0
    const successRate = totalRuns > 0 ? Math.round((totalSuccess / totalRuns) * 100) : null
    const overdueRuns = governanceCounts.overdue_runs ?? 0
    const reviewDue = governanceCounts.review_due ?? 0

    return {
      total,
      published,
      draft,
      failing,
      warning,
      unowned,
      requiredCount,
      criticalHigh: governanceCounts.critical_high ?? 0,
      totalRuns,
      successRate,
      overdueRuns,
      reviewDue,
      openAlerts: alertCounts.open ?? 0,
    }
  }, [summaryData])

  if (loading) {
    return <WorkspaceOverviewSkeleton />
  }

  if (error || !org || !membership) {
    return (
      <ErrorNotice
        title="Unable to load workspace"
        message={error ?? 'Unable to load workspace.'}
        requestId={requestId}
        onCopyRequestId={() => copyRequestId()}
      />
    )
  }

  const canViewAudit = membership.role === 'org_owner' || membership.role === 'org_admin'

  return (
    <div className="space-y-6">
      <PageHeader
        title={org.name || org.org_id}
        description={`Created ${formatDate(org.created_at)} · Role ${membership.role.replace('org_', '')}`}
        actions={
          <>
            <Button asChild variant="outline" size="sm">
              <Link href={`/dashboard/workspaces/${encodeURIComponent(orgId)}/workflows`}>Workflows</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href={`/dashboard/workspaces/${encodeURIComponent(orgId)}/runs`}>Runs</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href={`/dashboard/workspaces/${encodeURIComponent(orgId)}/alerts`}>Alerts</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href={`/dashboard/workspaces/${encodeURIComponent(orgId)}/compliance`}>Compliance</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href={`/dashboard/workspaces/${encodeURIComponent(orgId)}/members`}>Members</Link>
            </Button>
            {canViewAudit && (
              <Button asChild variant="outline" size="sm">
                <Link href={`/dashboard/workspaces/${encodeURIComponent(orgId)}/audit`}>Audit</Link>
              </Button>
            )}
            <Button asChild variant="outline" size="sm">
              <Link href={`/dashboard/workspaces/${encodeURIComponent(orgId)}/settings`}>Settings</Link>
            </Button>
          </>
        }
      />

      <SectionCard
        title="Getting started"
        description="Capture a workflow, invite teammates, and track the first guided runs."
        action={
          <Button asChild size="sm">
            <Link href="/download">Download desktop app</Link>
          </Button>
        }
      >
        <div className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-3">
          <Link
            href={`/dashboard/workspaces/${encodeURIComponent(orgId)}/workflows`}
            className="rounded-lg border border-border bg-muted/40 px-4 py-3 transition-colors hover:bg-muted/60"
          >
            Record your first workflow
          </Link>
          <Link
            href={`/dashboard/workspaces/${encodeURIComponent(orgId)}/members`}
            className="rounded-lg border border-border bg-muted/40 px-4 py-3 transition-colors hover:bg-muted/60"
          >
            Invite teammates
          </Link>
          <Link
            href={`/dashboard/workspaces/${encodeURIComponent(orgId)}/runs`}
            className="rounded-lg border border-border bg-muted/40 px-4 py-3 transition-colors hover:bg-muted/60"
          >
            Review run history
          </Link>
        </div>
      </SectionCard>

      <div className="grid gap-4 md:grid-cols-2">
        <SectionCard
          title="Workflow library"
          action={<Badge variant="info">{summary.total}</Badge>}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <MetricCard label="Published" value={summary.published} />
            <MetricCard label="Drafts" value={summary.draft} />
            <MetricCard label="Unowned" value={summary.unowned} />
            <MetricCard label="Required" value={summary.requiredCount} />
          </div>
          {summary.requiredCount > 0 && (
            <Button asChild variant="ghost" size="sm">
              <Link href={`/dashboard/workspaces/${encodeURIComponent(orgId)}/compliance`}>View compliance</Link>
            </Button>
          )}
        </SectionCard>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-foreground">Operational health</h2>
            {summary.failing > 0 ? (
              <Badge variant="danger">{summary.failing} failing</Badge>
            ) : (
              <Badge variant="success">Healthy</Badge>
            )}
          </div>
          <div className="mt-4 grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
            <div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground">Warning</div>
              <div className="text-foreground">{summary.warning}</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground">Runs (7d)</div>
              <div className="text-foreground">{summary.totalRuns}</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground">Success rate</div>
              <div className="text-foreground">{summary.successRate ? `${summary.successRate}%` : '-'}</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground">Overdue runs</div>
              <div className="text-foreground">{summary.overdueRuns}</div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-foreground">Governance</h2>
            <Badge variant={summary.reviewDue > 0 ? 'warning' : 'neutral'}>
              {summary.reviewDue > 0 ? 'Review due' : 'Up to date'}
            </Badge>
          </div>
          <div className="mt-4 grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
            <div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground">Review due</div>
              <div className="text-foreground">{summary.reviewDue}</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground">Critical workflows</div>
              <div className="text-foreground">{summary.criticalHigh}</div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-foreground">Alerts</h2>
            <Badge variant={summary.openAlerts > 0 ? 'warning' : 'success'}>
              {summary.openAlerts > 0 ? `${summary.openAlerts} open` : 'Clear'}
            </Badge>
          </div>
          <div className="mt-4 text-sm text-muted-foreground">
            Resolve alerts to keep workflows healthy and reviewed.
          </div>
          <div className="mt-4">
            <Link href={`/dashboard/workspaces/${encodeURIComponent(orgId)}/alerts`}>
              <Button variant="secondary" size="sm">Open alerts</Button>
            </Link>
          </div>
        </Card>
      </div>

      <SectionCard title="Workspace summary">
        <div className="mt-4 grid gap-3 text-sm text-muted-foreground sm:grid-cols-3">
          <div>
            <div className="text-xs uppercase tracking-wide text-muted-foreground">Workspace ID</div>
            <div className="text-foreground">{org.org_id}</div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wide text-muted-foreground">Role</div>
            <div className="text-foreground">{membership.role.replace('org_', '')}</div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wide text-muted-foreground">Joined</div>
            <div className="text-foreground">{formatDate(membership.created_at)}</div>
          </div>
        </div>
      </SectionCard>
    </div>
  )
}

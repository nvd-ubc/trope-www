'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Badge from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  DashboardHomeSkeleton,
  ErrorNotice,
  MetricCard,
  PageHeader,
  SectionCard,
} from '@/components/dashboard'

type TrendPoint = {
  month: string
  value: number
}

type TeamInsights = {
  timeframe_days?: number
  summary?: {
    docs_total?: number
    active_teammates?: number
    share_rate?: number | null
    completion_rate?: number | null
    views?: number
    guided_starts?: number
    guided_completions?: number
    tasks_total?: number
    tasks_completed?: number
    task_completion_rate?: number | null
  }
  total_docs_created_trend?: TrendPoint[]
  top_docs?: Array<{
    workflow_id: string
    title: string
    views: number
    guided_completions: number
  }>
}

type MyInsights = {
  timeframe_days?: number
  summary?: {
    docs_created?: number
    doc_views?: number
    guided_starts?: number
    guided_completions?: number
    guided_completion_rate?: number | null
    runs_total?: number
    runs_completed?: number
    tasks_total?: number
    tasks_completed?: number
    tasks_overdue?: number
  }
}

type InsightsBootstrapResponse = {
  teamInsights?: TeamInsights | null
  myInsights?: MyInsights | null
  error?: string
}

const asPercent = (value?: number | null) => {
  if (typeof value !== 'number' || Number.isNaN(value)) return '—'
  return `${Math.round(value * 100)}%`
}

export default function InsightsClient({ orgId }: { orgId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [teamInsights, setTeamInsights] = useState<TeamInsights | null>(null)
  const [myInsights, setMyInsights] = useState<MyInsights | null>(null)

  useEffect(() => {
    let active = true

    const load = async () => {
      try {
        const response = await fetch(
          `/api/orgs/${encodeURIComponent(orgId)}/insights/bootstrap`,
          { cache: 'no-store' }
        )

        if (response.status === 401) {
          router.replace(`/signin?next=/dashboard/workspaces/${encodeURIComponent(orgId)}/insights`)
          return
        }

        const payload = (await response.json().catch(() => null)) as InsightsBootstrapResponse | null
        if (!response.ok || !payload?.teamInsights || !payload?.myInsights) {
          throw new Error('Unable to load insights.')
        }

        if (!active) return
        setTeamInsights(payload.teamInsights)
        setMyInsights(payload.myInsights)
        setLoading(false)
      } catch (err) {
        if (!active) return
        setError(err instanceof Error ? err.message : 'Unable to load insights.')
        setLoading(false)
      }
    }

    load()
    return () => {
      active = false
    }
  }, [orgId, router])

  const mySummary = myInsights?.summary ?? {}
  const teamSummary = teamInsights?.summary ?? {}
  const trendMax = useMemo(() => {
    const values = (teamInsights?.total_docs_created_trend ?? []).map((entry) => entry.value)
    return values.length > 0 ? Math.max(...values, 1) : 1
  }, [teamInsights?.total_docs_created_trend])

  if (loading) {
    return <DashboardHomeSkeleton />
  }

  if (error || !teamInsights || !myInsights) {
    return <ErrorNotice title="Unable to load insights" message={error ?? 'Unable to load insights.'} />
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Insights"
        description="Personal and team analytics for adoption and completion."
        backHref={`/dashboard/workspaces/${encodeURIComponent(orgId)}/home`}
        backLabel="Back to home"
        badges={
          <>
            <Badge variant="info">My Insights</Badge>
            <Badge variant="neutral">Team Insights</Badge>
          </>
        }
      />

      <Tabs defaultValue="my">
        <TabsList>
          <TabsTrigger value="my">My Insights</TabsTrigger>
          <TabsTrigger value="team">Team Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="my" className="space-y-4 pt-1">
          <div className="grid gap-4 md:grid-cols-3">
            <MetricCard label="Docs created" value={mySummary.docs_created ?? 0} />
            <MetricCard label="Doc views" value={mySummary.doc_views ?? 0} />
            <MetricCard
              label="Completion rate"
              value={asPercent(mySummary.guided_completion_rate)}
              helper={`${mySummary.guided_completions ?? 0}/${mySummary.guided_starts ?? 0} completions`}
            />
          </div>

          <SectionCard title="Execution" description="Your run and task outcomes in the selected timeframe.">
            <div className="grid gap-4 sm:grid-cols-3">
              <MetricCard label="Runs completed" value={mySummary.runs_completed ?? 0} helper={`${mySummary.runs_total ?? 0} total`} />
              <MetricCard label="Tasks completed" value={mySummary.tasks_completed ?? 0} helper={`${mySummary.tasks_total ?? 0} assigned`} />
              <MetricCard label="Tasks overdue" value={mySummary.tasks_overdue ?? 0} helper="Needs attention" />
            </div>
          </SectionCard>
        </TabsContent>

        <TabsContent value="team" className="space-y-4 pt-1">
          <div className="grid gap-4 md:grid-cols-4">
            <MetricCard label="Docs" value={teamSummary.docs_total ?? 0} />
            <MetricCard label="Share rate" value={asPercent(teamSummary.share_rate)} />
            <MetricCard label="Completion rate" value={asPercent(teamSummary.completion_rate)} />
            <MetricCard
              label="Task completion"
              value={asPercent(teamSummary.task_completion_rate)}
              helper={`${teamSummary.tasks_completed ?? 0}/${teamSummary.tasks_total ?? 0}`}
            />
          </div>

          <SectionCard title="Total Docs Created" description="Monthly trend for the last six months.">
            <div className="space-y-2">
              {(teamInsights.total_docs_created_trend ?? []).map((entry) => (
                <div key={entry.month}>
                  <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                    <span>{entry.month}</span>
                    <span>{entry.value}</span>
                  </div>
                  <div className="h-2 rounded bg-muted">
                    <div
                      className="h-2 rounded bg-primary"
                      style={{ width: `${Math.max(6, Math.round((entry.value / trendMax) * 100))}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Top docs" description="Most viewed docs in the selected timeframe.">
            {(teamInsights.top_docs ?? []).length === 0 && (
              <div className="rounded-lg border border-dashed border-border bg-muted/40 p-4 text-sm text-muted-foreground">
                No docs with activity yet.
              </div>
            )}
            <div className="space-y-2">
              {(teamInsights.top_docs ?? []).map((doc) => (
                <div key={doc.workflow_id} className="rounded-lg border border-border bg-card px-3 py-3">
                  <div className="text-sm font-medium text-foreground">{doc.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {doc.views} views · {doc.guided_completions} guided completions
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        </TabsContent>
      </Tabs>
    </div>
  )
}

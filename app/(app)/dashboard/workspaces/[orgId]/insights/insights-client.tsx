'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Badge from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
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

type DocInsights = {
  doc?: {
    doc_id: string
    title: string
    status?: string
  }
  summary?: {
    views?: number
    guided_starts?: number
    guided_completions?: number
    completion_rate?: number | null
    runs_total?: number
    runs_completed?: number
    run_success_rate?: number | null
  }
}

type InsightsBootstrapResponse = {
  teamInsights?: TeamInsights | null
  myInsights?: MyInsights | null
  error?: string
}

type DocOption = {
  doc_id: string
  title: string
}

type DocsRecentResponse = {
  recents?: Array<{
    doc_id: string
    title: string
  }>
}

type DocInsightsResponse = {
  doc?: DocInsights['doc']
  summary?: DocInsights['summary']
}

const timeframeOptions: Array<{ label: string; value: number }> = [
  { label: 'Last 7 days', value: 7 },
  { label: 'Last 30 days', value: 30 },
  { label: 'Last 90 days', value: 90 },
]

const asPercent = (value?: number | null) => {
  if (typeof value !== 'number' || Number.isNaN(value)) return '—'
  return `${Math.round(value * 100)}%`
}

export default function InsightsClient({ orgId }: { orgId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [days, setDays] = useState<number>(30)
  const [selectedDocId, setSelectedDocId] = useState<string>('all')
  const [docOptions, setDocOptions] = useState<DocOption[]>([])
  const [teamInsights, setTeamInsights] = useState<TeamInsights | null>(null)
  const [myInsights, setMyInsights] = useState<MyInsights | null>(null)
  const [docInsights, setDocInsights] = useState<DocInsights | null>(null)

  useEffect(() => {
    let active = true

    const loadDocOptions = async () => {
      try {
        const response = await fetch(
          `/api/orgs/${encodeURIComponent(orgId)}/docs/recent`,
          { cache: 'no-store' }
        )
        if (!response.ok) {
          return
        }
        const payload = (await response.json().catch(() => null)) as DocsRecentResponse | null
        if (!active) return

        const options = Array.from(
          new Map(
            (payload?.recents ?? [])
              .filter((entry) => Boolean(entry?.doc_id))
              .map((entry) => [
                entry.doc_id,
                {
                  doc_id: entry.doc_id,
                  title: entry.title || entry.doc_id,
                },
              ])
          ).values()
        )
        setDocOptions(options)
      } catch {
        if (!active) return
      }
    }

    loadDocOptions()
    return () => {
      active = false
    }
  }, [orgId])

  useEffect(() => {
    let active = true

    const load = async () => {
      try {
        const params = new URLSearchParams()
        params.set('days', String(days))
        const scopedDocId = selectedDocId === 'all' ? null : selectedDocId
        if (scopedDocId) {
          params.set('doc_id', scopedDocId)
        }

        const bootstrapUrl =
          `/api/orgs/${encodeURIComponent(orgId)}/insights/bootstrap?${params.toString()}`
        const docInsightsUrl = scopedDocId
          ? `/api/orgs/${encodeURIComponent(orgId)}/insights/docs/${encodeURIComponent(scopedDocId)}?days=${days}`
          : null

        const [bootstrapResponse, docResponse] = await Promise.all([
          fetch(bootstrapUrl, { cache: 'no-store' }),
          docInsightsUrl
            ? fetch(docInsightsUrl, { cache: 'no-store' })
            : Promise.resolve(null),
        ])

        if (bootstrapResponse.status === 401 || docResponse?.status === 401) {
          router.replace(`/signin?next=/dashboard/workspaces/${encodeURIComponent(orgId)}/insights`)
          return
        }

        const bootstrapPayload = (await bootstrapResponse.json().catch(() => null)) as InsightsBootstrapResponse | null
        if (!bootstrapResponse.ok || !bootstrapPayload?.teamInsights || !bootstrapPayload?.myInsights) {
          throw new Error('Unable to load insights.')
        }

        let nextDocInsights: DocInsights | null = null
        if (docResponse) {
          if (docResponse.ok) {
            const payload = (await docResponse.json().catch(() => null)) as DocInsightsResponse | null
            if (payload?.summary && payload?.doc) {
              nextDocInsights = {
                doc: payload.doc,
                summary: payload.summary,
              }
            }
          } else if (docResponse.status !== 404) {
            throw new Error('Unable to load doc insights.')
          }
        }

        if (!active) return
        setTeamInsights(bootstrapPayload.teamInsights)
        setMyInsights(bootstrapPayload.myInsights)
        setDocInsights(nextDocInsights)
        setError(null)
        setLoading(false)
      } catch (err) {
        if (!active) return
        setError(err instanceof Error ? err.message : 'Unable to load insights.')
        setLoading(false)
      }
    }

    setLoading(true)
    load()
    return () => {
      active = false
    }
  }, [days, orgId, router, selectedDocId])

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

  const selectedDocLabel = selectedDocId === 'all'
    ? 'All documents'
    : docOptions.find((entry) => entry.doc_id === selectedDocId)?.title ?? selectedDocId

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
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Select value={String(days)} onValueChange={(value) => setDays(Number(value))}>
              <SelectTrigger size="sm" className="min-w-[10rem]">
                <SelectValue placeholder="Timeframe" />
              </SelectTrigger>
              <SelectContent>
                {timeframeOptions.map((option) => (
                  <SelectItem key={option.value} value={String(option.value)}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedDocId} onValueChange={setSelectedDocId}>
              <SelectTrigger size="sm" className="min-w-[12rem]">
                <SelectValue placeholder="All documents" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All documents</SelectItem>
                {docOptions.map((option) => (
                  <SelectItem key={option.doc_id} value={option.doc_id}>
                    {option.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        }
      />

      {selectedDocId !== 'all' && (
        <SectionCard
          title={docInsights?.doc?.title ? `Selected doc: ${docInsights.doc.title}` : 'Selected doc insights'}
          description={`${selectedDocLabel} in the selected timeframe.`}
        >
          {!docInsights && (
            <div className="rounded-lg border border-dashed border-border bg-muted/40 p-4 text-sm text-muted-foreground">
              No activity found for this document in the selected timeframe.
            </div>
          )}
          {docInsights && (
            <div className="grid gap-4 sm:grid-cols-3">
              <MetricCard label="Views" value={docInsights.summary?.views ?? 0} />
              <MetricCard label="Guided completions" value={docInsights.summary?.guided_completions ?? 0} />
              <MetricCard label="Run success rate" value={asPercent(docInsights.summary?.run_success_rate)} />
            </div>
          )}
        </SectionCard>
      )}

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


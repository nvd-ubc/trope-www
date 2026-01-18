'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type WorkflowDefinition = {
  org_id: string
  workflow_id: string
  title: string
  status: string
  created_at: string
  updated_at: string
  latest_version_id?: string | null
  source?: string | null
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

const formatDate = (value?: string) => {
  if (!value) return 'Unknown'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

const statusBadge = (status?: string | null) => {
  const normalized = (status ?? 'unknown').toLowerCase()
  if (normalized === 'published') {
    return 'bg-emerald-50 text-emerald-700 border-emerald-100'
  }
  if (normalized === 'draft') {
    return 'bg-amber-50 text-amber-700 border-amber-100'
  }
  if (normalized === 'archived') {
    return 'bg-slate-100 text-slate-500 border-slate-200'
  }
  return 'bg-slate-100 text-slate-500 border-slate-200'
}

const formatStatus = (status?: string | null) => {
  if (!status) return 'Unknown'
  return status.replace(/_/g, ' ')
}

const formatSource = (source?: string | null) => {
  if (!source) return '—'
  if (source === 'share') return 'Imported'
  return source.replace(/_/g, ' ')
}

export default function WorkflowsClient({ orgId }: { orgId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [workflows, setWorkflows] = useState<WorkflowDefinition[]>([])
  const [latestVersions, setLatestVersions] = useState<Record<string, WorkflowVersion | null>>({})
  const [query, setQuery] = useState('')

  const loadWorkflows = useCallback(async () => {
    const response = await fetch(`/api/orgs/${encodeURIComponent(orgId)}/workflows`, {
      cache: 'no-store',
    })

    if (response.status === 401) {
      router.replace(`/signin?next=/dashboard/workspaces/${encodeURIComponent(orgId)}/workflows`)
      return
    }

    const payload = (await response.json().catch(() => null)) as WorkflowListResponse | null
    if (!response.ok || !payload) {
      throw new Error('Unable to load workflows.')
    }

    const list = payload.workflows ?? []
    setWorkflows(list)

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

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return workflows
    return workflows.filter((workflow) => {
      return (
        workflow.title.toLowerCase().includes(normalized) ||
        workflow.workflow_id.toLowerCase().includes(normalized)
      )
    })
  }, [workflows, query])

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
        Loading workflows…
      </div>
    )
  }

  if (error && workflows.length === 0) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
        {error}
      </div>
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
          className="text-sm font-medium text-[#1861C8] hover:text-[#1861C8]/80"
        >
          Back to workspace
        </Link>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm text-slate-500">{filtered.length} workflows</div>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by title or ID"
          className="w-full max-w-xs rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-700 focus:border-slate-300 focus:outline-none"
        />
      </div>

      <div className="space-y-4">
        {filtered.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
            No workflows yet. Publish a guide from the desktop app to populate the library.
          </div>
        )}

        {filtered.map((workflow) => {
          const latest = latestVersions[workflow.workflow_id]
          return (
            <div
              key={workflow.workflow_id}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-base font-semibold text-slate-900">
                      {workflow.title || workflow.workflow_id}
                    </h2>
                    <span
                      className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${statusBadge(
                        workflow.status
                      )}`}
                    >
                      {formatStatus(workflow.status)}
                    </span>
                  </div>
                  <div className="mt-1 text-xs text-slate-500">
                    Updated {formatDate(workflow.updated_at)}
                  </div>
                </div>
                <Link
                  href={`/dashboard/workspaces/${encodeURIComponent(orgId)}/workflows/${encodeURIComponent(
                    workflow.workflow_id
                  )}`}
                  className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:border-slate-300 hover:text-slate-900"
                >
                  Open
                </Link>
              </div>

              <div className="mt-4 grid gap-3 text-xs text-slate-600 md:grid-cols-4">
                <div>
                  <div className="text-[10px] uppercase tracking-wide text-slate-400">Workflow ID</div>
                  <div className="text-slate-800">{workflow.workflow_id}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wide text-slate-400">Latest Version</div>
                  <div className="text-slate-800">
                    {latest?.version_id ?? workflow.latest_version_id ?? '—'}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wide text-slate-400">Steps</div>
                  <div className="text-slate-800">
                    {typeof latest?.steps_count === 'number' ? latest.steps_count : '—'}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wide text-slate-400">Source</div>
                  <div className="text-slate-800">{formatSource(workflow.source)}</div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

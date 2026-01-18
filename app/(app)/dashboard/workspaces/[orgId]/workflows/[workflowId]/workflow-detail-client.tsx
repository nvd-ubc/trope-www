'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCsrfToken } from '@/lib/client/use-csrf-token'

type WorkflowDefinition = {
  org_id: string
  workflow_id: string
  title: string
  status: string
  created_at: string
  created_by: string
  updated_at: string
  latest_version_id?: string | null
  source?: string | null
}

type WorkflowVersion = {
  org_id: string
  workflow_id: string
  version_id: string
  status: string
  created_at: string
  created_by: string
  steps_count?: number | null
  guide_spec?: { download_url?: string | null } | null
}

type WorkflowDetailResponse = {
  workflow: WorkflowDefinition
  latest_version?: WorkflowVersion | null
}

type VersionsResponse = {
  versions: WorkflowVersion[]
}

type VersionDetailResponse = {
  version: WorkflowVersion
}

type OrgProfileResponse = {
  membership?: { role: string }
}

type GuideSpec = {
  workflow_title: string
  app: string
  version: string
  variables?: Array<{
    id: string
    label: string
    sensitive: boolean
    type?: string
    description?: string
  }>
  steps: Array<GuideStep>
}

type GuideStep = {
  id: string
  title: string
  why?: string
  instructions: string
  kind?: string
  anchors?: {
    text?: Array<{ string?: string; area_hint?: string }>
    icons?: Array<{ description?: string }>
    layout?: Array<{ region?: string; relative_to?: string; position_hint?: string }>
  }
}

const formatDate = (value?: string) => {
  if (!value) return 'Unknown'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

const formatDateTime = (value?: string) => {
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

const formatKind = (kind?: string | null) => {
  if (!kind) return null
  return kind.replace(/_/g, ' ')
}

export default function WorkflowDetailClient({
  orgId,
  workflowId,
}: {
  orgId: string
  workflowId: string
}) {
  const router = useRouter()
  const { token: csrfToken } = useCsrfToken()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [workflow, setWorkflow] = useState<WorkflowDefinition | null>(null)
  const [versions, setVersions] = useState<WorkflowVersion[]>([])
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null)
  const [spec, setSpec] = useState<GuideSpec | null>(null)
  const [specLoading, setSpecLoading] = useState(false)
  const [specError, setSpecError] = useState<string | null>(null)
  const [shareId, setShareId] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [actionMessage, setActionMessage] = useState<string | null>(null)
  const [pendingAction, setPendingAction] = useState<string | null>(null)
  const [membershipRole, setMembershipRole] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    const load = async () => {
      try {
        const [detailRes, versionsRes, orgRes] = await Promise.all([
          fetch(
            `/api/orgs/${encodeURIComponent(orgId)}/workflows/${encodeURIComponent(workflowId)}`,
            { cache: 'no-store' }
          ),
          fetch(
            `/api/orgs/${encodeURIComponent(orgId)}/workflows/${encodeURIComponent(workflowId)}/versions`,
            { cache: 'no-store' }
          ),
          fetch(`/api/orgs/${encodeURIComponent(orgId)}`, { cache: 'no-store' }),
        ])

        if (detailRes.status === 401 || versionsRes.status === 401 || orgRes.status === 401) {
          router.replace(
            `/signin?next=/dashboard/workspaces/${encodeURIComponent(orgId)}/workflows/${encodeURIComponent(
              workflowId
            )}`
          )
          return
        }

        const detailPayload = (await detailRes.json().catch(() => null)) as
          | WorkflowDetailResponse
          | null
        const versionsPayload = (await versionsRes.json().catch(() => null)) as
          | VersionsResponse
          | null
        const orgPayload = (await orgRes.json().catch(() => null)) as OrgProfileResponse | null

        if (!detailRes.ok || !detailPayload) {
          throw new Error('Unable to load workflow.')
        }

        const list = versionsPayload?.versions ?? []
        list.sort((a, b) => {
          const aTime = new Date(a.created_at).getTime()
          const bTime = new Date(b.created_at).getTime()
          return bTime - aTime
        })

        if (!active) return
        setWorkflow(detailPayload.workflow)
        setVersions(list)
        setMembershipRole(orgPayload?.membership?.role ?? null)
        const latestId =
          detailPayload.workflow.latest_version_id || detailPayload.latest_version?.version_id
        setSelectedVersionId(latestId || list[0]?.version_id || null)
        setLoading(false)
      } catch (err) {
        if (!active) return
        setError(err instanceof Error ? err.message : 'Unable to load workflow.')
        setLoading(false)
      }
    }

    load()
    return () => {
      active = false
    }
  }, [orgId, workflowId, router])

  const selectedVersion = useMemo(
    () => versions.find((version) => version.version_id === selectedVersionId) ?? null,
    [versions, selectedVersionId]
  )

  const isAdmin = membershipRole === 'org_owner' || membershipRole === 'org_admin'

  useEffect(() => {
    if (!selectedVersionId) {
      setSpec(null)
      return
    }

    let active = true
    const loadSpec = async () => {
      setSpecLoading(true)
      setSpecError(null)
      try {
        const response = await fetch(
          `/api/orgs/${encodeURIComponent(orgId)}/workflows/${encodeURIComponent(
            workflowId
          )}/versions/${encodeURIComponent(selectedVersionId)}`,
          { cache: 'no-store' }
        )
        if (!response.ok) {
          throw new Error('Unable to load version details.')
        }
        const payload = (await response.json().catch(() => null)) as
          | VersionDetailResponse
          | null
        const downloadUrl = payload?.version?.guide_spec?.download_url
        if (!downloadUrl) {
          throw new Error('Guide spec is not available for this version.')
        }
        const specResponse = await fetch(downloadUrl, { cache: 'no-store' })
        if (!specResponse.ok) {
          throw new Error('Unable to download guide spec.')
        }
        const specJson = (await specResponse.json().catch(() => null)) as GuideSpec | null
        if (!specJson) {
          throw new Error('Guide spec is empty.')
        }
        if (!active) return
        setSpec(specJson)
      } catch (err) {
        if (!active) return
        setSpec(null)
        setSpecError(err instanceof Error ? err.message : 'Unable to load guide spec.')
      } finally {
        if (active) {
          setSpecLoading(false)
        }
      }
    }

    loadSpec()
    return () => {
      active = false
    }
  }, [orgId, workflowId, selectedVersionId])

  const handleCopyWorkflowId = async () => {
    setActionError(null)
    setActionMessage(null)
    try {
      await navigator.clipboard.writeText(workflowId)
      setActionMessage('Workflow ID copied.')
    } catch {
      setActionError('Unable to copy workflow ID.')
    }
  }

  const handleCreateShare = async () => {
    if (!csrfToken || !selectedVersionId) return
    setPendingAction('share')
    setActionError(null)
    setActionMessage(null)
    try {
      const response = await fetch(
        `/api/orgs/${encodeURIComponent(orgId)}/workflows/${encodeURIComponent(
          workflowId
        )}/share`,
        {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            'x-csrf-token': csrfToken,
          },
          body: JSON.stringify({ version_id: selectedVersionId }),
        }
      )
      const payload = (await response.json().catch(() => null)) as
        | { share?: { share_id?: string } ; message?: string }
        | null
      if (!response.ok) {
        throw new Error(payload?.message || 'Unable to create share link.')
      }
      const nextShareId = payload?.share?.share_id ?? null
      setShareId(nextShareId)
      setActionMessage('Share link created.')
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Unable to create share link.')
    } finally {
      setPendingAction(null)
    }
  }

  const handleArchive = async () => {
    if (!csrfToken) return
    const confirmed = window.confirm('Archive this workflow? This hides it from the active library.')
    if (!confirmed) return
    setPendingAction('archive')
    setActionError(null)
    setActionMessage(null)
    try {
      const response = await fetch(
        `/api/orgs/${encodeURIComponent(orgId)}/workflows/${encodeURIComponent(workflowId)}`,
        {
          method: 'DELETE',
          headers: {
            'x-csrf-token': csrfToken,
          },
        }
      )
      const payload = (await response.json().catch(() => null)) as { message?: string } | null
      if (!response.ok) {
        throw new Error(payload?.message || 'Unable to archive workflow.')
      }
      setWorkflow((prev) => (prev ? { ...prev, status: 'archived' } : prev))
      setActionMessage('Workflow archived.')
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Unable to archive workflow.')
    } finally {
      setPendingAction(null)
    }
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
        Loading workflow…
      </div>
    )
  }

  if (error || !workflow) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
        {error ?? 'Unable to load workflow.'}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold text-slate-900">
              {workflow.title || workflow.workflow_id}
            </h1>
            <span
              className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${statusBadge(
                workflow.status
              )}`}
            >
              {formatStatus(workflow.status)}
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-600">
            Created {formatDate(workflow.created_at)} · Updated {formatDate(workflow.updated_at)}
          </p>
        </div>
        <Link
          href={`/dashboard/workspaces/${encodeURIComponent(orgId)}/workflows`}
          className="text-sm font-medium text-[#1861C8] hover:text-[#1861C8]/80"
        >
          Back to workflows
        </Link>
      </div>

      {(actionError || actionMessage) && (
        <div
          className={`rounded-xl border px-4 py-3 text-sm ${
            actionError
              ? 'border-rose-200 bg-rose-50 text-rose-700'
              : 'border-emerald-200 bg-emerald-50 text-emerald-700'
          }`}
        >
          {actionError ?? actionMessage}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-semibold text-slate-900">Workflow details</h2>
          <div className="mt-4 grid gap-3 text-sm text-slate-600">
            <div>
              <div className="text-xs uppercase tracking-wide text-slate-400">Workflow ID</div>
              <div className="text-slate-900">{workflow.workflow_id}</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide text-slate-400">Latest version</div>
              <div className="text-slate-900">
                {workflow.latest_version_id ?? selectedVersion?.version_id ?? '—'}
              </div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide text-slate-400">Latest updated</div>
              <div className="text-slate-900">{formatDateTime(workflow.updated_at)}</div>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button
              onClick={handleCopyWorkflowId}
              className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:border-slate-300 hover:text-slate-900"
            >
              Copy workflow ID
            </button>
            {isAdmin && (
              <button
                onClick={handleCreateShare}
                disabled={!csrfToken || pendingAction === 'share' || !selectedVersionId}
                className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:border-slate-300 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Create share link
              </button>
            )}
            {isAdmin && (
              <button
                onClick={handleArchive}
                disabled={!csrfToken || pendingAction === 'archive'}
                className="rounded-full border border-rose-200 px-3 py-1.5 text-xs font-medium text-rose-700 hover:border-rose-300 hover:text-rose-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Archive
              </button>
            )}
          </div>
          {shareId && (
            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
              <div className="text-xs uppercase tracking-wide text-slate-400">Share ID</div>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs">{shareId}</span>
                <button
                  onClick={() => navigator.clipboard.writeText(shareId)}
                  className="rounded-full border border-slate-200 px-2.5 py-1 text-[11px] font-semibold text-slate-600 hover:border-slate-300 hover:text-slate-800"
                >
                  Copy
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-semibold text-slate-900">Versions</h2>
          {versions.length === 0 && (
            <div className="mt-4 text-sm text-slate-500">No versions yet.</div>
          )}
          <div className="mt-4 space-y-3">
            {versions.map((version) => (
              <button
                key={version.version_id}
                onClick={() => setSelectedVersionId(version.version_id)}
                className={`w-full rounded-xl border px-4 py-3 text-left text-sm transition ${
                  selectedVersionId === version.version_id
                    ? 'border-[#1861C8] bg-[#1861C8]/5'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="font-semibold text-slate-900">{version.version_id}</div>
                  <div className="text-xs text-slate-500">{formatDate(version.created_at)}</div>
                </div>
                <div className="mt-1 text-xs text-slate-600">
                  {typeof version.steps_count === 'number' ? `${version.steps_count} steps` : 'Steps unknown'}
                  {version.created_by ? ` · Published by ${version.created_by}` : ''}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base font-semibold text-slate-900">Guide preview</h2>
          {selectedVersion && (
            <div className="text-xs text-slate-500">Version {selectedVersion.version_id}</div>
          )}
        </div>

        {specLoading && (
          <div className="mt-4 text-sm text-slate-500">Loading guide spec…</div>
        )}

        {specError && (
          <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {specError}
          </div>
        )}

        {!specLoading && !specError && !spec && (
          <div className="mt-4 text-sm text-slate-500">Select a version to preview the guide.</div>
        )}

        {spec && (
          <div className="mt-6 space-y-6">
            {spec.variables && spec.variables.length > 0 && (
              <div>
                <div className="text-xs uppercase tracking-wide text-slate-400">Variables</div>
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  {spec.variables.map((variable) => (
                    <div
                      key={variable.id}
                      className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700"
                    >
                      <div className="font-semibold text-slate-900">{variable.label}</div>
                      <div className="text-slate-500">{variable.id}</div>
                      {variable.sensitive && (
                        <div className="mt-1 text-[10px] uppercase tracking-wide text-rose-500">Sensitive</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-4">
              {spec.steps.map((step, index) => {
                const kindLabel = formatKind(step.kind)
                const anchorText = step.anchors?.text
                  ?.map((anchor) => anchor.string)
                  .filter((value): value is string => Boolean(value))
                const iconText = step.anchors?.icons
                  ?.map((icon) => icon.description)
                  .filter((value): value is string => Boolean(value))
                const layoutText = step.anchors?.layout
                  ?.map((layout) => layout.region || layout.relative_to || layout.position_hint)
                  .filter((value): value is string => Boolean(value))

                return (
                  <div key={step.id} className="rounded-2xl border border-slate-200 bg-white p-5">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <div className="text-xs uppercase tracking-wide text-slate-400">Step {index + 1}</div>
                        <div className="text-sm font-semibold text-slate-900">{step.title}</div>
                      </div>
                      {kindLabel && (
                        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                          {kindLabel}
                        </span>
                      )}
                    </div>
                    <p className="mt-3 text-sm text-slate-700">{step.instructions}</p>
                    {step.why && <p className="mt-2 text-xs text-slate-500">{step.why}</p>}

                    {(anchorText?.length || iconText?.length || layoutText?.length) && (
                      <div className="mt-3 space-y-2 text-xs text-slate-500">
                        {anchorText && anchorText.length > 0 && (
                          <div>
                            <span className="font-semibold text-slate-600">Text anchors:</span>{' '}
                            {anchorText.join(', ')}
                          </div>
                        )}
                        {iconText && iconText.length > 0 && (
                          <div>
                            <span className="font-semibold text-slate-600">Icon anchors:</span>{' '}
                            {iconText.join(', ')}
                          </div>
                        )}
                        {layoutText && layoutText.length > 0 && (
                          <div>
                            <span className="font-semibold text-slate-600">Layout hints:</span>{' '}
                            {layoutText.join(', ')}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

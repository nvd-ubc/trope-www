'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Badge from '@/components/ui/badge'
import Button from '@/components/ui/button'
import Card from '@/components/ui/card'
import Input from '@/components/ui/input'
import { Table, TableCell, TableHead, TableHeaderCell, TableRow } from '@/components/ui/table'
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
  last_run_at?: string | null
  last_run_status?: string | null
  last_success_at?: string | null
  health_state?: string | null
  success_rate_7d?: number | null
  run_stats_7d?: {
    total: number
    success: number
    failed: number
    canceled: number
  } | null
  metrics_7d?: {
    views: number
    guided_starts: number
    guided_completions: number
  } | null
  expected_run_cadence?: string | null
  expected_run_cadence_days?: number | null
  review_cadence_days?: number | null
  last_reviewed_at?: string | null
  criticality?: string | null
  owner_user_id?: string | null
  maintainer_user_ids?: string[] | null
  contexts?: string[] | null
  required?: boolean | null
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

type WorkflowRun = {
  run_id: string
  status: string
  started_at: string
  finished_at?: string | null
  duration_ms?: number | null
  actor_email?: string | null
  actor_user_id?: string | null
  client?: string | null
  error_code?: string | null
  error_summary?: string | null
  steps_total?: number | null
  steps_completed?: number | null
}

type RunListResponse = {
  runs: WorkflowRun[]
  next_cursor?: string | null
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

const formatDate = (value?: string | null) => {
  if (!value) return 'Unknown'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
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
  const normalized = (status ?? 'unknown').toLowerCase()
  if (normalized === 'published') return 'success'
  if (normalized === 'draft') return 'warning'
  if (normalized === 'review') return 'info'
  if (normalized === 'archived') return 'neutral'
  return 'neutral'
}

const healthVariant = (health?: string | null) => {
  const normalized = (health ?? 'unknown').toLowerCase()
  if (normalized === 'healthy') return 'success'
  if (normalized === 'warning') return 'warning'
  if (normalized === 'failing') return 'danger'
  return 'neutral'
}

const runStatusVariant = (status?: string | null) => {
  const normalized = (status ?? '').toLowerCase()
  if (normalized === 'success') return 'success'
  if (normalized === 'failed') return 'danger'
  if (normalized === 'canceled') return 'warning'
  return 'neutral'
}

const formatStatus = (status?: string | null) => {
  if (!status) return 'Unknown'
  return status.replace(/_/g, ' ')
}

const formatKind = (kind?: string | null) => {
  if (!kind) return null
  return kind.replace(/_/g, ' ')
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

const formatCadenceLabel = (cadence?: string | null, customDays?: number | null) => {
  const normalized = (cadence ?? '').trim().toLowerCase()
  if (!normalized || normalized === 'on_demand') return 'On demand'
  if (normalized === 'daily') return 'Daily'
  if (normalized === 'weekly') return 'Weekly'
  if (normalized === 'monthly') return 'Monthly'
  if (normalized === 'custom') {
    return customDays ? `Every ${customDays} days` : 'Custom'
  }
  if (/^\d+$/.test(normalized)) return `Every ${normalized} days`
  return normalized
}

const formatMemberLabel = (member: MemberRecord) => {
  if (member.display_name && member.email) {
    return `${member.display_name} (${member.email})`
  }
  if (member.display_name) return member.display_name
  if (member.email) return member.email
  return member.user_id
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
  const [requestId, setRequestId] = useState<string | null>(null)
  const [workflow, setWorkflow] = useState<WorkflowDefinition | null>(null)
  const [versions, setVersions] = useState<WorkflowVersion[]>([])
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null)
  const [spec, setSpec] = useState<GuideSpec | null>(null)
  const [specLoading, setSpecLoading] = useState(false)
  const [specError, setSpecError] = useState<string | null>(null)
  const [shareId, setShareId] = useState<string | null>(null)
  const [shareUrl, setShareUrl] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [actionMessage, setActionMessage] = useState<string | null>(null)
  const [pendingAction, setPendingAction] = useState<string | null>(null)
  const [membershipRole, setMembershipRole] = useState<string | null>(null)
  const [runs, setRuns] = useState<WorkflowRun[]>([])
  const [runsError, setRunsError] = useState<string | null>(null)
  const [runsRequestId, setRunsRequestId] = useState<string | null>(null)
  const [runsLoading, setRunsLoading] = useState(false)
  const [settingsSaving, setSettingsSaving] = useState(false)
  const [settingsMessage, setSettingsMessage] = useState<string | null>(null)
  const [settingsError, setSettingsError] = useState<string | null>(null)
  const [settingsRequestId, setSettingsRequestId] = useState<string | null>(null)
  const [expectedCadence, setExpectedCadence] = useState<string>('on_demand')
  const [expectedCadenceDays, setExpectedCadenceDays] = useState<string>('')
  const [reviewCadenceDays, setReviewCadenceDays] = useState<string>('')
  const [criticality, setCriticality] = useState<string>('medium')
  const [ownerUserId, setOwnerUserId] = useState<string>('')
  const [maintainerIds, setMaintainerIds] = useState<string[]>([])
  const [contexts, setContexts] = useState<string>('')
  const [requiredFlag, setRequiredFlag] = useState<boolean>(false)
  const [members, setMembers] = useState<MemberRecord[]>([])

  useEffect(() => {
    let active = true
    const load = async () => {
      setRequestId(null)
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

        const detailReqId = detailRes.headers.get('x-trope-request-id')
        const versionsReqId = versionsRes.headers.get('x-trope-request-id')
        const orgReqId = orgRes.headers.get('x-trope-request-id')
        const fallbackRequestId = detailReqId || versionsReqId || orgReqId

        const detailPayload = (await detailRes.json().catch(() => null)) as
          | WorkflowDetailResponse
          | null
        const versionsPayload = (await versionsRes.json().catch(() => null)) as
          | VersionsResponse
          | null
        const orgPayload = (await orgRes.json().catch(() => null)) as OrgProfileResponse | null

        if (!detailRes.ok || !detailPayload) {
          setRequestId(fallbackRequestId)
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
        setExpectedCadence(detailPayload.workflow.expected_run_cadence ?? 'on_demand')
        setExpectedCadenceDays(
          typeof detailPayload.workflow.expected_run_cadence_days === 'number'
            ? String(detailPayload.workflow.expected_run_cadence_days)
            : ''
        )
        setReviewCadenceDays(
          typeof detailPayload.workflow.review_cadence_days === 'number'
            ? String(detailPayload.workflow.review_cadence_days)
            : ''
        )
        setCriticality(detailPayload.workflow.criticality ?? 'medium')
        setOwnerUserId(detailPayload.workflow.owner_user_id ?? '')
        setMaintainerIds(detailPayload.workflow.maintainer_user_ids ?? [])
        setContexts((detailPayload.workflow.contexts ?? []).join(', '))
        setRequiredFlag(detailPayload.workflow.required ?? false)
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

  const isAdmin = membershipRole === 'org_owner' || membershipRole === 'org_admin'

  useEffect(() => {
    if (!isAdmin) {
      setMembers([])
      return
    }
    let active = true
    const loadMembers = async () => {
      try {
        const response = await fetch(`/api/orgs/${encodeURIComponent(orgId)}/members`, {
          cache: 'no-store',
        })
        if (response.status === 401) {
          router.replace(
            `/signin?next=/dashboard/workspaces/${encodeURIComponent(orgId)}/workflows/${encodeURIComponent(
              workflowId
            )}`
          )
          return
        }
        if (!response.ok) return
        const payload = (await response.json().catch(() => null)) as MembersResponse | null
        if (!active) return
        setMembers(payload?.members ?? [])
      } catch {
        if (!active) return
      }
    }
    loadMembers()
    return () => {
      active = false
    }
  }, [isAdmin, orgId, router, workflowId])

  useEffect(() => {
    let active = true
    const loadRuns = async () => {
      setRunsLoading(true)
      setRunsError(null)
      setRunsRequestId(null)
      try {
        const response = await fetch(
          `/api/orgs/${encodeURIComponent(orgId)}/workflows/${encodeURIComponent(workflowId)}/runs?limit=10`,
          { cache: 'no-store' }
        )
        if (response.status === 401) {
          router.replace(
            `/signin?next=/dashboard/workspaces/${encodeURIComponent(orgId)}/workflows/${encodeURIComponent(
              workflowId
            )}`
          )
          return
        }
        const payload = (await response.json().catch(() => null)) as RunListResponse | null
        if (!response.ok || !payload) {
          setRunsRequestId(response.headers.get('x-trope-request-id'))
          throw new Error('Unable to load runs.')
        }
        if (!active) return
        setRuns(payload.runs ?? [])
      } catch (err) {
        if (!active) return
        setRunsError(err instanceof Error ? err.message : 'Unable to load runs.')
      } finally {
        if (active) {
          setRunsLoading(false)
        }
      }
    }
    loadRuns()
    return () => {
      active = false
    }
  }, [orgId, workflowId, router])

  const memberMap = useMemo(() => {
    const map: Record<string, string> = {}
    for (const member of members) {
      map[member.user_id] = formatMemberLabel(member)
    }
    return map
  }, [members])

  const selectedVersion = useMemo(
    () => versions.find((version) => version.version_id === selectedVersionId) ?? null,
    [versions, selectedVersionId]
  )
  const guidePageHref = useMemo(() => {
    const base = `/dashboard/workflows/${encodeURIComponent(workflowId)}/guide`
    if (!selectedVersionId) return base
    return `${base}?versionId=${encodeURIComponent(selectedVersionId)}`
  }, [workflowId, selectedVersionId])

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
          )}/versions/${encodeURIComponent(selectedVersionId)}/guide-spec`,
          { cache: 'no-store' }
        )
        if (!response.ok) {
          throw new Error('Guide spec is not available for this version.')
        }
        const specJson = (await response.json().catch(() => null)) as GuideSpec | null
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

  useEffect(() => {
    if (!csrfToken) return
    const sendView = async () => {
      try {
        await fetch(
          `/api/orgs/${encodeURIComponent(orgId)}/workflows/${encodeURIComponent(workflowId)}/events`,
          {
            method: 'POST',
            headers: {
              'content-type': 'application/json',
              'x-csrf-token': csrfToken,
            },
            body: JSON.stringify({ event_type: 'workflow_viewed' }),
          }
        )
      } catch {
        // Ignore view tracking failures.
      }
    }
    sendView()
  }, [csrfToken, orgId, workflowId])

  useEffect(() => {
    if (!shareId) {
      setShareUrl(null)
      return
    }
    if (typeof window !== 'undefined') {
      setShareUrl(`${window.location.origin}/share/${shareId}`)
    }
  }, [shareId])

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
    setRequestId(null)
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
        | { share?: { share_id?: string }; message?: string }
        | null
      if (!response.ok) {
        setRequestId(response.headers.get('x-trope-request-id'))
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

  const updateWorkflow = async (payload: Record<string, unknown>) => {
    if (!csrfToken) return
    setSettingsSaving(true)
    setSettingsError(null)
    setSettingsMessage(null)
    setSettingsRequestId(null)
    try {
      const response = await fetch(
        `/api/orgs/${encodeURIComponent(orgId)}/workflows/${encodeURIComponent(workflowId)}`,
        {
          method: 'PATCH',
          headers: {
            'content-type': 'application/json',
            'x-csrf-token': csrfToken,
          },
          body: JSON.stringify(payload),
        }
      )
      if (!response.ok) {
        setSettingsRequestId(response.headers.get('x-trope-request-id'))
        throw new Error('Unable to update workflow.')
      }
      const data = (await response.json().catch(() => null)) as WorkflowDetailResponse | null
      if (data?.workflow) {
        setWorkflow(data.workflow)
        setExpectedCadence(data.workflow.expected_run_cadence ?? 'on_demand')
        setExpectedCadenceDays(
          typeof data.workflow.expected_run_cadence_days === 'number'
            ? String(data.workflow.expected_run_cadence_days)
            : ''
        )
        setReviewCadenceDays(
          typeof data.workflow.review_cadence_days === 'number'
            ? String(data.workflow.review_cadence_days)
            : ''
        )
        setCriticality(data.workflow.criticality ?? 'medium')
        setOwnerUserId(data.workflow.owner_user_id ?? '')
        setMaintainerIds(data.workflow.maintainer_user_ids ?? [])
        setContexts((data.workflow.contexts ?? []).join(', '))
        setRequiredFlag(data.workflow.required ?? false)
      }
      setSettingsMessage('Settings saved.')
    } catch (err) {
      setSettingsError(err instanceof Error ? err.message : 'Unable to update workflow.')
    } finally {
      setSettingsSaving(false)
    }
  }

  const handleSettingsSave = async () => {
    const cadenceDays = Number(expectedCadenceDays)
    const reviewDays = Number(reviewCadenceDays)
    const contextsList = contexts
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean)
    await updateWorkflow({
      expected_run_cadence: expectedCadence,
      expected_run_cadence_days:
        Number.isFinite(cadenceDays) && cadenceDays > 0 ? cadenceDays : null,
      review_cadence_days: Number.isFinite(reviewDays) && reviewDays > 0 ? reviewDays : null,
      criticality,
      owner_user_id: ownerUserId || null,
      maintainer_user_ids: maintainerIds,
      contexts: contextsList,
      required: requiredFlag,
    })
  }

  const handleRequestReview = async () => updateWorkflow({ action: 'request_review' })
  const handleApprove = async () => updateWorkflow({ action: 'approve' })
  const handleMarkReviewed = async () => updateWorkflow({ action: 'mark_reviewed' })

  const handleArchive = async () => {
    if (!csrfToken) return
    const confirmed = window.confirm('Archive this workflow? This hides it from the active library.')
    if (!confirmed) return
    setPendingAction('archive')
    setActionError(null)
    setActionMessage(null)
    setRequestId(null)
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
        setRequestId(response.headers.get('x-trope-request-id'))
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

  const toggleMaintainer = (userId: string) => {
    setMaintainerIds((prev) =>
      prev.includes(userId) ? prev.filter((value) => value !== userId) : [...prev, userId]
    )
  }

  const copyText = async (value?: string | null) => {
    if (!value) return
    try {
      await navigator.clipboard.writeText(value)
    } catch {
      // ignore
    }
  }

  const failedRuns = useMemo(
    () => runs.filter((run) => run.status.toLowerCase() === 'failed'),
    [runs]
  )

  const errorClusters = useMemo(() => {
    const counts = new Map<string, number>()
    for (const run of failedRuns) {
      const key = run.error_code || run.error_summary || 'Unknown error'
      counts.set(key, (counts.get(key) ?? 0) + 1)
    }
    return Array.from(counts.entries())
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count)
  }, [failedRuns])

  if (loading) {
    return <Card className="p-6 text-sm text-slate-600">Loading workflow…</Card>
  }

  if (error || !workflow) {
    return (
      <Card className="border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
        {error ?? 'Unable to load workflow.'}
        {requestId && (
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-rose-600">
            <span>Request ID: {requestId}</span>
            <button
              onClick={() => copyText(requestId)}
              className="rounded-full border border-rose-200 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-rose-600"
            >
              Copy
            </button>
          </div>
        )}
      </Card>
    )
  }

  const runStats = workflow.run_stats_7d
  const successRate =
    typeof workflow.success_rate_7d === 'number'
      ? `${Math.round(workflow.success_rate_7d * 100)}%`
      : '-'
  const metrics = workflow.metrics_7d
  const cadenceDays = resolveCadenceDays(
    workflow.expected_run_cadence,
    workflow.expected_run_cadence_days
  )
  const nextRunDue = (() => {
    if (!cadenceDays) return null
    if (!workflow.last_success_at) return null
    const last = new Date(workflow.last_success_at)
    if (Number.isNaN(last.getTime())) return null
    const due = new Date(last)
    due.setUTCDate(due.getUTCDate() + cadenceDays)
    return due
  })()
  const isRunOverdue = nextRunDue ? Date.now() > nextRunDue.getTime() : false
  const reviewDue = (() => {
    if (!workflow.review_cadence_days) return null
    if (!workflow.last_reviewed_at) return null
    const last = new Date(workflow.last_reviewed_at)
    if (Number.isNaN(last.getTime())) return null
    const due = new Date(last)
    due.setUTCDate(due.getUTCDate() + workflow.review_cadence_days)
    return due
  })()
  const isReviewOverdue = reviewDue ? Date.now() > reviewDue.getTime() : false
  const ownerLabel = ownerUserId ? memberMap[ownerUserId] ?? ownerUserId : 'Unassigned'
  const maintainerLabels = maintainerIds.map((id) => memberMap[id] ?? id)
  const contextLabel = (workflow.contexts ?? []).join(', ')

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold text-slate-900">
              {workflow.title || workflow.workflow_id}
            </h1>
            <Badge variant={statusVariant(workflow.status)}>{formatStatus(workflow.status)}</Badge>
            <Badge variant={healthVariant(workflow.health_state)}>
              {workflow.health_state ?? 'unknown'}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-slate-600">
            Created {formatDate(workflow.created_at)} · Updated {formatDate(workflow.updated_at)}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleCopyWorkflowId}>
            Copy workflow ID
          </Button>
          {isAdmin && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleCreateShare}
              disabled={!csrfToken || pendingAction === 'share' || !selectedVersionId}
            >
              Create share link
            </Button>
          )}
          {isAdmin && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleArchive}
              disabled={!csrfToken || pendingAction === 'archive'}
            >
              Archive
            </Button>
          )}
          <Link
            href={`/dashboard/workspaces/${encodeURIComponent(orgId)}/workflows`}
            className="text-xs font-semibold text-[color:var(--trope-accent)] hover:text-[color:var(--trope-accent)]/80"
          >
            Back to workflows
          </Link>
        </div>
      </div>

      {(actionError || actionMessage) && (
        <Card
          className={`px-4 py-3 text-sm ${
            actionError
              ? 'border-rose-200 bg-rose-50 text-rose-700'
              : 'border-emerald-200 bg-emerald-50 text-emerald-700'
          }`}
        >
          {actionError ?? actionMessage}
          {requestId && actionError && (
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-rose-600">
              <span>Request ID: {requestId}</span>
              <button
                onClick={() => copyText(requestId)}
                className="rounded-full border border-rose-200 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-rose-600"
              >
                Copy
              </button>
            </div>
          )}
        </Card>
      )}

      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">Operational health</h2>
            <Badge variant={healthVariant(workflow.health_state)}>
              {workflow.health_state ?? 'unknown'}
            </Badge>
          </div>
          <div className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
            <div>
              <div className="text-xs uppercase tracking-wide text-slate-400">Last run</div>
              <div className="text-slate-900">{formatDateTime(workflow.last_run_at)}</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide text-slate-400">Last success</div>
              <div className="text-slate-900">{formatDateTime(workflow.last_success_at)}</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide text-slate-400">Success rate (7d)</div>
              <div className="text-slate-900">{successRate}</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide text-slate-400">Runs (7d)</div>
              <div className="text-slate-900">{runStats?.total ?? '-'}</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide text-slate-400">Views (7d)</div>
              <div className="text-slate-900">{metrics?.views ?? 0}</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide text-slate-400">Guided starts (7d)</div>
              <div className="text-slate-900">{metrics?.guided_starts ?? 0}</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide text-slate-400">Guided completions (7d)</div>
              <div className="text-slate-900">{metrics?.guided_completions ?? 0}</div>
            </div>
          </div>
          <div className="mt-4 text-xs text-slate-500">
            Cadence: {formatCadenceLabel(workflow.expected_run_cadence, workflow.expected_run_cadence_days)}
            {nextRunDue && (
              <span className={isRunOverdue ? 'text-rose-600' : ''}>
                {' · Next run due '}
                {formatDate(nextRunDue.toISOString())}
              </span>
            )}
            {!nextRunDue && cadenceDays && <span> · Next run due unavailable</span>}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">Governance</h2>
            {workflow.required && <Badge variant="warning">Required</Badge>}
          </div>
          <div className="mt-4 grid gap-3 text-sm text-slate-600">
            <div>
              <div className="text-xs uppercase tracking-wide text-slate-400">Owner</div>
              <div className="text-slate-900">{ownerLabel}</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide text-slate-400">Maintainers</div>
              <div className="text-slate-900">
                {maintainerLabels.length ? maintainerLabels.join(', ') : '-'}
              </div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide text-slate-400">Criticality</div>
              <div className="text-slate-900">{workflow.criticality ?? 'medium'}</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide text-slate-400">Contexts</div>
              <div className="text-slate-900">{contextLabel || '-'}</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide text-slate-400">Review cadence</div>
              <div className="text-slate-900">
                {workflow.review_cadence_days ? `${workflow.review_cadence_days} days` : '-'}
              </div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide text-slate-400">Last reviewed</div>
              <div className="text-slate-900">{formatDate(workflow.last_reviewed_at)}</div>
            </div>
            {reviewDue && (
              <div>
                <div className="text-xs uppercase tracking-wide text-slate-400">Review due</div>
                <div className={isReviewOverdue ? 'text-rose-600 text-sm' : 'text-slate-900'}>
                  {formatDate(reviewDue.toISOString())}
                </div>
              </div>
            )}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {workflow.status !== 'review' && isAdmin && (
              <Button variant="secondary" size="sm" onClick={handleRequestReview}>
                Request review
              </Button>
            )}
            {workflow.status === 'review' && isAdmin && (
              <Button variant="primary" size="sm" onClick={handleApprove}>
                Approve publish
              </Button>
            )}
            {isAdmin && (
              <Button variant="outline" size="sm" onClick={handleMarkReviewed}>
                Mark reviewed
              </Button>
            )}
          </div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-[0.65fr_1.35fr]">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">Settings</h2>
            {settingsMessage && <span className="text-xs text-emerald-600">{settingsMessage}</span>}
          </div>
          {settingsError && (
            <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
              {settingsError}
              {settingsRequestId && (
                <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-rose-600">
                  <span>Request ID: {settingsRequestId}</span>
                  <button
                    onClick={() => copyText(settingsRequestId)}
                    className="rounded-full border border-rose-200 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-rose-600"
                  >
                    Copy
                  </button>
                </div>
              )}
            </div>
          )}
          <div className="mt-4 grid gap-4 text-sm text-slate-700">
            <label className="space-y-2">
              <span className="text-xs uppercase tracking-wide text-slate-400">Expected run cadence</span>
              <select
                value={expectedCadence}
                onChange={(event) => setExpectedCadence(event.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              >
                <option value="on_demand">On demand</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="custom">Custom</option>
              </select>
            </label>
            {expectedCadence === 'custom' && (
              <label className="space-y-2">
                <span className="text-xs uppercase tracking-wide text-slate-400">Custom cadence (days)</span>
                <Input
                  value={expectedCadenceDays}
                  onChange={(event) => setExpectedCadenceDays(event.target.value)}
                  placeholder="e.g. 10"
                />
              </label>
            )}
            <label className="space-y-2">
              <span className="text-xs uppercase tracking-wide text-slate-400">Review cadence (days)</span>
              <Input
                value={reviewCadenceDays}
                onChange={(event) => setReviewCadenceDays(event.target.value)}
                placeholder="e.g. 30"
              />
            </label>
            <label className="space-y-2">
              <span className="text-xs uppercase tracking-wide text-slate-400">Criticality</span>
              <select
                value={criticality}
                onChange={(event) => setCriticality(event.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </label>
            <label className="space-y-2">
              <span className="text-xs uppercase tracking-wide text-slate-400">Owner</span>
              {members.length > 0 ? (
                <select
                  value={ownerUserId}
                  onChange={(event) => setOwnerUserId(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                >
                  <option value="">Unassigned</option>
                  {members
                    .filter((member) => member.status === 'active')
                    .map((member) => (
                      <option key={member.user_id} value={member.user_id}>
                        {formatMemberLabel(member)}
                      </option>
                    ))}
                </select>
              ) : (
                <Input
                  value={ownerUserId}
                  onChange={(event) => setOwnerUserId(event.target.value)}
                  placeholder="Owner user ID"
                />
              )}
            </label>
            <div className="space-y-2">
              <span className="text-xs uppercase tracking-wide text-slate-400">Maintainers</span>
              {members.length > 0 ? (
                <div className="grid gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-xs">
                  {members
                    .filter((member) => member.status === 'active')
                    .map((member) => (
                      <label key={member.user_id} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          className="h-3.5 w-3.5 rounded border-slate-300"
                          checked={maintainerIds.includes(member.user_id)}
                          onChange={() => toggleMaintainer(member.user_id)}
                        />
                        <span>{formatMemberLabel(member)}</span>
                      </label>
                    ))}
                  {members.length === 0 && <span>No active members found.</span>}
                </div>
              ) : (
                <Input
                  value={maintainerIds.join(', ')}
                  onChange={(event) =>
                    setMaintainerIds(
                      event.target.value
                        .split(',')
                        .map((value) => value.trim())
                        .filter(Boolean)
                    )
                  }
                  placeholder="Maintainer user IDs, comma separated"
                />
              )}
            </div>
            <label className="space-y-2">
              <span className="text-xs uppercase tracking-wide text-slate-400">Contexts</span>
              <Input
                value={contexts}
                onChange={(event) => setContexts(event.target.value)}
                placeholder="e.g. workday.com, Salesforce, com.apple.Calendar"
              />
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300"
                checked={requiredFlag}
                onChange={(event) => setRequiredFlag(event.target.checked)}
              />
              Required workflow
            </label>
          </div>
          <div className="mt-4 flex justify-end">
            <Button variant="primary" size="md" onClick={handleSettingsSave} disabled={settingsSaving || !isAdmin}>
              {settingsSaving ? 'Saving…' : 'Save settings'}
            </Button>
          </div>
          {!isAdmin && (
            <div className="mt-3 text-xs text-amber-600">Admin access required to edit settings.</div>
          )}
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">Run history</h2>
            <Link
              href={`/dashboard/workspaces/${encodeURIComponent(orgId)}/runs?workflow_id=${encodeURIComponent(
                workflowId
              )}`}
              className="text-xs font-semibold text-[color:var(--trope-accent)] hover:text-[color:var(--trope-accent)]/80"
            >
              View all runs
            </Link>
          </div>
          {failedRuns.length >= 3 && (
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Repeated failures detected in recent runs. Consider reviewing or recapturing this workflow.
            </div>
          )}
          {errorClusters.length > 0 && (
            <div className="mt-4 text-xs text-slate-500">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                Top failure signals
              </div>
              <div className="mt-2 space-y-1">
                {errorClusters.slice(0, 3).map((cluster) => (
                  <div key={cluster.label} className="flex items-center justify-between">
                    <span className="text-slate-600">{cluster.label}</span>
                    <span className="text-slate-400">{cluster.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {runsLoading && <div className="mt-4 text-sm text-slate-500">Loading runs…</div>}
          {runsError && (
            <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {runsError}
              {runsRequestId && (
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-rose-600">
                  <span>Request ID: {runsRequestId}</span>
                  <button
                    onClick={() => copyText(runsRequestId)}
                    className="rounded-full border border-rose-200 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-rose-600"
                  >
                    Copy
                  </button>
                </div>
              )}
            </div>
          )}
          {!runsLoading && !runsError && runs.length === 0 && (
            <div className="mt-4 text-sm text-slate-500">No runs logged yet.</div>
          )}
          {!runsLoading && runs.length > 0 && (
            <div className="mt-4 overflow-x-auto">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeaderCell>Status</TableHeaderCell>
                    <TableHeaderCell>Started</TableHeaderCell>
                    <TableHeaderCell>Duration</TableHeaderCell>
                    <TableHeaderCell>Actor</TableHeaderCell>
                    <TableHeaderCell>Steps</TableHeaderCell>
                    <TableHeaderCell>Error</TableHeaderCell>
                  </TableRow>
                </TableHead>
                <tbody>
                  {runs.map((run) => (
                    <TableRow key={run.run_id}>
                      <TableCell>
                        <Badge variant={runStatusVariant(run.status)}>{run.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-slate-700">{formatDateTime(run.started_at)}</div>
                        <div className="text-xs text-slate-400">{run.run_id}</div>
                      </TableCell>
                      <TableCell>{formatDuration(run.duration_ms)}</TableCell>
                      <TableCell>{run.actor_email ?? run.actor_user_id ?? '-'}</TableCell>
                      <TableCell>
                        {run.steps_total
                          ? `${run.steps_completed ?? 0}/${run.steps_total}`
                          : '-'}
                      </TableCell>
                      <TableCell>{run.error_summary ?? '-'}</TableCell>
                    </TableRow>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="p-6">
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
                    ? 'border-[color:var(--trope-accent)] bg-[color:var(--trope-accent)]/5'
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
          {shareId && (
            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
              <div className="text-xs uppercase tracking-wide text-slate-400">Share link</div>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs">{shareUrl ?? shareId}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigator.clipboard.writeText(shareUrl ?? shareId)}
                >
                  Copy
                </Button>
              </div>
            </div>
          )}
        </Card>

        <Card className="p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-base font-semibold text-slate-900">Guide preview</h2>
              <Link
                href={guidePageHref}
                className="text-xs font-semibold text-[color:var(--trope-accent)] hover:underline"
              >
                Open guide
              </Link>
            </div>
            {selectedVersion && (
              <div className="text-xs text-slate-500">Version {selectedVersion.version_id}</div>
            )}
          </div>

          {specLoading && <div className="mt-4 text-sm text-slate-500">Loading guide spec…</div>}

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
                          <Badge variant="info" className="text-[10px]">
                            {kindLabel}
                          </Badge>
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
        </Card>
      </div>
    </div>
  )
}

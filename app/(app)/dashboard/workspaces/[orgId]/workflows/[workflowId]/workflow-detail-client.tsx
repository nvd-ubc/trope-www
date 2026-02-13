'use client'

import { useEffect, useMemo, useState } from 'react'
import { MoreHorizontal } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Badge from '@/components/ui/badge'
import Button from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'
import Card from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field'
import { InputGroup, InputGroupInput } from '@/components/ui/input-group'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Table, TableCell, TableHead, TableHeaderCell, TableRow } from '@/components/ui/table'
import { useCsrfToken } from '@/lib/client/use-csrf-token'
import { ErrorNotice, PageHeader } from '@/components/dashboard'
import { getRadarPercent } from '@/lib/guide-editor'
import {
  formatCaptureTimestamp,
  resolveStepImageVariant,
  shouldRenderStepRadar,
  type GuideMediaStepImage as StepImage,
} from '@/lib/guide-media'

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

type GuideMedia = {
  step_images: StepImage[]
}

type WorkflowDetailResponse = {
  workflow: WorkflowDefinition
  latest_version?: WorkflowVersion | null
}

type VersionDetailResponse = {
  version: WorkflowVersion & {
    guide_media?: GuideMedia | null
  }
}

type VersionsResponse = {
  versions: WorkflowVersion[]
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

const toTitleCase = (value: string) =>
  value
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

const formatStatus = (status?: string | null) => {
  if (!status) return 'Unknown'
  return toTitleCase(status.replace(/_/g, ' '))
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
  const [versionDetail, setVersionDetail] = useState<VersionDetailResponse['version'] | null>(null)
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
  const activeMembers = useMemo(
    () => members.filter((member) => member.status === 'active'),
    [members]
  )

  const selectedVersion = useMemo(
    () => versions.find((version) => version.version_id === selectedVersionId) ?? null,
    [versions, selectedVersionId]
  )
  const stepImageMap = useMemo(() => {
    const map: Record<string, StepImage> = {}
    const images = versionDetail?.guide_media?.step_images ?? []
    for (const image of images) {
      if (image?.step_id) {
        map[image.step_id] = image
      }
    }
    return map
  }, [versionDetail?.guide_media?.step_images])
  const guidePageHref = useMemo(() => {
    const base = `/dashboard/workflows/${encodeURIComponent(workflowId)}/guide`
    if (!selectedVersionId) return base
    return `${base}?versionId=${encodeURIComponent(selectedVersionId)}`
  }, [workflowId, selectedVersionId])

  useEffect(() => {
    if (!selectedVersionId) {
      setSpec(null)
      setVersionDetail(null)
      return
    }

    let active = true
    const loadSpec = async () => {
      setSpecLoading(true)
      setSpecError(null)
      try {
        const [specResponse, versionResponse] = await Promise.all([
          fetch(
            `/api/orgs/${encodeURIComponent(orgId)}/workflows/${encodeURIComponent(
              workflowId
            )}/versions/${encodeURIComponent(selectedVersionId)}/guide-spec`,
            { cache: 'no-store' }
          ),
          fetch(
            `/api/orgs/${encodeURIComponent(orgId)}/workflows/${encodeURIComponent(
              workflowId
            )}/versions/${encodeURIComponent(selectedVersionId)}`,
            { cache: 'no-store' }
          ),
        ])
        if (!specResponse.ok) {
          throw new Error('Guide spec is not available for this version.')
        }
        if (!versionResponse.ok) {
          throw new Error('Version detail is unavailable for this version.')
        }

        const specJson = (await specResponse.json().catch(() => null)) as GuideSpec | null
        if (!specJson) {
          throw new Error('Guide spec is empty.')
        }
        const versionJson = (await versionResponse.json().catch(() => null)) as VersionDetailResponse | null
        if (!versionJson?.version) {
          throw new Error('Version detail is unavailable for this version.')
        }
        if (!active) return
        setSpec(specJson)
        setVersionDetail(versionJson.version)
      } catch (err) {
        if (!active) return
        setSpec(null)
        setVersionDetail(null)
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
      setActionMessage('Workflow reference copied.')
    } catch {
      setActionError('Unable to copy workflow reference.')
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
    return <Card className="p-6 text-sm text-muted-foreground">Loading workflow…</Card>
  }

  if (error || !workflow) {
    return (
      <ErrorNotice
        title="Unable to load workflow"
        message={error ?? 'Unable to load workflow.'}
        requestId={requestId}
        onCopyRequestId={(value) => copyText(value)}
      />
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
  const ownerLabel = ownerUserId ? memberMap[ownerUserId] ?? 'Assigned member' : 'Unassigned'
  const maintainerLabels = maintainerIds
    .map((id) => memberMap[id])
    .filter((value): value is string => Boolean(value))
  const maintainerSummary = maintainerLabels.length
    ? maintainerLabels.join(', ')
    : maintainerIds.length
      ? `${maintainerIds.length} teammate${maintainerIds.length === 1 ? '' : 's'}`
      : '-'
  const contextLabel = (workflow.contexts ?? []).join(', ')
  const selectedVersionIndex = selectedVersion
    ? versions.findIndex((version) => version.version_id === selectedVersion.version_id)
    : -1
  const selectedVersionLabel = selectedVersion
    ? `${selectedVersionIndex >= 0 ? `Release ${selectedVersionIndex + 1} · ` : ''}${formatDate(selectedVersion.created_at)}`
    : null

  return (
    <div className="space-y-6">
      <PageHeader
        title={workflow.title || 'Untitled workflow'}
        description={`Created ${formatDate(workflow.created_at)} · Updated ${formatDate(workflow.updated_at)}`}
        badges={
          <>
            <Badge variant={statusVariant(workflow.status)}>{formatStatus(workflow.status)}</Badge>
            <Badge variant={healthVariant(workflow.health_state)}>
              {formatStatus(workflow.health_state ?? 'unknown')}
            </Badge>
          </>
        }
        actions={
          <>
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon-sm" aria-label="Workflow actions">
                  <MoreHorizontal />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onSelect={(event) => {
                    event.preventDefault()
                    void handleCopyWorkflowId()
                  }}
                >
                  Copy workflow reference
                </DropdownMenuItem>
                {isAdmin && <DropdownMenuSeparator />}
                {isAdmin && (
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    disabled={!csrfToken || pendingAction === 'archive'}
                    onSelect={(event) => {
                      event.preventDefault()
                      void handleArchive()
                    }}
                  >
                    Archive workflow
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        }
        backHref={`/dashboard/workspaces/${encodeURIComponent(orgId)}/workflows`}
        backLabel="Back to workflows"
      />

      {(actionError || actionMessage) && (
        <Card
          className={`px-4 py-3 text-sm ${
            actionError
              ? 'border-destructive/20 bg-destructive/10 text-destructive'
              : 'border-emerald-200 bg-emerald-50 text-emerald-700'
          }`}
        >
          {actionError ?? actionMessage}
          {requestId && actionError && (
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-destructive/80">
              <span>Request ID: {requestId}</span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-6 px-2 text-[10px] uppercase tracking-wide"
                onClick={() => copyText(requestId)}
              >
                Copy
              </Button>
            </div>
          )}
        </Card>
      )}

      <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">Operational health</h2>
            <Badge variant={healthVariant(workflow.health_state)}>
              {formatStatus(workflow.health_state ?? 'unknown')}
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
          <div className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-2 sm:gap-x-6">
            <div>
              <div className="text-xs uppercase tracking-wide text-slate-400">Owner</div>
              <div className="text-slate-900">{ownerLabel}</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide text-slate-400">Maintainers</div>
              <div className="text-slate-900">{maintainerSummary}</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide text-slate-400">Criticality</div>
              <div className="text-slate-900">{formatStatus(workflow.criticality ?? 'medium')}</div>
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
          {(workflow.status !== 'review' || isAdmin) && (
            <div className="mt-4 flex flex-wrap gap-2">
              <ButtonGroup>
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
              </ButtonGroup>
            </div>
          )}
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
        <div className="space-y-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-foreground">Settings</h2>
            {settingsMessage && <span className="text-xs text-emerald-600">{settingsMessage}</span>}
          </div>
          {settingsError && (
            <div className="mt-3 rounded-xl border border-destructive/20 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {settingsError}
              {settingsRequestId && (
                <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-destructive/80">
                  <span>Request ID: {settingsRequestId}</span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-6 px-2 text-[10px] uppercase tracking-wide"
                    onClick={() => copyText(settingsRequestId)}
                  >
                    Copy
                  </Button>
                </div>
              )}
            </div>
          )}
          <FieldGroup className="mt-4 gap-4 text-sm text-foreground">
            <Field>
              <FieldLabel htmlFor="expected-run-cadence">Expected run cadence</FieldLabel>
              <Select value={expectedCadence} onValueChange={setExpectedCadence}>
                <SelectTrigger id="expected-run-cadence" className="w-full">
                  <SelectValue placeholder="On demand" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="on_demand">On demand</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            {expectedCadence === 'custom' && (
              <Field>
                <FieldLabel htmlFor="custom-cadence-days">Custom cadence (days)</FieldLabel>
                <InputGroup>
                  <InputGroupInput
                    id="custom-cadence-days"
                    value={expectedCadenceDays}
                    onChange={(event) => setExpectedCadenceDays(event.target.value)}
                    placeholder="e.g. 10"
                  />
                </InputGroup>
              </Field>
            )}
            <Field>
              <FieldLabel htmlFor="review-cadence-days">Review cadence (days)</FieldLabel>
              <InputGroup>
                <InputGroupInput
                  id="review-cadence-days"
                  value={reviewCadenceDays}
                  onChange={(event) => setReviewCadenceDays(event.target.value)}
                  placeholder="e.g. 30"
                />
              </InputGroup>
            </Field>
            <Field>
              <FieldLabel htmlFor="workflow-criticality">Criticality</FieldLabel>
              <Select value={criticality} onValueChange={setCriticality}>
                <SelectTrigger id="workflow-criticality" className="w-full">
                  <SelectValue placeholder="Medium" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel htmlFor="workflow-owner">Owner</FieldLabel>
              {members.length > 0 ? (
                <Select
                  value={ownerUserId || '__owner_unassigned'}
                  onValueChange={(value) => setOwnerUserId(value === '__owner_unassigned' ? '' : value)}
                >
                  <SelectTrigger id="workflow-owner" className="w-full">
                    <SelectValue placeholder="Unassigned" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__owner_unassigned">Unassigned</SelectItem>
                    {activeMembers.map((member) => (
                      <SelectItem key={member.user_id} value={member.user_id}>
                        {formatMemberLabel(member)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <InputGroup>
                  <InputGroupInput
                    id="workflow-owner"
                    value={ownerUserId}
                    onChange={(event) => setOwnerUserId(event.target.value)}
                    placeholder="Owner user ID"
                  />
                </InputGroup>
              )}
            </Field>
            <Field>
              <FieldLabel>Maintainers</FieldLabel>
              {members.length > 0 ? (
                <div className="rounded-xl border border-border bg-muted/40 px-3 py-3 text-xs">
                  <ScrollArea className="h-40 pr-2">
                    <div className="grid gap-2">
                      {activeMembers.map((member) => (
                        <label key={member.user_id} className="flex items-center gap-2">
                          <Checkbox
                            checked={maintainerIds.includes(member.user_id)}
                            onCheckedChange={() => toggleMaintainer(member.user_id)}
                          />
                          <span>{formatMemberLabel(member)}</span>
                        </label>
                      ))}
                    </div>
                  </ScrollArea>
                  {activeMembers.length === 0 && <span>No active members found.</span>}
                </div>
              ) : (
                <InputGroup>
                  <InputGroupInput
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
                </InputGroup>
              )}
            </Field>
            <Field>
              <FieldLabel htmlFor="workflow-contexts">Contexts</FieldLabel>
              <InputGroup>
                <InputGroupInput
                  id="workflow-contexts"
                  value={contexts}
                  onChange={(event) => setContexts(event.target.value)}
                  placeholder="e.g. workday.com, Salesforce, com.apple.Calendar"
                />
              </InputGroup>
            </Field>
            <Field>
              <label className="flex items-center gap-2 text-sm text-foreground">
                <Checkbox
                  checked={requiredFlag}
                  onCheckedChange={(checked) => setRequiredFlag(checked === true)}
                />
                Required workflow
              </label>
              <FieldDescription>Required workflows are tracked in compliance reporting.</FieldDescription>
            </Field>
          </FieldGroup>
          <div className="mt-4 flex justify-end">
            <ButtonGroup>
              <Button
                variant="primary"
                size="md"
                onClick={handleSettingsSave}
                disabled={settingsSaving || !isAdmin}
              >
                {settingsSaving ? 'Saving…' : 'Save settings'}
              </Button>
            </ButtonGroup>
          </div>
          {!isAdmin && (
            <div className="mt-3 text-xs text-amber-600">Admin access required to edit settings.</div>
          )}
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-foreground">Run history</h2>
            <Link
              href={`/dashboard/workspaces/${encodeURIComponent(orgId)}/runs?workflow_id=${encodeURIComponent(
                workflowId
              )}`}
              className="text-xs font-semibold text-primary hover:text-primary/80"
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
            <div className="mt-4 text-xs text-muted-foreground">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Top failure signals
              </div>
              <div className="mt-2 space-y-1">
                {errorClusters.slice(0, 3).map((cluster) => (
                  <div key={cluster.label} className="flex items-center justify-between">
                    <span className="text-muted-foreground">{cluster.label}</span>
                    <span className="text-muted-foreground">{cluster.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {runsLoading && <div className="mt-4 text-sm text-muted-foreground">Loading runs…</div>}
          {runsError && (
            <div className="mt-4 rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {runsError}
              {runsRequestId && (
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-destructive/80">
                  <span>Request ID: {runsRequestId}</span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-6 px-2 text-[10px] uppercase tracking-wide"
                    onClick={() => copyText(runsRequestId)}
                  >
                    Copy
                  </Button>
                </div>
              )}
            </div>
          )}
          {!runsLoading && !runsError && runs.length === 0 && (
            <div className="mt-4 text-sm text-muted-foreground">No runs logged yet.</div>
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
                        <Badge variant={runStatusVariant(run.status)}>{formatStatus(run.status)}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-slate-700">{formatDateTime(run.started_at)}</div>
                      </TableCell>
                      <TableCell>{formatDuration(run.duration_ms)}</TableCell>
                      <TableCell>{run.actor_email ?? (run.actor_user_id ? 'Team member' : '-')}</TableCell>
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

        <div className="space-y-4">
        <Card className="p-6">
          <h2 className="text-base font-semibold text-foreground">Versions</h2>
          {versions.length === 0 && (
            <div className="mt-4 text-sm text-muted-foreground">No versions yet.</div>
          )}
          <div className="mt-4 space-y-3">
            {versions.map((version, index) => {
              const isPublishedStatus = (version.status ?? '').trim().toLowerCase() === 'published'
              const releaseMeta = [
                formatDate(version.created_at),
                typeof version.steps_count === 'number' ? `${version.steps_count} steps` : 'Steps unknown',
                version.created_by ? `Published by ${memberMap[version.created_by] ?? 'team member'}` : null,
                version.status && !isPublishedStatus ? formatStatus(version.status) : null,
              ]
                .filter((value): value is string => Boolean(value))
                .join(' · ')

              return (
                <Button
                  key={version.version_id}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedVersionId(version.version_id)}
                  className={`h-auto w-full rounded-xl border px-4 py-3 text-left text-sm transition ${
                    selectedVersionId === version.version_id
                      ? 'border-[color:var(--trope-accent)] bg-[color:var(--trope-accent)]/5'
                      : 'border-border bg-card hover:border-border/80'
                  }`}
                >
                  <div className="flex min-h-10 flex-wrap items-center justify-start gap-x-2 gap-y-1 leading-tight">
                    <span className="font-semibold text-foreground">Release {index + 1}</span>
                    <span className="text-sm text-muted-foreground">{releaseMeta}</span>
                  </div>
                </Button>
              )
            })}
          </div>
          {shareId && (
            <div className="mt-4 rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm text-foreground">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">Share link</div>
              {shareUrl ? (
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="break-all font-mono text-xs">{shareUrl}</span>
                  <Button variant="outline" size="sm" onClick={() => copyText(shareUrl)}>
                    Copy
                  </Button>
                </div>
              ) : (
                <div className="mt-2 text-xs text-muted-foreground">
                  Share URL unavailable. Create a new share link to continue.
                </div>
              )}
            </div>
          )}
        </Card>

        <Card className="p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-base font-semibold text-foreground">Guide preview</h2>
              <Link
                href={guidePageHref}
                className="text-xs font-semibold text-primary hover:underline"
              >
                Open guide
              </Link>
            </div>
            {selectedVersion && (
              <div className="text-xs text-muted-foreground">{selectedVersionLabel}</div>
            )}
          </div>

          {specLoading && <div className="mt-4 text-sm text-muted-foreground">Loading guide spec…</div>}

          {specError && (
            <div className="mt-4 rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {specError}
            </div>
          )}

          {!specLoading && !specError && !spec && (
            <div className="mt-4 text-sm text-muted-foreground">Select a version to preview the guide.</div>
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
                  const image = stepImageMap[step.id] ?? null
                  const previewImage = image
                    ? resolveStepImageVariant(image, { surface: 'card', requestedVariant: 'preview' })
                    : null
                  const radar = image?.radar ?? null
                  const radarWidth = previewImage?.width ?? image?.width ?? null
                  const radarHeight = previewImage?.height ?? image?.height ?? null
                  const radarPercent = shouldRenderStepRadar({
                    step,
                    radar,
                    width: radarWidth,
                    height: radarHeight,
                  })
                    ? getRadarPercent(radar, radarWidth, radarHeight)
                    : null
                  const imageAspectRatio =
                    typeof radarWidth === 'number' &&
                    Number.isFinite(radarWidth) &&
                    radarWidth > 0 &&
                    typeof radarHeight === 'number' &&
                    Number.isFinite(radarHeight) &&
                    radarHeight > 0
                      ? `${radarWidth} / ${radarHeight}`
                      : undefined
                  const previewSrc = image
                    ? `/api/orgs/${encodeURIComponent(orgId)}/workflows/${encodeURIComponent(
                        workflowId
                      )}/versions/${encodeURIComponent(selectedVersionId ?? '')}/media/steps/${encodeURIComponent(
                        step.id
                      )}?variant=preview`
                    : null
                  const fullSrc = image
                    ? `/api/orgs/${encodeURIComponent(orgId)}/workflows/${encodeURIComponent(
                        workflowId
                      )}/versions/${encodeURIComponent(selectedVersionId ?? '')}/media/steps/${encodeURIComponent(
                        step.id
                      )}?variant=full`
                    : null
                  const hasImage = Boolean(previewSrc && (previewImage?.downloadUrl || image?.download_url))
                  const captureTimestamp = formatCaptureTimestamp(image?.capture_t_s)

                  return (
                    <div key={step.id} className="rounded-2xl border border-slate-200 bg-white p-5">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <div className="text-xs uppercase tracking-wide text-slate-400">Step {index + 1}</div>
                          <div className="text-sm font-semibold text-slate-900">{step.title}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          {kindLabel && (
                            <Badge variant="info" className="text-[10px]">
                              {kindLabel}
                            </Badge>
                          )}
                          {captureTimestamp && (
                            <Badge variant="neutral" className="text-[10px]">
                              t={captureTimestamp}
                            </Badge>
                          )}
                        </div>
                      </div>
                      {hasImage && previewSrc && fullSrc && (
                        <a
                          href={fullSrc}
                          target="_blank"
                          rel="noreferrer"
                          className="group mt-3 block overflow-hidden rounded-xl border border-slate-200 bg-slate-50"
                        >
                          <div
                            className="relative mx-auto w-full overflow-hidden bg-slate-100"
                            style={imageAspectRatio ? { aspectRatio: imageAspectRatio } : undefined}
                          >
                            <img
                              src={previewSrc}
                              alt={step.title}
                              loading="lazy"
                              className="block max-h-[20rem] w-full object-contain transition group-hover:scale-[1.01]"
                            />
                            {radarPercent && (
                              <div className="pointer-events-none absolute inset-0">
                                <div
                                  className="absolute -translate-x-1/2 -translate-y-1/2"
                                  style={{ left: `${radarPercent.left}%`, top: `${radarPercent.top}%` }}
                                >
                                  <div className="relative h-5 w-5">
                                    <div className="absolute inset-0 rounded-full bg-[color:var(--trope-accent)] opacity-25" />
                                    <div className="absolute inset-[5px] rounded-full bg-[color:var(--trope-accent)] shadow-sm" />
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </a>
                      )}
                      {!hasImage && (
                        <div className="mt-3 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500">
                          No screenshot available for this step.
                        </div>
                      )}
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
    </div>
  )
}

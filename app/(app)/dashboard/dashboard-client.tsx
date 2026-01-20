'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type PlanInfo = {
  name: string
  monthly_credits: number
}

type MeResponse = {
  sub: string
  email?: string | null
  plan: PlanInfo
  personal_org_id?: string | null
  default_org_id?: string | null
  last_desktop_handoff_at?: string | null
}

type UsageResponse = {
  period?: string | null
  credits_limit: number
  credits_used: number
  credits_reserved: number
  prompt_tokens: number
  completion_tokens: number
}

type OrgSummary = {
  org_id: string
  name: string
  role: string
  status: string
  created_at: string
}

type OrgsResponse = {
  orgs: OrgSummary[]
  personal_org_id?: string | null
  default_org_id?: string | null
}

type InviteSummary = {
  org_id: string
  org_name: string
  invite_id: string
  role: string
  created_at: string
  expires_at?: number | null
}

type MeInvitesResponse = {
  invites: InviteSummary[]
}

type OrgInvitesResponse = {
  invites: InviteSummary[]
}

type WorkflowListResponse = {
  workflows: { workflow_id: string }[]
}

type RunsResponse = {
  runs: { run_id: string }[]
}

type ChecklistStep = {
  id: string
  title: string
  description: string
  status: 'todo' | 'blocked' | 'done'
  ctaLabel?: string
  ctaHref?: string
}

const desktopDownloadUrl = process.env.NEXT_PUBLIC_TROPE_DESKTOP_DOWNLOAD_URL || '/download'

export default function DashboardClient() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [me, setMe] = useState<MeResponse | null>(null)
  const [usage, setUsage] = useState<UsageResponse | null>(null)
  const [orgs, setOrgs] = useState<OrgsResponse | null>(null)
  const [invites, setInvites] = useState<InviteSummary[]>([])
  const [onboardingStats, setOnboardingStats] = useState<{
    invitesCount: number | null
    workflowsCount: number | null
    runsCount: number | null
    loading: boolean
  }>({
    invitesCount: null,
    workflowsCount: null,
    runsCount: null,
    loading: false,
  })

  useEffect(() => {
    let active = true
    const fetchData = async () => {
      try {
        const [meRes, usageRes, orgsRes, invitesRes] = await Promise.all([
          fetch('/api/me', { cache: 'no-store' }),
          fetch('/api/usage', { cache: 'no-store' }),
          fetch('/api/orgs', { cache: 'no-store' }),
          fetch('/api/me/invites', { cache: 'no-store' }),
        ])

        if (
          meRes.status === 401 ||
          usageRes.status === 401 ||
          orgsRes.status === 401 ||
          invitesRes.status === 401
        ) {
          router.replace('/signin?next=/dashboard')
          return
        }

        const mePayload = (await meRes.json().catch(() => null)) as MeResponse | null
        const usagePayload = (await usageRes.json().catch(() => null)) as UsageResponse | null
        const orgsPayload = (await orgsRes.json().catch(() => null)) as OrgsResponse | null
        const invitesPayload = (await invitesRes.json().catch(() => null)) as MeInvitesResponse | null

        if (!meRes.ok || !usageRes.ok || !orgsRes.ok || !invitesRes.ok) {
          throw new Error('Unable to load dashboard data.')
        }

        if (!active) return
        setMe(mePayload)
        setUsage(usagePayload)
        setOrgs(orgsPayload)
        setInvites(invitesPayload?.invites ?? [])
        setLoading(false)
      } catch (err) {
        if (!active) return
        setError(err instanceof Error ? err.message : 'Failed to load dashboard.')
        setLoading(false)
      }
    }

    fetchData()
    return () => {
      active = false
    }
  }, [router])

  const defaultOrgValid = useMemo(() => {
    if (!orgs?.default_org_id) return false
    return orgs.orgs?.some((org) => org.org_id === orgs.default_org_id) ?? false
  }, [orgs])

  const activeOrg = useMemo(() => {
    if (!orgs) return null
    const byDefault = orgs.default_org_id
      ? orgs.orgs.find((org) => org.org_id === orgs.default_org_id)
      : null
    if (byDefault) return byDefault
    const byPersonal = orgs.personal_org_id
      ? orgs.orgs.find((org) => org.org_id === orgs.personal_org_id)
      : null
    return byPersonal || orgs.orgs[0] || null
  }, [orgs])

  const isActiveOrgAdmin = useMemo(() => {
    if (!activeOrg?.role) return false
    return activeOrg.role === 'org_owner' || activeOrg.role === 'org_admin'
  }, [activeOrg])

  useEffect(() => {
    let active = true

    const loadOnboardingStats = async () => {
      if (!activeOrg?.org_id) return
      setOnboardingStats({
        invitesCount: isActiveOrgAdmin ? null : 0,
        workflowsCount: null,
        runsCount: null,
        loading: true,
      })

      const requests: Array<Promise<Response>> = []
      if (isActiveOrgAdmin) {
        requests.push(fetch(`/api/orgs/${encodeURIComponent(activeOrg.org_id)}/invites`, { cache: 'no-store' }))
      }
      requests.push(fetch(`/api/orgs/${encodeURIComponent(activeOrg.org_id)}/workflows`, { cache: 'no-store' }))
      requests.push(fetch(`/api/orgs/${encodeURIComponent(activeOrg.org_id)}/runs?limit=1`, { cache: 'no-store' }))

      try {
        const responses = await Promise.all(requests)
        if (!active) return

        let invitesCount: number | null = isActiveOrgAdmin ? 0 : null
        let workflowsCount: number | null = null
        let runsCount: number | null = null

        let cursor = 0
        if (isActiveOrgAdmin) {
          const invitesRes = responses[cursor]
          cursor += 1
          if (invitesRes.ok) {
            const payload = (await invitesRes.json().catch(() => null)) as OrgInvitesResponse | null
            invitesCount = payload?.invites?.length ?? 0
          } else {
            invitesCount = null
          }
        }

        const workflowsRes = responses[cursor]
        cursor += 1
        if (workflowsRes.ok) {
          const payload = (await workflowsRes.json().catch(() => null)) as WorkflowListResponse | null
          workflowsCount = payload?.workflows?.length ?? 0
        }

        const runsRes = responses[cursor]
        if (runsRes.ok) {
          const payload = (await runsRes.json().catch(() => null)) as RunsResponse | null
          runsCount = payload?.runs?.length ?? 0
        }

        setOnboardingStats({
          invitesCount,
          workflowsCount,
          runsCount,
          loading: false,
        })
      } catch {
        if (!active) return
        setOnboardingStats({
          invitesCount: null,
          workflowsCount: null,
          runsCount: null,
          loading: false,
        })
      }
    }

    loadOnboardingStats()
    return () => {
      active = false
    }
  }, [activeOrg?.org_id, isActiveOrgAdmin])

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2">
        <div className="h-48 rounded-2xl border border-slate-200 bg-white shadow-sm" />
        <div className="h-48 rounded-2xl border border-slate-200 bg-white shadow-sm" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-700 shadow-sm">
        {error}
      </div>
    )
  }

  if (!me || !usage || !orgs) {
    return null
  }

  const hasDesktopHandoff = Boolean(me.last_desktop_handoff_at)
  const hasTeamWorkspace = orgs.orgs?.some((org) => org.org_id !== orgs.personal_org_id) ?? false
  const needsDefaultWorkspace = !defaultOrgValid
  const activeOrgId = activeOrg?.org_id

  const checklistSteps: ChecklistStep[] = []

  if (!hasDesktopHandoff) {
    checklistSteps.push({
      id: 'download-desktop',
      title: 'Download the desktop app',
      description: 'Desktop apps use your default workspace to run workflows.',
      status: 'todo',
      ctaLabel: 'Download app',
      ctaHref: desktopDownloadUrl,
    })
  }

  if (needsDefaultWorkspace) {
    checklistSteps.push({
      id: 'set-default',
      title: 'Set a default workspace',
      description: 'Desktop apps use your default workspace.',
      status: 'todo',
      ctaLabel: 'Choose workspace',
      ctaHref: '/dashboard/workspaces',
    })
  }

  if (!hasTeamWorkspace) {
    checklistSteps.push({
      id: 'create-workspace',
      title: 'Create a team workspace',
      description: 'Workspaces are how you invite and manage teammates.',
      status: 'todo',
      ctaLabel: 'Create workspace',
      ctaHref: '/dashboard/workspaces',
    })
  }

  if (hasTeamWorkspace && activeOrgId) {
    if (isActiveOrgAdmin && onboardingStats.invitesCount !== null) {
      checklistSteps.push({
        id: 'invite-teammates',
        title: 'Invite teammates',
        description: 'Invites are the fastest way to onboard your team.',
        status: onboardingStats.invitesCount > 0 ? 'done' : 'todo',
        ctaLabel: 'Invite teammates',
        ctaHref: `/dashboard/workspaces/${encodeURIComponent(activeOrgId)}/invites`,
      })
    } else if (!isActiveOrgAdmin) {
      checklistSteps.push({
        id: 'invite-teammates-blocked',
        title: 'Invite teammates',
        description: 'Only workspace admins can send invites.',
        status: 'blocked',
        ctaLabel: 'View members',
        ctaHref: `/dashboard/workspaces/${encodeURIComponent(activeOrgId)}/members`,
      })
    }
  }

  if (activeOrgId && onboardingStats.workflowsCount !== null) {
    checklistSteps.push({
      id: 'publish-workflow',
      title: 'Publish your first workflow',
      description: 'Publishing makes workflows available to the workspace.',
      status: onboardingStats.workflowsCount > 0 ? 'done' : 'todo',
      ctaLabel: 'View workflows',
      ctaHref: `/dashboard/workspaces/${encodeURIComponent(activeOrgId)}/workflows`,
    })
  }

  if (activeOrgId && onboardingStats.runsCount !== null) {
    checklistSteps.push({
      id: 'run-workflow',
      title: 'Run a workflow',
      description: 'Runs validate that your automation is working.',
      status: onboardingStats.runsCount > 0 ? 'done' : 'todo',
      ctaLabel: 'View runs',
      ctaHref: `/dashboard/workspaces/${encodeURIComponent(activeOrgId)}/runs`,
    })
  }

  const visibleChecklistSteps = checklistSteps.filter((step) => step.status !== 'done').slice(0, 3)

  const creditsRemaining = Math.max(0, usage.credits_limit - usage.credits_used)
  const defaultOrg = orgs.orgs?.find((org) => org.org_id === orgs.default_org_id) ?? null
  const personalOrg = orgs.orgs?.find((org) => org.org_id === orgs.personal_org_id) ?? null

  return (
    <div className="space-y-6">
      {visibleChecklistSteps.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-base font-semibold text-slate-900">Getting started</h2>
            {onboardingStats.loading && (
              <span className="text-xs text-slate-400">Updating…</span>
            )}
          </div>
          <div className="mt-4 space-y-3">
            {visibleChecklistSteps.map((step) => {
              const isExternal = step.ctaHref?.startsWith('http')
              const statusStyle =
                step.status === 'blocked'
                  ? 'bg-amber-50 text-amber-700'
                  : 'bg-slate-100 text-slate-600'
              const statusLabel = step.status === 'blocked' ? 'Blocked' : 'To do'
              return (
                <div
                  key={step.id}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-3"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-slate-900">{step.title}</div>
                      <div className="mt-1 text-xs text-slate-500">{step.description}</div>
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${statusStyle}`}>
                      {statusLabel}
                    </span>
                  </div>
                  {step.ctaHref && step.ctaLabel && (
                    <div className="mt-3">
                      <Link
                        className="inline-flex items-center rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-slate-300"
                        href={step.ctaHref}
                        target={isExternal ? '_blank' : undefined}
                        rel={isExternal ? 'noreferrer' : undefined}
                      >
                        {step.ctaLabel}
                      </Link>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-semibold text-slate-900">Account</h2>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            <div>
              <div className="text-xs uppercase tracking-wide text-slate-400">Signed in as</div>
              <div className="text-slate-900">{me.email ?? me.sub}</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide text-slate-400">Plan</div>
              <div className="text-slate-900">{me.plan?.name ?? 'Unknown'}</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide text-slate-400">Default workspace</div>
              <div className={defaultOrgValid ? 'text-slate-900' : 'text-rose-600'}>
                {defaultOrg?.name ?? (me.default_org_id ? 'Needs attention' : 'Not set')}
              </div>
              <Link className="text-xs text-[#1861C8] hover:text-[#1861C8]/80" href="/dashboard/workspaces">
                Manage workspaces
              </Link>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide text-slate-400">Personal workspace</div>
              <div className="text-slate-900">{personalOrg?.name ?? me.personal_org_id ?? 'Not set'}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-base font-semibold text-slate-900">Usage</h2>
        <div className="mt-4 grid gap-4 text-sm text-slate-600">
          <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
            <div className="text-xs uppercase tracking-wide text-slate-400">Credits remaining</div>
            <div className="text-2xl font-semibold text-slate-900">{creditsRemaining}</div>
            <div className="text-xs text-slate-500">{usage.credits_used} used this period</div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-slate-100 bg-white px-4 py-3">
              <div className="text-xs uppercase tracking-wide text-slate-400">Prompt tokens</div>
              <div className="text-lg font-semibold text-slate-900">{usage.prompt_tokens}</div>
            </div>
            <div className="rounded-xl border border-slate-100 bg-white px-4 py-3">
              <div className="text-xs uppercase tracking-wide text-slate-400">Completion tokens</div>
              <div className="text-lg font-semibold text-slate-900">{usage.completion_tokens}</div>
            </div>
          </div>
          <div className="text-xs text-slate-500">Period: {usage.period ?? 'Current month'}</div>
        </div>
      </div>

      {invites.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-semibold text-slate-900">Pending invites</h2>
          <p className="mt-2 text-sm text-slate-600">
            You have {invites.length} invite{invites.length === 1 ? '' : 's'} waiting.
          </p>
          <div className="mt-4 space-y-3">
            {invites.map((invite) => (
              <Link
                key={invite.invite_id}
                href={`/invite?org_id=${encodeURIComponent(invite.org_id)}&invite_id=${encodeURIComponent(invite.invite_id)}`}
                className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 hover:border-slate-300"
              >
                <div>
                  <div className="font-semibold text-slate-900">{invite.org_name || invite.org_id}</div>
                  <div className="text-xs text-slate-500">
                    Role {invite.role.replace('org_', '')}
                  </div>
                </div>
                <span className="text-xs font-medium text-[#1861C8]">Review</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

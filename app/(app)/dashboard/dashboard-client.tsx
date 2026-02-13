'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight, Download, ListChecks, Users, Workflow } from 'lucide-react'
import Button from '@/components/ui/button'
import {
  EmptyState,
  ErrorNotice,
  MetricCard,
  SectionCard,
} from '@/components/dashboard'

type PlanInfo = {
  name: string
  monthly_credits: number
}

type MeResponse = {
  sub: string
  email?: string | null
  display_name?: string | null
  first_name?: string | null
  last_name?: string | null
  plan: PlanInfo
  personal_org_id?: string | null
  default_org_id?: string | null
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

export default function DashboardClient() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [me, setMe] = useState<MeResponse | null>(null)
  const [usage, setUsage] = useState<UsageResponse | null>(null)
  const [orgs, setOrgs] = useState<OrgsResponse | null>(null)
  const [invites, setInvites] = useState<InviteSummary[]>([])

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

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        <div className="h-28 animate-pulse rounded-xl border border-border bg-card shadow-sm" />
        <div className="h-28 animate-pulse rounded-xl border border-border bg-card shadow-sm" />
        <div className="h-28 animate-pulse rounded-xl border border-border bg-card shadow-sm" />
      </div>
    )
  }

  if (error) {
    return <ErrorNotice message={error} title="Unable to load dashboard" />
  }

  if (!me || !usage || !orgs) {
    return null
  }

  const creditsRemaining = Math.max(0, usage.credits_limit - usage.credits_used)
  const defaultOrg = orgs.orgs?.find((org) => org.org_id === orgs.default_org_id) ?? null
  const personalOrg = orgs.orgs?.find((org) => org.org_id === orgs.personal_org_id) ?? null
  const workspaceBase = defaultOrg?.org_id ? `/dashboard/workspaces/${defaultOrg.org_id}` : '/dashboard/workspaces'
  const accountDisplayName =
    me.display_name?.trim() ||
    `${me.first_name ?? ''} ${me.last_name ?? ''}`.trim() ||
    me.email?.trim() ||
    'Workspace member'

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard
          label="Account"
          value={accountDisplayName}
          helper={me.email ? me.email : 'Profile email not yet configured'}
        />
        <MetricCard
          label="Plan"
          value={me.plan?.name ?? 'Unknown'}
          helper={`${me.plan?.monthly_credits ?? 0} monthly credits`}
        />
        <MetricCard
          label="Credits remaining"
          value={creditsRemaining}
          helper={`${usage.credits_used} used this period`}
        />
      </div>

      <SectionCard
        title="Account"
        description="Workspace defaults and profile context used across Trope Cloud."
        action={
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard/workspaces">Manage workspaces</Link>
          </Button>
        }
      >
        <div className="grid gap-4 text-sm text-muted-foreground sm:grid-cols-2">
          <div>
            <div className="text-xs uppercase tracking-wide text-muted-foreground">Default workspace</div>
            <div className="text-foreground">{defaultOrg?.name ?? me.default_org_id ?? 'Not set'}</div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wide text-muted-foreground">Personal workspace</div>
            <div className="text-foreground">{personalOrg?.name ?? me.personal_org_id ?? 'Not set'}</div>
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title="Next steps"
        description="Keep momentum by capturing workflows and inviting teammates."
      >
        <div className="grid gap-2 text-sm">
          <Button asChild variant="outline" className="h-12 justify-between">
            <Link href="/download">
              <span className="flex items-center gap-2">
                <Download className="size-4 text-muted-foreground" />
                Download the desktop app
              </span>
              <span className="flex items-center gap-2 text-xs text-muted-foreground">
                macOS / Windows
                <ChevronRight className="size-3.5" />
              </span>
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-12 justify-between">
            <Link href={`${workspaceBase}/workflows`}>
              <span className="flex items-center gap-2">
                <Workflow className="size-4 text-muted-foreground" />
                Record your first workflow
              </span>
              <span className="flex items-center gap-2 text-xs text-muted-foreground">
                Workflows
                <ChevronRight className="size-3.5" />
              </span>
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-12 justify-between">
            <Link href={`${workspaceBase}/members`}>
              <span className="flex items-center gap-2">
                <Users className="size-4 text-muted-foreground" />
                Invite teammates
              </span>
              <span className="flex items-center gap-2 text-xs text-muted-foreground">
                Members
                <ChevronRight className="size-3.5" />
              </span>
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-12 justify-between">
            <Link href={`${workspaceBase}/runs`}>
              <span className="flex items-center gap-2">
                <ListChecks className="size-4 text-muted-foreground" />
                Review run history
              </span>
              <span className="flex items-center gap-2 text-xs text-muted-foreground">
                Runs
                <ChevronRight className="size-3.5" />
              </span>
            </Link>
          </Button>
        </div>
      </SectionCard>

      <SectionCard title="Usage" description={`Period: ${usage.period ?? 'Current month'}`}>
        <div className="grid gap-4 lg:grid-cols-3">
          <MetricCard label="Prompt tokens" value={usage.prompt_tokens} />
          <MetricCard label="Completion tokens" value={usage.completion_tokens} />
          <MetricCard label="Credits reserved" value={usage.credits_reserved} />
        </div>
      </SectionCard>

      {invites.length > 0 && (
        <SectionCard
          title="Pending invites"
          description={`You have ${invites.length} invite${invites.length === 1 ? '' : 's'} waiting.`}
        >
          <div className="space-y-2">
            {invites.map((invite) => (
              <Button
                key={invite.invite_id}
                asChild
                variant="outline"
                className="h-auto w-full justify-between py-3 text-left"
              >
                <Link
                  href={`/invite?org_id=${encodeURIComponent(invite.org_id)}&invite_id=${encodeURIComponent(invite.invite_id)}`}
                >
                  <div>
                    <div className="font-semibold text-foreground">{invite.org_name || invite.org_id}</div>
                    <div className="text-xs text-muted-foreground">Role {invite.role.replace('org_', '')}</div>
                  </div>
                  <span className="text-xs font-medium text-primary">Review</span>
                </Link>
              </Button>
            ))}
          </div>
        </SectionCard>
      )}

      {invites.length === 0 && (
        <EmptyState
          title="No pending invites"
          description="You are fully onboarded. Invite activity will appear here when teammates add you."
          className="py-8"
        />
      )}
    </div>
  )
}

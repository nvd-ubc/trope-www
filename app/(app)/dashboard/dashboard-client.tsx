'use client'

import { useEffect, useState } from 'react'
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

  const creditsRemaining = Math.max(0, usage.credits_limit - usage.credits_used)
  const defaultOrg = orgs.orgs?.find((org) => org.org_id === orgs.default_org_id) ?? null
  const personalOrg = orgs.orgs?.find((org) => org.org_id === orgs.personal_org_id) ?? null

  return (
      <div className="space-y-6">
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
              <div className="text-xs uppercase tracking-wide text-slate-400">Default org</div>
              <div className="text-slate-900">{defaultOrg?.name ?? me.default_org_id ?? 'Not set'}</div>
              <Link className="text-xs text-[#1861C8] hover:text-[#1861C8]/80" href="/dashboard/workspaces">
                Manage workspaces
              </Link>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide text-slate-400">Personal org</div>
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

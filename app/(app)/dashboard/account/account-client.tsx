'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type PlanInfo = {
  name: string
  monthly_credits: number
}

type MeResponse = {
  sub: string
  email?: string | null
  plan?: PlanInfo
  personal_org_id?: string | null
  default_org_id?: string | null
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

export default function AccountClient() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [me, setMe] = useState<MeResponse | null>(null)
  const [orgs, setOrgs] = useState<OrgsResponse | null>(null)

  useEffect(() => {
    let active = true
    const load = async () => {
      try {
        const [meRes, orgsRes] = await Promise.all([
          fetch('/api/me', { cache: 'no-store' }),
          fetch('/api/orgs', { cache: 'no-store' }),
        ])

        if (meRes.status === 401 || orgsRes.status === 401) {
          router.replace('/signin?next=/dashboard/account')
          return
        }

        const mePayload = (await meRes.json().catch(() => null)) as MeResponse | null
        const orgsPayload = (await orgsRes.json().catch(() => null)) as OrgsResponse | null

        if (!meRes.ok || !orgsRes.ok || !mePayload || !orgsPayload) {
          throw new Error('Unable to load account details.')
        }

        if (!active) return
        setMe(mePayload)
        setOrgs(orgsPayload)
        setLoading(false)
      } catch (err) {
        if (!active) return
        setError(err instanceof Error ? err.message : 'Unable to load account details.')
        setLoading(false)
      }
    }

    load()
    return () => {
      active = false
    }
  }, [router])

  if (loading) {
    return <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">Loading account…</div>
  }

  if (error || !me || !orgs) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
        {error ?? 'Unable to load account details.'}
      </div>
    )
  }

  const defaultOrg = orgs.orgs?.find((org) => org.org_id === orgs.default_org_id) ?? null
  const personalOrg = orgs.orgs?.find((org) => org.org_id === orgs.personal_org_id) ?? null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Account</h1>
        <p className="mt-1 text-sm text-slate-600">Manage your profile, plan, and security settings.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-semibold text-slate-900">Profile</h2>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            <div>
              <div className="text-xs uppercase tracking-wide text-slate-400">Email</div>
              <div className="text-slate-900">{me.email ?? me.sub}</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide text-slate-400">Account ID</div>
              <div className="text-slate-900">{me.sub}</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide text-slate-400">Plan</div>
              <div className="text-slate-900">{me.plan?.name ?? 'Unknown'}</div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-semibold text-slate-900">Workspaces</h2>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            <div>
              <div className="text-xs uppercase tracking-wide text-slate-400">Default workspace</div>
              <div className="text-slate-900">
                {defaultOrg?.name ?? orgs.default_org_id ?? 'Not set'}
              </div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide text-slate-400">Personal workspace</div>
              <div className="text-slate-900">
                {personalOrg?.name ?? orgs.personal_org_id ?? 'Not set'}
              </div>
            </div>
            <Link className="text-sm font-medium text-[#1861C8] hover:text-[#1861C8]/80" href="/dashboard/workspaces">
              Manage workspaces
            </Link>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-base font-semibold text-slate-900">Security</h2>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Link
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:border-slate-300 hover:text-slate-900"
            href="/reset-password"
          >
            Reset password
          </Link>
          <Link
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:border-slate-300 hover:text-slate-900"
            href="/dashboard"
          >
            Back to dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}

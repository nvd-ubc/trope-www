'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCsrfToken } from '@/lib/client/use-csrf-token'

type PlanInfo = {
  name: string
  monthly_credits: number
}

type MeResponse = {
  sub: string
  email?: string | null
  first_name?: string | null
  last_name?: string | null
  display_name?: string | null
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

type ProfileUpdateResponse = {
  first_name?: string | null
  last_name?: string | null
  display_name?: string | null
  message?: string
  error?: string
}

const safeInternalPath = (value: string | null): string | null => {
  if (!value) return null
  const trimmed = value.trim()
  if (!trimmed.startsWith('/') || trimmed.startsWith('//')) {
    return null
  }
  return trimmed
}

export default function AccountClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { token: csrfToken, loading: csrfLoading } = useCsrfToken()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [me, setMe] = useState<MeResponse | null>(null)
  const [orgs, setOrgs] = useState<OrgsResponse | null>(null)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [savePending, setSavePending] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)
  const [saveRequestId, setSaveRequestId] = useState<string | null>(null)

  const completeProfile = searchParams.get('completeProfile') === '1'
  const nextPath = safeInternalPath(searchParams.get('next'))

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
        setFirstName(mePayload.first_name ?? '')
        setLastName(mePayload.last_name ?? '')
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

  const defaultOrg = useMemo(
    () => orgs?.orgs?.find((org) => org.org_id === orgs.default_org_id) ?? null,
    [orgs]
  )
  const personalOrg = useMemo(
    () => orgs?.orgs?.find((org) => org.org_id === orgs.personal_org_id) ?? null,
    [orgs]
  )

  const trimmedFirstName = firstName.trim()
  const trimmedLastName = lastName.trim()
  const isDirty =
    trimmedFirstName !== (me?.first_name ?? '').trim() || trimmedLastName !== (me?.last_name ?? '').trim()

  const submitProfile = async () => {
    if (!csrfToken) return

    if (!trimmedFirstName) {
      setSaveError('First name is required.')
      setSaveMessage(null)
      return
    }
    if (!trimmedLastName) {
      setSaveError('Last name is required.')
      setSaveMessage(null)
      return
    }

    setSavePending(true)
    setSaveError(null)
    setSaveMessage(null)
    setSaveRequestId(null)
    try {
      const response = await fetch('/api/me/profile', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-csrf-token': csrfToken,
        },
        body: JSON.stringify({
          first_name: trimmedFirstName,
          last_name: trimmedLastName,
        }),
      })
      const payload = (await response.json().catch(() => null)) as ProfileUpdateResponse | null
      const requestId = response.headers.get('x-trope-request-id')
      setSaveRequestId(requestId)
      if (!response.ok) {
        throw new Error(payload?.message || payload?.error || 'Unable to update profile.')
      }

      setMe((previous) =>
        previous
          ? {
              ...previous,
              first_name: payload?.first_name ?? trimmedFirstName,
              last_name: payload?.last_name ?? trimmedLastName,
              display_name: payload?.display_name ?? previous.display_name ?? null,
            }
          : previous
      )
      setFirstName(payload?.first_name ?? trimmedFirstName)
      setLastName(payload?.last_name ?? trimmedLastName)

      if (completeProfile) {
        router.replace(nextPath ?? '/dashboard')
        return
      }

      setSaveMessage('Profile updated.')
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Unable to update profile.')
    } finally {
      setSavePending(false)
    }
  }

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Account</h1>
        <p className="mt-1 text-sm text-slate-600">Manage your profile, plan, and security settings.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-semibold text-slate-900">Profile</h2>
          <div className="mt-4 space-y-4">
            {completeProfile && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                Add your first and last name to continue using workspace pages.
              </div>
            )}
            {saveError && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {saveError}
              </div>
            )}
            {saveMessage && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {saveMessage}
              </div>
            )}
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                  htmlFor="account-first-name"
                >
                  First Name
                </label>
                <input
                  id="account-first-name"
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#1861C8] focus:ring-1 focus:ring-[#1861C8]"
                  placeholder="First name"
                />
              </div>
              <div>
                <label
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                  htmlFor="account-last-name"
                >
                  Last Name
                </label>
                <input
                  id="account-last-name"
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#1861C8] focus:ring-1 focus:ring-[#1861C8]"
                  placeholder="Last name"
                />
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                className="rounded-full bg-[#1861C8] px-4 py-2 text-sm font-medium text-white hover:bg-[#2171d8] disabled:cursor-not-allowed disabled:opacity-60"
                disabled={savePending || csrfLoading || !csrfToken || !isDirty}
                onClick={submitProfile}
              >
                {savePending ? 'Saving…' : 'Save profile'}
              </button>
              {saveRequestId && (
                <span className="text-xs text-slate-500">Request ID {saveRequestId}</span>
              )}
            </div>
          </div>
          <div className="mt-6 space-y-3 text-sm text-slate-600">
            <div>
              <div className="text-xs uppercase tracking-wide text-slate-400">Email</div>
              <div className="text-slate-900">{me.email ?? me.sub}</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide text-slate-400">Display name</div>
              <div className="text-slate-900">{me.display_name ?? 'Not set'}</div>
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

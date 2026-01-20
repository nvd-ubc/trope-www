'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useCsrfToken } from '@/lib/client/use-csrf-token'
import { notifyOrgListUpdated } from '../../org-list-cache'

type OrgSummary = {
  org_id: string
  name: string
  role: string
  status: string
  created_at: string
}

type OrgListResponse = {
  orgs: OrgSummary[]
  personal_org_id?: string | null
  default_org_id?: string | null
}

const formatDate = (value: string) => {
  if (!value) return 'Unknown'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function WorkspacesClient() {
  const router = useRouter()
  const { token: csrfToken } = useCsrfToken()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [orgs, setOrgs] = useState<OrgSummary[]>([])
  const [defaultOrgId, setDefaultOrgId] = useState<string | null>(null)
  const [personalOrgId, setPersonalOrgId] = useState<string | null>(null)
  const [createName, setCreateName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)

  const loadOrgs = useCallback(async () => {
    const response = await fetch('/api/orgs', { cache: 'no-store' })
    if (response.status === 401) {
      router.replace('/signin?next=/dashboard/workspaces')
      return
    }
    const payload = (await response.json().catch(() => null)) as OrgListResponse | null
    if (!response.ok || !payload) {
      throw new Error('Unable to load workspaces.')
    }
    setOrgs(payload.orgs ?? [])
    setDefaultOrgId(payload.default_org_id ?? null)
    setPersonalOrgId(payload.personal_org_id ?? null)
  }, [router])

  useEffect(() => {
    let active = true
    const run = async () => {
      try {
        await loadOrgs()
        if (!active) return
        setLoading(false)
      } catch (err) {
        if (!active) return
        setError(err instanceof Error ? err.message : 'Unable to load workspaces.')
        setLoading(false)
      }
    }
    run()
    return () => {
      active = false
    }
  }, [loadOrgs])

  const teamOrgs = useMemo(() => {
    const list = orgs.filter((org) => org.org_id !== personalOrgId)
    list.sort((a, b) => {
      if (a.org_id === defaultOrgId) return -1
      if (b.org_id === defaultOrgId) return 1
      return (a.name || a.org_id).localeCompare(b.name || b.org_id)
    })
    return list
  }, [orgs, personalOrgId, defaultOrgId])

  const personalOrg = useMemo(
    () => orgs.find((org) => org.org_id === personalOrgId) ?? null,
    [orgs, personalOrgId]
  )

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!createName.trim()) {
      setError('Workspace name is required.')
      return
    }
    if (!csrfToken) {
      setError('Session is not ready yet. Please try again.')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      const response = await fetch('/api/orgs', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-csrf-token': csrfToken,
        },
        body: JSON.stringify({ name: createName.trim() }),
      })
      const payload = (await response.json().catch(() => null)) as
        | { org?: OrgSummary; default_org_id?: string; message?: string }
        | null
      if (!response.ok) {
        throw new Error(payload?.message || 'Unable to create workspace.')
      }
      if (payload?.org) {
        setOrgs((prev) => [payload.org as OrgSummary, ...prev])
      }
      if (payload?.default_org_id) {
        setDefaultOrgId(payload.default_org_id)
        notifyOrgListUpdated()
      }
      if (payload?.org && !payload?.default_org_id) {
        notifyOrgListUpdated()
      }
      if (payload?.org && payload?.default_org_id === payload.org.org_id) {
        setNotice(`Default workspace updated to ${payload.org.name || 'your new workspace'}.`)
      }
      setCreateName('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create workspace.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleMakeDefault = async (orgId: string) => {
    if (!csrfToken) return
    setSubmitting(true)
    setError(null)
    try {
      const response = await fetch('/api/me/default-org', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-csrf-token': csrfToken,
        },
        body: JSON.stringify({ org_id: orgId }),
      })
      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { message?: string } | null
        throw new Error(payload?.message || 'Unable to update default workspace.')
      }
      setDefaultOrgId(orgId)
      notifyOrgListUpdated()
      const orgName = orgs.find((org) => org.org_id === orgId)?.name
      setNotice(`Default workspace updated to ${orgName || 'selected workspace'}.`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update default workspace.')
    } finally {
      setSubmitting(false)
    }
  }

  const renderOrgCard = (org: OrgSummary) => {
    const isDefault = org.org_id === defaultOrgId
    const isPersonal = org.org_id === personalOrgId
    return (
      <div
        key={org.org_id}
        className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-4"
      >
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="text-sm font-semibold text-slate-900">
              {org.name || 'Workspace'}
            </div>
            {isDefault && (
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-emerald-700">
                Default
              </span>
            )}
            {isPersonal && (
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-500">
                Personal
              </span>
            )}
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-500">
              {org.role.replace('org_', '')}
            </span>
          </div>
          <div className="text-xs text-slate-500">Created {formatDate(org.created_at)}</div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/dashboard/workspaces/${encodeURIComponent(org.org_id)}`}
            className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:border-slate-300 hover:text-slate-900"
          >
            Open
          </Link>
          <button
            className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:border-slate-300 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isDefault || submitting || !csrfToken}
            onClick={() => handleMakeDefault(org.org_id)}
          >
            Make default
          </button>
        </div>
      </div>
    )
  }

  if (loading) {
    return <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">Loading workspaces…</div>
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="space-y-4">
        {notice && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {notice}
          </div>
        )}
        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Your workspaces</h2>
              <p className="mt-1 text-sm text-slate-600">
                Default workspace is used by your desktop apps.
              </p>
            </div>
            <Link
              href="/dashboard"
              className="text-sm font-medium text-[#1861C8] hover:text-[#1861C8]/80"
            >
              Back to dashboard
            </Link>
          </div>

          <div className="mt-6 space-y-6">
            {orgs.length === 0 && (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
                No workspaces yet. Create one to get started.
              </div>
            )}

            {teamOrgs.length > 0 && (
              <div className="space-y-3">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Team workspaces
                </div>
                {teamOrgs.map(renderOrgCard)}
              </div>
            )}

            {personalOrg && (
              <div className="space-y-3">
                {teamOrgs.length > 0 && (
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Personal workspace
                  </div>
                )}
                {renderOrgCard(personalOrg)}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-semibold text-slate-900">Create a workspace</h2>
          <p className="mt-1 text-sm text-slate-600">
            Workspaces let you invite teammates and share workflows.
          </p>
          <form className="mt-4 space-y-3" onSubmit={handleCreate}>
            <input
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#1861C8] focus:ring-1 focus:ring-[#1861C8]"
              placeholder="Workspace name"
              value={createName}
              onChange={(event) => setCreateName(event.target.value)}
            />
            <button
              className="w-full rounded-full bg-[#1861C8] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2171d8] disabled:cursor-not-allowed disabled:opacity-60"
              disabled={submitting || !csrfToken}
              type="submit"
            >
              Create workspace
            </button>
          </form>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
          <h3 className="text-sm font-semibold text-slate-900">Next steps</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            <li>Set your default workspace for desktop apps.</li>
            <li>Create an invite when you&apos;re ready to onboard teammates.</li>
            <li>Manage workspace roles from the admin console.</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

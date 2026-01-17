'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type OrgProfile = {
  org_id: string
  name: string
  created_at?: string
  created_by?: string
}

type OrgMembership = {
  org_id: string
  user_id: string
  role: string
  status: string
  created_at: string
}

type OrgProfileResponse = {
  org: OrgProfile
  membership: OrgMembership
}

const formatDate = (value?: string) => {
  if (!value) return 'Unknown'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function WorkspaceOverviewClient({ orgId }: { orgId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [org, setOrg] = useState<OrgProfile | null>(null)
  const [membership, setMembership] = useState<OrgMembership | null>(null)

  useEffect(() => {
    let active = true

    const load = async () => {
      try {
        const response = await fetch(`/api/orgs/${encodeURIComponent(orgId)}`, { cache: 'no-store' })
        if (response.status === 401) {
          router.replace(`/signin?next=/dashboard/workspaces/${encodeURIComponent(orgId)}`)
          return
        }
        const payload = (await response.json().catch(() => null)) as OrgProfileResponse | null
        if (!response.ok || !payload) {
          throw new Error('Unable to load workspace.')
        }
        if (!active) return
        setOrg(payload.org)
        setMembership(payload.membership)
        setLoading(false)
      } catch (err) {
        if (!active) return
        setError(err instanceof Error ? err.message : 'Unable to load workspace.')
        setLoading(false)
      }
    }

    load()
    return () => {
      active = false
    }
  }, [orgId, router])

  if (loading) {
    return <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">Loading workspace…</div>
  }

  if (error || !org || !membership) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
        {error ?? 'Unable to load workspace.'}
      </div>
    )
  }

  const canViewAudit = membership.role === 'org_owner' || membership.role === 'org_admin'

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">{org.name || org.org_id}</h1>
          <p className="mt-1 text-sm text-slate-600">
            Created {formatDate(org.created_at)} · Role {membership.role.replace('org_', '')}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/dashboard/workspaces/${encodeURIComponent(orgId)}/members`}
            className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:border-slate-300 hover:text-slate-900"
          >
            Members
          </Link>
          <Link
            href={`/dashboard/workspaces/${encodeURIComponent(orgId)}/invites`}
            className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:border-slate-300 hover:text-slate-900"
          >
            Invites
          </Link>
          {canViewAudit && (
            <Link
              href={`/dashboard/workspaces/${encodeURIComponent(orgId)}/audit`}
              className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:border-slate-300 hover:text-slate-900"
            >
              Audit
            </Link>
          )}
          <Link
            href={`/dashboard/workspaces/${encodeURIComponent(orgId)}/settings`}
            className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:border-slate-300 hover:text-slate-900"
          >
            Settings
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-semibold text-slate-900">Workspace overview</h2>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            <div>
              <div className="text-xs uppercase tracking-wide text-slate-400">Workspace ID</div>
              <div className="text-slate-900">{org.org_id}</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide text-slate-400">Role</div>
              <div className="text-slate-900">{membership.role.replace('org_', '')}</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide text-slate-400">Joined</div>
              <div className="text-slate-900">{formatDate(membership.created_at)}</div>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-semibold text-slate-900">Next steps</h2>
          <ul className="mt-4 space-y-2 text-sm text-slate-600">
            <li>Invite teammates to collaborate in this workspace.</li>
            <li>Review roles to ensure the right people have access.</li>
            <li>Set this workspace as default for desktop apps.</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

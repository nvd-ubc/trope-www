'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCsrfToken } from '@/lib/client/use-csrf-token'

type InviteRecord = {
  org_id: string
  invite_id: string
  email: string
  role: string
  status: string
  created_at: string
  created_by?: string
  revoked_at?: string
  accepted_at?: string
  expires_at?: number
}

type InvitesResponse = {
  invites: InviteRecord[]
}

const roleOptions = [
  { value: 'org_member', label: 'Member' },
  { value: 'org_admin', label: 'Admin' },
]

const formatDate = (value?: string | number) => {
  if (!value) return 'Unknown'
  const date = new Date(typeof value === 'number' ? value * 1000 : value)
  if (Number.isNaN(date.getTime())) return String(value)
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function InvitesClient({ orgId }: { orgId: string }) {
  const router = useRouter()
  const { token: csrfToken } = useCsrfToken()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [invites, setInvites] = useState<InviteRecord[]>([])
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('org_member')
  const [submitting, setSubmitting] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const loadInvites = async () => {
    const response = await fetch(`/api/orgs/${encodeURIComponent(orgId)}/invites`, { cache: 'no-store' })
    if (response.status === 401) {
      router.replace(`/signin?next=/dashboard/workspaces/${encodeURIComponent(orgId)}/invites`)
      return
    }
    const payload = (await response.json().catch(() => null)) as InvitesResponse | null
    if (!response.ok || !payload) {
      throw new Error('Unable to load invites.')
    }
    setInvites(payload.invites ?? [])
  }

  useEffect(() => {
    let active = true
    const run = async () => {
      try {
        await loadInvites()
        if (!active) return
        setLoading(false)
      } catch (err) {
        if (!active) return
        setError(err instanceof Error ? err.message : 'Unable to load invites.')
        setLoading(false)
      }
    }
    run()
    return () => {
      active = false
    }
  }, [orgId])

  const pendingInvites = useMemo(() => {
    const now = Date.now() / 1000
    return invites.filter((invite) => {
      if (invite.status !== 'pending') return false
      if (invite.expires_at && invite.expires_at <= now) return false
      return true
    })
  }, [invites])

  const expiredInvites = useMemo(() => {
    const now = Date.now() / 1000
    return invites.filter((invite) => invite.status === 'pending' && invite.expires_at && invite.expires_at <= now)
  }, [invites])

  const acceptedInvites = useMemo(
    () => invites.filter((invite) => invite.status === 'accepted'),
    [invites]
  )

  const revokedInvites = useMemo(
    () => invites.filter((invite) => invite.status === 'revoked'),
    [invites]
  )

  const handleCreateInvite = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!csrfToken) return
    if (!email.trim()) {
      setError('Email is required.')
      return
    }

    setSubmitting(true)
    setError(null)
    try {
      const response = await fetch(`/api/orgs/${encodeURIComponent(orgId)}/invites`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-csrf-token': csrfToken,
        },
        body: JSON.stringify({ email: email.trim(), role }),
      })
      const payload = (await response.json().catch(() => null)) as { invite?: InviteRecord; message?: string } | null
      if (!response.ok) {
        throw new Error(payload?.message || 'Unable to create invite.')
      }
      if (payload?.invite) {
        setInvites((prev) => [payload.invite as InviteRecord, ...prev])
      }
      setEmail('')
      setRole('org_member')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create invite.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleRevoke = async (invite: InviteRecord) => {
    if (!csrfToken) return
    setSubmitting(true)
    setError(null)
    try {
      const response = await fetch(
        `/api/orgs/${encodeURIComponent(orgId)}/invites/${encodeURIComponent(invite.invite_id)}`,
        {
          method: 'DELETE',
          headers: {
            'x-csrf-token': csrfToken,
          },
        }
      )
      const payload = (await response.json().catch(() => null)) as { invite?: InviteRecord; message?: string } | null
      if (!response.ok) {
        throw new Error(payload?.message || 'Unable to revoke invite.')
      }
      setInvites((prev) =>
        prev.map((record) =>
          record.invite_id === invite.invite_id
            ? {
                ...record,
                status: 'revoked',
                revoked_at: payload?.invite?.revoked_at || new Date().toISOString(),
              }
            : record
        )
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to revoke invite.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleCopyLink = async (invite: InviteRecord) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : ''
    const inviteUrl = new URL('/invite', origin)
    inviteUrl.searchParams.set('org_id', orgId)
    inviteUrl.searchParams.set('invite_id', invite.invite_id)

    try {
      await navigator.clipboard.writeText(inviteUrl.toString())
      setCopiedId(invite.invite_id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch {
      setError('Unable to copy invite link. Please copy manually.')
    }
  }

  if (loading) {
    return <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">Loading invites…</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Invites</h1>
          <p className="mt-1 text-sm text-slate-600">
            Invite teammates and track onboarding status.
          </p>
        </div>
        <Link
          href={`/dashboard/workspaces/${encodeURIComponent(orgId)}`}
          className="text-sm font-medium text-[#1861C8] hover:text-[#1861C8]/80"
        >
          Back to workspace
        </Link>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-semibold text-slate-900">Pending invites</h2>
            <div className="mt-4 space-y-3">
              {pendingInvites.length === 0 && (
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
                  No pending invites.
                </div>
              )}
              {pendingInvites.map((invite) => (
                <div
                  key={invite.invite_id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 px-4 py-4"
                >
                  <div>
                    <div className="text-sm font-semibold text-slate-900">{invite.email}</div>
                    <div className="text-xs text-slate-500">
                      Role: {invite.role.replace('org_', '')} · Expires {formatDate(invite.expires_at)}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:border-slate-300 hover:text-slate-900"
                      onClick={() => handleCopyLink(invite)}
                    >
                      {copiedId === invite.invite_id ? 'Copied' : 'Copy link'}
                    </button>
                    <button
                      className="rounded-full border border-rose-200 px-3 py-1.5 text-xs font-medium text-rose-700 hover:border-rose-300 hover:text-rose-800 disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={submitting || !csrfToken}
                      onClick={() => handleRevoke(invite)}
                    >
                      Revoke
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {acceptedInvites.length > 0 && (
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-base font-semibold text-slate-900">Accepted invites</h2>
              <div className="mt-4 space-y-3">
                {acceptedInvites.map((invite) => (
                  <div
                    key={invite.invite_id}
                    className="rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-600"
                  >
                    {invite.email} · Accepted {formatDate(invite.accepted_at)}
                  </div>
                ))}
              </div>
            </section>
          )}

          {revokedInvites.length > 0 && (
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-base font-semibold text-slate-900">Revoked invites</h2>
              <div className="mt-4 space-y-3">
                {revokedInvites.map((invite) => (
                  <div
                    key={invite.invite_id}
                    className="rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-600"
                  >
                    {invite.email} · Revoked {formatDate(invite.revoked_at)}
                  </div>
                ))}
              </div>
            </section>
          )}

          {expiredInvites.length > 0 && (
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-base font-semibold text-slate-900">Expired invites</h2>
              <div className="mt-4 space-y-3">
                {expiredInvites.map((invite) => (
                  <div
                    key={invite.invite_id}
                    className="rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-600"
                  >
                    {invite.email} · Expired {formatDate(invite.expires_at)}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        <div className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-semibold text-slate-900">Invite a teammate</h2>
            <p className="mt-1 text-sm text-slate-600">
              Send a secure link and onboard them to this workspace.
            </p>
            <form className="mt-4 space-y-3" onSubmit={handleCreateInvite}>
              <input
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#1861C8] focus:ring-1 focus:ring-[#1861C8]"
                placeholder="person@company.com"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
              <select
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-[#1861C8] focus:ring-1 focus:ring-[#1861C8]"
                value={role}
                onChange={(event) => setRole(event.target.value)}
              >
                {roleOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <button
                className="w-full rounded-full bg-[#1861C8] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2171d8] disabled:cursor-not-allowed disabled:opacity-60"
                disabled={submitting || !csrfToken}
                type="submit"
              >
                Send invite
              </button>
            </form>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <h3 className="text-sm font-semibold text-slate-900">Tips</h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li>Invite links expire after two weeks.</li>
              <li>Use “Copy link” if email delivery is unavailable.</li>
              <li>Only admins can create or revoke invites.</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  )
}

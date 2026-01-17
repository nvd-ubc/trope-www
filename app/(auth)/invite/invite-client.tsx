'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCsrfToken } from '@/lib/client/use-csrf-token'

export type InvitePageData = {
  status: number
  payload: {
    invite?: {
      org_id: string
      org_name: string
      invite_id: string
      role: string
      status: string
      created_at: string
      expires_at?: number | null
      invited_email_hint?: string | null
    }
    error?: string
    message?: string
  } | null
} | null

type MeResponse = {
  email?: string | null
}

const formatDate = (value?: number | null) => {
  if (!value) return 'Unknown'
  const date = new Date(value * 1000)
  if (Number.isNaN(date.getTime())) return 'Unknown'
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function InviteClient({
  orgId,
  inviteId,
  inviteData,
}: {
  orgId: string
  inviteId: string
  inviteData: InvitePageData
}) {
  const router = useRouter()
  const { token: csrfToken } = useCsrfToken()
  const [authEmail, setAuthEmail] = useState<string | null>(null)
  const [authChecked, setAuthChecked] = useState(false)
  const [accepting, setAccepting] = useState(false)
  const [acceptError, setAcceptError] = useState<string | null>(null)
  const [accepted, setAccepted] = useState(false)

  const invite = inviteData?.payload?.invite

  useEffect(() => {
    let active = true
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/me', { cache: 'no-store' })
        if (response.status === 401) {
          if (!active) return
          setAuthChecked(true)
          return
        }
        const payload = (await response.json().catch(() => null)) as MeResponse | null
        if (!active) return
        setAuthEmail(payload?.email ?? null)
        setAuthChecked(true)
      } catch {
        if (!active) return
        setAuthChecked(true)
      }
    }
    checkAuth()
    return () => {
      active = false
    }
  }, [])

  const handleAccept = async () => {
    if (!csrfToken || !orgId || !inviteId) return
    setAccepting(true)
    setAcceptError(null)
    try {
      const response = await fetch(`/api/orgs/${encodeURIComponent(orgId)}/invites/accept`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-csrf-token': csrfToken,
        },
        body: JSON.stringify({ invite_id: inviteId }),
      })
      const payload = (await response.json().catch(() => null)) as { message?: string; error?: string } | null
      if (response.status === 401) {
        router.push(`/signin?next=/invite?org_id=${encodeURIComponent(orgId)}&invite_id=${encodeURIComponent(inviteId)}`)
        return
      }
      if (!response.ok) {
        const message = payload?.message || 'Unable to accept invite.'
        throw new Error(message)
      }
      setAccepted(true)
    } catch (err) {
      setAcceptError(err instanceof Error ? err.message : 'Unable to accept invite.')
    } finally {
      setAccepting(false)
    }
  }

  if (!orgId || !inviteId) {
    return (
      <div className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Invite link is incomplete</h1>
        <p className="mt-3 text-sm text-slate-600">
          Please double-check the invite URL and try again.
        </p>
        <div className="mt-6">
          <Link className="text-sm font-medium text-[#1861C8]" href="/signin">
            Go to sign in
          </Link>
        </div>
      </div>
    )
  }

  if (!invite) {
    const message = inviteData?.payload?.message || 'Invite not found.'
    return (
      <div className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Invite unavailable</h1>
        <p className="mt-3 text-sm text-slate-600">{message}</p>
        <div className="mt-6">
          <Link className="text-sm font-medium text-[#1861C8]" href="/signin">
            Go to sign in
          </Link>
        </div>
      </div>
    )
  }

  if (invite.status === 'revoked') {
    return (
      <div className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Invite revoked</h1>
        <p className="mt-3 text-sm text-slate-600">
          This invite has been revoked. Ask an admin to send a new one.
        </p>
      </div>
    )
  }

  if (invite.status === 'accepted') {
    return (
      <div className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Invite already accepted</h1>
        <p className="mt-3 text-sm text-slate-600">
          This invite has already been accepted. You can head to the dashboard.
        </p>
        <div className="mt-6">
          <Link className="text-sm font-medium text-[#1861C8]" href="/dashboard">
            Go to dashboard
          </Link>
        </div>
      </div>
    )
  }

  const expired = invite.expires_at && invite.expires_at * 1000 < Date.now()
  if (invite.status === 'expired' || expired) {
    return (
      <div className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Invite expired</h1>
        <p className="mt-3 text-sm text-slate-600">
          This invite expired on {formatDate(invite.expires_at)}. Ask an admin for a new invite.
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-slate-900">You&apos;re invited to {invite.org_name}</h1>
        <p className="mt-3 text-sm text-slate-600">
          Role: {invite.role.replace('org_', '')} · Expires {formatDate(invite.expires_at)}
        </p>
        {invite.invited_email_hint && (
          <p className="mt-2 text-xs text-slate-500">
            Invited as {invite.invited_email_hint}
          </p>
        )}
      </div>

      <div className="mt-6 space-y-3">
        {accepted && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            Invite accepted. You can now access the workspace.
          </div>
        )}
        {acceptError && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {acceptError}
          </div>
        )}
      </div>

      <div className="mt-6 flex flex-col gap-3">
        {!authChecked && (
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            Checking your account…
          </div>
        )}

        {authChecked && !authEmail && (
          <>
            <Link
              className="w-full rounded-full bg-[#1861C8] px-4 py-2 text-center text-sm font-semibold text-white hover:bg-[#2171d8]"
              href={`/signin?next=/invite?org_id=${encodeURIComponent(orgId)}&invite_id=${encodeURIComponent(inviteId)}`}
            >
              Sign in to accept
            </Link>
            <Link
              className="w-full rounded-full border border-slate-200 px-4 py-2 text-center text-sm font-semibold text-slate-700 hover:border-slate-300"
              href={`/signup?next=/invite?org_id=${encodeURIComponent(orgId)}&invite_id=${encodeURIComponent(inviteId)}`}
            >
              Create an account
            </Link>
          </>
        )}

        {authChecked && authEmail && !accepted && (
          <>
            <button
              className="w-full rounded-full bg-[#1861C8] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2171d8] disabled:cursor-not-allowed disabled:opacity-60"
              onClick={handleAccept}
              disabled={accepting || !csrfToken}
            >
              {accepting ? 'Accepting…' : 'Accept invite'}
            </button>
            <div className="text-center text-xs text-slate-500">
              Signed in as {authEmail}
            </div>
          </>
        )}

        {accepted && (
          <Link
            className="w-full rounded-full bg-[#1861C8] px-4 py-2 text-center text-sm font-semibold text-white hover:bg-[#2171d8]"
            href={`/dashboard/workspaces/${encodeURIComponent(orgId)}`}
          >
            Go to workspace
          </Link>
        )}
      </div>
    </div>
  )
}

'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/button'
import Card from '@/components/ui/card'
import Input from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useCsrfToken } from '@/lib/client/use-csrf-token'
import { ErrorNotice, PageHeader } from '@/components/dashboard'

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
  const [resentId, setResentId] = useState<string | null>(null)

  const loadInvites = useCallback(async () => {
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
  }, [orgId, router])

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
  }, [loadInvites])

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

  const handleResend = async (invite: InviteRecord) => {
    if (!csrfToken) return
    setSubmitting(true)
    setError(null)
    try {
      const response = await fetch(
        `/api/orgs/${encodeURIComponent(orgId)}/invites/${encodeURIComponent(invite.invite_id)}/resend`,
        {
          method: 'POST',
          headers: {
            'x-csrf-token': csrfToken,
          },
        }
      )
      const payload = (await response.json().catch(() => null)) as { message?: string } | null
      if (!response.ok) {
        throw new Error(payload?.message || 'Unable to resend invite.')
      }
      setResentId(invite.invite_id)
      setTimeout(() => setResentId(null), 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to resend invite.')
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
    return <Card className="p-6 text-sm text-muted-foreground">Loading invites…</Card>
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Invites"
        description="Invite teammates and track onboarding status."
        backHref={`/dashboard/workspaces/${encodeURIComponent(orgId)}`}
        backLabel="Back to workspace"
      />

      {error && <ErrorNotice title="Invite action failed" message={error} />}

      <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-base font-semibold text-foreground">Pending invites</h2>
            <div className="mt-4 space-y-3">
              {pendingInvites.length === 0 && (
                <div className="rounded-xl border border-dashed border-border bg-muted/40 px-4 py-6 text-sm text-muted-foreground">
                  No pending invites.
                </div>
              )}
              {pendingInvites.map((invite) => (
                <div
                  key={invite.invite_id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border px-4 py-4"
                >
                  <div>
                    <div className="text-sm font-semibold text-foreground">{invite.email}</div>
                    <div className="text-xs text-muted-foreground">
                      Role: {invite.role.replace('org_', '')} · Expires {formatDate(invite.expires_at)}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopyLink(invite)}
                    >
                      {copiedId === invite.invite_id ? 'Copied' : 'Copy link'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={submitting || !csrfToken}
                      onClick={() => handleResend(invite)}
                    >
                      {resentId === invite.invite_id ? 'Sent' : 'Resend email'}
                    </Button>
                    <Button
                      type="button"
                      variant="danger"
                      size="sm"
                      disabled={submitting || !csrfToken}
                      onClick={() => handleRevoke(invite)}
                    >
                      Revoke
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {acceptedInvites.length > 0 && (
            <Card className="p-6">
              <h2 className="text-base font-semibold text-foreground">Accepted invites</h2>
              <div className="mt-4 space-y-3">
                {acceptedInvites.map((invite) => (
                  <div
                    key={invite.invite_id}
                    className="rounded-xl border border-border px-4 py-3 text-sm text-muted-foreground"
                  >
                    {invite.email} · Accepted {formatDate(invite.accepted_at)}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {revokedInvites.length > 0 && (
            <Card className="p-6">
              <h2 className="text-base font-semibold text-foreground">Revoked invites</h2>
              <div className="mt-4 space-y-3">
                {revokedInvites.map((invite) => (
                  <div
                    key={invite.invite_id}
                    className="rounded-xl border border-border px-4 py-3 text-sm text-muted-foreground"
                  >
                    {invite.email} · Revoked {formatDate(invite.revoked_at)}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {expiredInvites.length > 0 && (
            <Card className="p-6">
              <h2 className="text-base font-semibold text-foreground">Expired invites</h2>
              <div className="mt-4 space-y-3">
                {expiredInvites.map((invite) => (
                  <div
                    key={invite.invite_id}
                    className="rounded-xl border border-border px-4 py-3 text-sm text-muted-foreground"
                  >
                    {invite.email} · Expired {formatDate(invite.expires_at)}
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-base font-semibold text-foreground">Invite a teammate</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Send a secure link and onboard them to this workspace.
            </p>
            <form className="mt-4 space-y-3" onSubmit={handleCreateInvite}>
              <Input
                placeholder="person@company.com"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
              <Select
                value={role}
                onValueChange={setRole}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  {roleOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                className="w-full"
                variant="primary"
                disabled={submitting || !csrfToken}
                type="submit"
              >
                Send invite
              </Button>
            </form>
          </Card>

          <Card className="bg-muted/40 p-6">
            <h3 className="text-sm font-semibold text-foreground">Tips</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>Invite links expire after two weeks.</li>
              <li>Use “Copy link” if email delivery is unavailable.</li>
              <li>Only admins can create or revoke invites.</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  )
}

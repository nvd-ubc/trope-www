'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCsrfToken } from '@/lib/client/use-csrf-token'

type OrgProfile = {
  org_id: string
  name: string
  created_at: string
  created_by: string
  run_retention_days?: number | null
  alert_digest_enabled?: boolean | null
  alert_digest_hour_utc?: number | null
}

type OrgMembership = {
  org_id: string
  user_id: string
  role: string
  status: string
  created_at: string
}

type MemberRecord = {
  org_id: string
  user_id: string
  role: string
  status: string
  created_at: string
  email?: string
  display_name?: string
  removed_at?: string
}

type OrgProfileResponse = {
  org: OrgProfile
  membership?: OrgMembership
}

type MembersResponse = {
  members: MemberRecord[]
}

export default function SettingsClient({ orgId }: { orgId: string }) {
  const router = useRouter()
  const { token: csrfToken } = useCsrfToken()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [requestId, setRequestId] = useState<string | null>(null)
  const [org, setOrg] = useState<OrgProfile | null>(null)
  const [membership, setMembership] = useState<OrgMembership | null>(null)
  const [owners, setOwners] = useState<MemberRecord[]>([])
  const [ownersError, setOwnersError] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [runRetentionDays, setRunRetentionDays] = useState('')
  const [alertDigestEnabled, setAlertDigestEnabled] = useState(false)
  const [alertDigestHour, setAlertDigestHour] = useState('9')
  const [saving, setSaving] = useState(false)
  const [supportError, setSupportError] = useState<string | null>(null)
  const [supportLoading, setSupportLoading] = useState(false)
  const [supportToken, setSupportToken] = useState<string | null>(null)
  const [supportExpiresAt, setSupportExpiresAt] = useState<number | null>(null)
  const [supportScopes, setSupportScopes] = useState<string[]>(['members', 'invites', 'audit'])
  const [supportNote, setSupportNote] = useState('')
  const [supportTtl, setSupportTtl] = useState('60')
  const [supportCopied, setSupportCopied] = useState(false)

  const isAdmin = membership?.role === 'org_owner' || membership?.role === 'org_admin'

  const formatDateTime = (value?: number | null) => {
    if (!value) return 'Unknown'
    const date = new Date(value * 1000)
    if (Number.isNaN(date.getTime())) return 'Unknown'
    return date.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  const copyRequestId = async () => {
    if (!requestId) return
    try {
      await navigator.clipboard.writeText(requestId)
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    let active = true
    const run = async () => {
      try {
        setRequestId(null)
        setOwners([])
        setOwnersError(null)
        setSupportToken(null)
        setSupportExpiresAt(null)
        setSupportError(null)
        setSupportCopied(false)
        const response = await fetch(`/api/orgs/${encodeURIComponent(orgId)}`, { cache: 'no-store' })
        if (response.status === 401) {
          router.replace(`/signin?next=/dashboard/workspaces/${encodeURIComponent(orgId)}/settings`)
          return
        }
        const payload = (await response.json().catch(() => null)) as OrgProfileResponse | null
        if (!response.ok || !payload) {
          throw new Error('Unable to load workspace settings.')
        }
        if (!active) return
        setOrg(payload.org)
        setName(payload.org?.name ?? '')
        setRunRetentionDays(
          typeof payload.org?.run_retention_days === 'number'
            ? String(payload.org.run_retention_days)
            : ''
        )
        setAlertDigestEnabled(payload.org?.alert_digest_enabled ?? false)
        setAlertDigestHour(
          typeof payload.org?.alert_digest_hour_utc === 'number'
            ? String(payload.org.alert_digest_hour_utc)
            : '9'
        )
        setMembership(payload.membership ?? null)

        if (payload.membership?.role === 'org_owner' || payload.membership?.role === 'org_admin') {
          const membersResponse = await fetch(`/api/orgs/${encodeURIComponent(orgId)}/members`, {
            cache: 'no-store',
          })
          if (membersResponse.status === 401) {
            router.replace(`/signin?next=/dashboard/workspaces/${encodeURIComponent(orgId)}/settings`)
            return
          }
          if (membersResponse.ok) {
            const membersPayload = (await membersResponse.json().catch(() => null)) as MembersResponse | null
            const ownerList =
              membersPayload?.members?.filter(
                (member) => member.role === 'org_owner' && member.status === 'active'
              ) ?? []
            if (!active) return
            setOwners(ownerList)
            setOwnersError(null)
          } else {
            setOwnersError('Unable to load workspace owners.')
          }
        } else {
          setOwnersError('Owners list is available to workspace admins.')
        }
        setLoading(false)
      } catch (err) {
        if (!active) return
        setError(err instanceof Error ? err.message : 'Unable to load workspace settings.')
        setLoading(false)
      }
    }
    run()
    return () => {
      active = false
    }
  }, [orgId, router])

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!isAdmin) {
      setError('Admin access is required to update workspace settings.')
      return
    }
    if (!csrfToken) return
    if (!name.trim()) {
      setError('Workspace name is required.')
      return
    }
    const retentionValue = Number.parseInt(runRetentionDays, 10)
    const retentionDays =
      Number.isFinite(retentionValue) && retentionValue > 0 ? retentionValue : null
    const digestHourValue = Number.parseInt(alertDigestHour, 10)
    const digestHour =
      Number.isFinite(digestHourValue) && digestHourValue >= 0 && digestHourValue <= 23
        ? digestHourValue
        : null
    setSaving(true)
    setError(null)
    setRequestId(null)
    try {
      const response = await fetch(`/api/orgs/${encodeURIComponent(orgId)}`, {
        method: 'PATCH',
        headers: {
          'content-type': 'application/json',
          'x-csrf-token': csrfToken,
        },
        body: JSON.stringify({
          name: name.trim(),
          run_retention_days: retentionDays,
          alert_digest_enabled: alertDigestEnabled,
          alert_digest_hour_utc: alertDigestEnabled ? digestHour : null,
        }),
      })
      const payload = (await response.json().catch(() => null)) as OrgProfileResponse | null
      if (!response.ok) {
        setRequestId(response.headers.get('x-trope-request-id'))
        const message = (payload as unknown as { message?: string })?.message
        throw new Error(message || 'Unable to update workspace.')
      }
      setOrg(payload?.org ?? null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update workspace.')
    } finally {
      setSaving(false)
    }
  }

  const hasAllScopes = supportScopes.includes('all')
  const supportScopeState = {
    members: hasAllScopes || supportScopes.includes('members'),
    invites: hasAllScopes || supportScopes.includes('invites'),
    audit: hasAllScopes || supportScopes.includes('audit'),
  }

  const toggleScope = (scope: string) => {
    setSupportScopes((prev) =>
      prev.includes(scope) ? prev.filter((value) => value !== scope) : [...prev, scope]
    )
  }

  const handleGenerateSupportToken = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!csrfToken || !isAdmin) return
    if (supportScopes.length === 0) {
      setSupportError('Select at least one support scope.')
      return
    }

    const ttlMinutes = Number.parseInt(supportTtl, 10)
    const ttlValue = Number.isFinite(ttlMinutes) ? ttlMinutes : 60

    setSupportLoading(true)
    setSupportError(null)
    setSupportCopied(false)
    try {
      const response = await fetch(`/api/orgs/${encodeURIComponent(orgId)}/support-token`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-csrf-token': csrfToken,
        },
        body: JSON.stringify({
          ttl_minutes: ttlValue,
          scopes: supportScopes,
          note: supportNote.trim() ? supportNote.trim() : undefined,
        }),
      })

      if (response.status === 401) {
        router.replace(`/signin?next=/dashboard/workspaces/${encodeURIComponent(orgId)}/settings`)
        return
      }

      const payload = (await response.json().catch(() => null)) as
        | {
            support_token?: string
            expires_at?: number
            scopes?: string[]
            message?: string
          }
        | null

      if (!response.ok) {
        throw new Error(payload?.message || 'Unable to generate support token.')
      }

      setSupportToken(payload?.support_token ?? null)
      setSupportExpiresAt(payload?.expires_at ?? null)
      setSupportScopes(payload?.scopes ?? supportScopes)
    } catch (err) {
      setSupportError(err instanceof Error ? err.message : 'Unable to generate support token.')
    } finally {
      setSupportLoading(false)
    }
  }

  const handleCopySupportToken = async () => {
    if (!supportToken) return
    try {
      await navigator.clipboard.writeText(supportToken)
      setSupportCopied(true)
      setTimeout(() => setSupportCopied(false), 2000)
    } catch {
      setSupportError('Unable to copy support token. Please copy it manually.')
    }
  }

  if (loading) {
    return <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">Loading settings…</div>
  }

  const digestHourOptions = Array.from({ length: 24 }, (_, idx) => idx)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Workspace settings</h1>
          <p className="mt-1 text-sm text-slate-600">Update the workspace name and defaults.</p>
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
          {requestId && (
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-rose-600">
              <span>Request ID: {requestId}</span>
              <button
                onClick={copyRequestId}
                className="rounded-full border border-rose-200 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-rose-600"
              >
                Copy
              </button>
            </div>
          )}
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-base font-semibold text-slate-900">Workspace name</h2>
        <form className="mt-4 space-y-3" onSubmit={handleSave}>
          <input
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#1861C8] focus:ring-1 focus:ring-[#1861C8]"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Workspace name"
            disabled={!isAdmin}
          />
          <button
            className="rounded-full bg-[#1861C8] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2171d8] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={saving || !csrfToken || !isAdmin}
            type="submit"
          >
            Save changes
          </button>
        </form>
        {!isAdmin && (
          <p className="mt-3 text-xs text-slate-500">Admin access is required to rename a workspace.</p>
        )}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-base font-semibold text-slate-900">Workflow defaults</h2>
        <p className="mt-1 text-sm text-slate-600">
          Configure retention and alert cadence for workflow reliability reporting.
        </p>
        <form className="mt-4 space-y-4" onSubmit={handleSave}>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm text-slate-700">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Run retention (days)
              </span>
              <input
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#1861C8] focus:ring-1 focus:ring-[#1861C8]"
                value={runRetentionDays}
                onChange={(event) => setRunRetentionDays(event.target.value)}
                placeholder="e.g. 90"
                disabled={!isAdmin}
              />
            </label>
            <label className="space-y-2 text-sm text-slate-700">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Alert digest hour (UTC)
              </span>
              <select
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-[#1861C8] focus:ring-1 focus:ring-[#1861C8]"
                value={alertDigestHour}
                onChange={(event) => setAlertDigestHour(event.target.value)}
                disabled={!isAdmin || !alertDigestEnabled}
              >
                {digestHourOptions.map((hour) => (
                  <option key={hour} value={hour}>
                    {hour.toString().padStart(2, '0')}:00
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={alertDigestEnabled}
              onChange={(event) => setAlertDigestEnabled(event.target.checked)}
              disabled={!isAdmin}
            />
            Enable daily alert digest
          </label>

          <button
            className="rounded-full bg-[#1861C8] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2171d8] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={saving || !csrfToken || !isAdmin}
            type="submit"
          >
            {saving ? 'Saving…' : 'Save defaults'}
          </button>
        </form>
        {!isAdmin && (
          <p className="mt-3 text-xs text-slate-500">Admin access is required to update defaults.</p>
        )}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-base font-semibold text-slate-900">Access</h2>
        <div className="mt-4 space-y-3 text-sm text-slate-600">
          <div>
            <div className="text-xs uppercase tracking-wide text-slate-400">Your role</div>
            <div className="text-slate-900">{membership?.role?.replace('org_', '') ?? 'Unknown'}</div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wide text-slate-400">Workspace owners</div>
            {owners.length > 0 ? (
              <div className="mt-1 space-y-1">
                {owners.map((owner) => (
                  <div key={owner.user_id} className="text-slate-900">
                    {owner.email || owner.display_name || owner.user_id}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-slate-500">{ownersError ?? 'No owners listed yet.'}</div>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-base font-semibold text-slate-900">Support access</h2>
        <p className="mt-1 text-sm text-slate-600">
          Generate a time-limited support token for Trope support. Tokens are read-only and audited.
        </p>

        {!isAdmin && (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            Only workspace admins can generate support tokens.
          </div>
        )}

        {isAdmin && (
          <form className="mt-4 space-y-4" onSubmit={handleGenerateSupportToken}>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-slate-400">
                Token duration
              </label>
              <select
                className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-[#1861C8] focus:ring-1 focus:ring-[#1861C8]"
                value={supportTtl}
                onChange={(event) => setSupportTtl(event.target.value)}
              >
                <option value="15">15 minutes</option>
                <option value="60">1 hour</option>
                <option value="240">4 hours</option>
                <option value="1440">24 hours</option>
              </select>
            </div>

            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">Scopes</div>
              <div className="mt-2 grid gap-2 text-sm text-slate-700">
                {[
                  { key: 'members', label: 'Members' },
                  { key: 'invites', label: 'Invites' },
                  { key: 'audit', label: 'Audit log' },
                ].map((scope) => (
                  <label key={scope.key} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={supportScopeState[scope.key as keyof typeof supportScopeState]}
                      onChange={() => toggleScope(scope.key)}
                    />
                    {scope.label}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-slate-400" htmlFor="support-note">
                Note (optional)
              </label>
              <input
                id="support-note"
                className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#1861C8] focus:ring-1 focus:ring-[#1861C8]"
                placeholder="Why are you issuing this token?"
                value={supportNote}
                onChange={(event) => setSupportNote(event.target.value)}
              />
            </div>

            {supportError && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {supportError}
              </div>
            )}

            <button
              className="rounded-full bg-[#1861C8] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2171d8] disabled:cursor-not-allowed disabled:opacity-60"
              disabled={supportLoading || !csrfToken}
              type="submit"
            >
              {supportLoading ? 'Generating…' : 'Generate support token'}
            </button>
          </form>
        )}

        {supportToken && (
          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
            <div className="text-xs font-semibold uppercase tracking-wide text-emerald-600">Support token</div>
            <div className="mt-2 break-all font-mono text-xs text-emerald-900">{supportToken}</div>
            <div className="mt-2 text-xs text-emerald-700">
              Expires {formatDateTime(supportExpiresAt)} · Scopes {supportScopes.join(', ') || 'members, invites, audit'}
            </div>
            <button
              className="mt-3 rounded-full border border-emerald-200 bg-white px-3 py-1.5 text-xs font-medium text-emerald-800 hover:border-emerald-300"
              onClick={handleCopySupportToken}
            >
              {supportCopied ? 'Copied' : 'Copy token'}
            </button>
          </div>
        )}
      </div>

      {org?.org_id && (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
          Workspace ID: <span className="text-slate-900">{org.org_id}</span>
        </div>
      )}
    </div>
  )
}

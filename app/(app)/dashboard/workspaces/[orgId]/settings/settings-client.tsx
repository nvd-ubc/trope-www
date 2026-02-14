'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Alert } from '@/components/ui/alert'
import Button from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'
import Card from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field'
import { InputGroup, InputGroupInput } from '@/components/ui/input-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useCsrfToken } from '@/lib/client/use-csrf-token'
import { PageHeader, PageHeaderSkeleton, SectionCardSkeleton } from '@/components/dashboard'

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

type SettingsBootstrapResponse = {
  org?: OrgProfileResponse | null
  members?: MembersResponse | null
  error?: string
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
        const response = await fetch(`/api/orgs/${encodeURIComponent(orgId)}/settings/bootstrap`, {
          cache: 'no-store',
        })
        if (response.status === 401) {
          router.replace(`/signin?next=/dashboard/workspaces/${encodeURIComponent(orgId)}/settings`)
          return
        }
        const payload = (await response.json().catch(() => null)) as SettingsBootstrapResponse | null
        if (!response.ok || !payload?.org) {
          throw new Error('Unable to load workspace settings.')
        }
        if (!active) return
        setOrg(payload.org.org)
        setName(payload.org.org?.name ?? '')
        setRunRetentionDays(
          typeof payload.org.org?.run_retention_days === 'number'
            ? String(payload.org.org.run_retention_days)
            : ''
        )
        setAlertDigestEnabled(payload.org.org?.alert_digest_enabled ?? false)
        setAlertDigestHour(
          typeof payload.org.org?.alert_digest_hour_utc === 'number'
            ? String(payload.org.org.alert_digest_hour_utc)
            : '9'
        )
        setMembership(payload.org.membership ?? null)

        if (
          payload.org.membership?.role === 'org_owner' ||
          payload.org.membership?.role === 'org_admin'
        ) {
          const ownerList =
            payload.members?.members?.filter(
              (member) => member.role === 'org_owner' && member.status === 'active'
            ) ?? []
          setOwners(ownerList)
          setOwnersError(null)
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
    return (
      <div className="space-y-6">
        <PageHeaderSkeleton
          title="Workspace settings"
          description="Update workspace defaults, ownership context, and support access."
        />
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <SectionCardSkeleton rows={8} />
          <SectionCardSkeleton rows={5} />
        </div>
        <SectionCardSkeleton rows={2} />
      </div>
    )
  }

  const digestHourOptions = Array.from({ length: 24 }, (_, idx) => idx)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Workspace settings"
        description="Update workspace defaults, ownership context, and support access."
        backHref={`/dashboard/workspaces/${encodeURIComponent(orgId)}`}
        backLabel="Back to workspace"
      />

      {error && (
        <Alert variant="destructive">
          <div>{error}</div>
          {requestId && (
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-destructive/80">
              <span>Request ID: {requestId}</span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={copyRequestId}
                className="h-7 px-2 text-[10px] uppercase tracking-wide"
              >
                Copy
              </Button>
            </div>
          )}
        </Alert>
      )}

      <Card className="p-6">
        <h2 className="text-base font-semibold text-foreground">Workspace name</h2>
        <form className="mt-4" onSubmit={handleSave}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="workspace-name">Workspace name</FieldLabel>
              <InputGroup>
                <InputGroupInput
                  id="workspace-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Workspace name"
                  disabled={!isAdmin}
                />
              </InputGroup>
            </Field>
            <ButtonGroup>
              <Button
                variant="primary"
                disabled={saving || !csrfToken || !isAdmin}
                type="submit"
              >
                Save changes
              </Button>
            </ButtonGroup>
          </FieldGroup>
        </form>
        {!isAdmin && (
          <p className="mt-3 text-xs text-muted-foreground">Admin access is required to rename a workspace.</p>
        )}
      </Card>

      <Card className="p-6">
        <h2 className="text-base font-semibold text-foreground">Workflow defaults</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Configure retention and alert cadence for workflow reliability reporting.
        </p>
        <form className="mt-4" onSubmit={handleSave}>
          <FieldGroup className="gap-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="run-retention-days">Run retention (days)</FieldLabel>
                <InputGroup>
                  <InputGroupInput
                    id="run-retention-days"
                    value={runRetentionDays}
                    onChange={(event) => setRunRetentionDays(event.target.value)}
                    placeholder="e.g. 90"
                    disabled={!isAdmin}
                  />
                </InputGroup>
              </Field>
              <Field>
                <FieldLabel htmlFor="alert-digest-hour">Alert digest hour (UTC)</FieldLabel>
                <Select
                  value={alertDigestHour}
                  onValueChange={setAlertDigestHour}
                  disabled={!isAdmin || !alertDigestEnabled}
                >
                  <SelectTrigger id="alert-digest-hour" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {digestHourOptions.map((hour) => (
                      <SelectItem key={hour} value={String(hour)}>
                        {hour.toString().padStart(2, '0')}:00
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>

            <Field>
              <label className="flex items-center gap-2 text-sm text-foreground" htmlFor="alert-digest-enabled">
                <Checkbox
                  id="alert-digest-enabled"
                  checked={alertDigestEnabled}
                  onCheckedChange={(checked) => setAlertDigestEnabled(checked === true)}
                  disabled={!isAdmin}
                />
                Enable daily alert digest
              </label>
              <FieldDescription>
                Send one daily summary of unresolved alerts to workspace admins.
              </FieldDescription>
            </Field>

            <ButtonGroup>
              <Button
                variant="primary"
                disabled={saving || !csrfToken || !isAdmin}
                type="submit"
              >
                {saving ? 'Saving…' : 'Save defaults'}
              </Button>
            </ButtonGroup>
          </FieldGroup>
        </form>
        {!isAdmin && (
          <p className="mt-3 text-xs text-muted-foreground">Admin access is required to update defaults.</p>
        )}
      </Card>

      <Card className="p-6">
        <h2 className="text-base font-semibold text-foreground">Access</h2>
        <div className="mt-4 space-y-3 text-sm text-muted-foreground">
          <div>
            <div className="text-xs uppercase tracking-wide text-muted-foreground">Your role</div>
            <div className="text-foreground">{membership?.role?.replace('org_', '') ?? 'Unknown'}</div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wide text-muted-foreground">Workspace owners</div>
            {owners.length > 0 ? (
              <div className="mt-1 space-y-1">
                {owners.map((owner) => (
                  <div key={owner.user_id} className="text-foreground">
                    {owner.email || owner.display_name || owner.user_id}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-muted-foreground">{ownersError ?? 'No owners listed yet.'}</div>
            )}
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-base font-semibold text-foreground">Support access</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Generate a time-limited support token for Trope support. Tokens are read-only and audited.
        </p>

        {!isAdmin && (
          <Alert className="mt-4 border-amber-200 bg-amber-50 text-amber-800">
            Only workspace admins can generate support tokens.
          </Alert>
        )}

        {isAdmin && (
          <form className="mt-4" onSubmit={handleGenerateSupportToken}>
            <FieldGroup className="gap-4">
              <Field>
                <FieldLabel htmlFor="support-token-duration">Token duration</FieldLabel>
                <Select value={supportTtl} onValueChange={setSupportTtl}>
                  <SelectTrigger id="support-token-duration" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="240">4 hours</SelectItem>
                    <SelectItem value="1440">24 hours</SelectItem>
                  </SelectContent>
                </Select>
              </Field>

              <Field>
                <FieldLabel>Scopes</FieldLabel>
                <div className="grid gap-2 text-sm text-foreground">
                  {[
                    { key: 'members', label: 'Members' },
                    { key: 'invites', label: 'Invites' },
                    { key: 'audit', label: 'Audit log' },
                  ].map((scope) => (
                    <label key={scope.key} className="flex items-center gap-2" htmlFor={`support-scope-${scope.key}`}>
                      <Checkbox
                        id={`support-scope-${scope.key}`}
                        checked={supportScopeState[scope.key as keyof typeof supportScopeState]}
                        onCheckedChange={() => toggleScope(scope.key)}
                      />
                      {scope.label}
                    </label>
                  ))}
                </div>
              </Field>

              <Field>
                <FieldLabel htmlFor="support-note">Note (optional)</FieldLabel>
                <InputGroup>
                  <InputGroupInput
                    id="support-note"
                    placeholder="Why are you issuing this token?"
                    value={supportNote}
                    onChange={(event) => setSupportNote(event.target.value)}
                  />
                </InputGroup>
              </Field>

              {supportError && <Alert variant="destructive">{supportError}</Alert>}

              <ButtonGroup>
                <Button
                  variant="primary"
                  disabled={supportLoading || !csrfToken}
                  type="submit"
                >
                  {supportLoading ? 'Generating…' : 'Generate support token'}
                </Button>
              </ButtonGroup>
            </FieldGroup>
          </form>
        )}

        {supportToken && (
          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
            <div className="text-xs font-semibold uppercase tracking-wide text-emerald-600">Support token</div>
            <div className="mt-2 break-all font-mono text-xs text-emerald-900">{supportToken}</div>
            <div className="mt-2 text-xs text-emerald-700">
              Expires {formatDateTime(supportExpiresAt)} · Scopes {supportScopes.join(', ') || 'members, invites, audit'}
            </div>
            <ButtonGroup className="mt-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="border-emerald-300 text-emerald-800 hover:bg-emerald-100 hover:text-emerald-900"
                onClick={handleCopySupportToken}
              >
                {supportCopied ? 'Copied' : 'Copy token'}
              </Button>
            </ButtonGroup>
          </div>
        )}
      </Card>

      {org?.org_id && (
        <Card className="bg-muted/40 p-6 text-sm text-muted-foreground">
          Workspace ID: <span className="text-foreground">{org.org_id}</span>
        </Card>
      )}
    </div>
  )
}

'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCsrfToken } from '@/lib/client/use-csrf-token'
import { safeInternalPath } from '@/lib/profile-identity'
import Button from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'
import { Alert } from '@/components/ui/alert'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { InputGroup, InputGroupInput } from '@/components/ui/input-group'
import {
  PageHeaderSkeleton,
  ErrorNotice,
  PageHeader,
  SectionCardSkeleton,
  SectionCard,
} from '@/components/dashboard'

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

type AccountBootstrapResponse = {
  me?: MeResponse | null
  orgs?: OrgsResponse | null
  error?: string
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
        const response = await fetch('/api/dashboard/account/bootstrap', { cache: 'no-store' })
        if (response.status === 401) {
          router.replace('/signin?next=/dashboard/account')
          return
        }

        const payload = (await response.json().catch(() => null)) as AccountBootstrapResponse | null
        if (!response.ok || !payload?.me || !payload?.orgs) {
          throw new Error('Unable to load account details.')
        }

        if (!active) return
        setMe(payload.me)
        setOrgs(payload.orgs)
        setFirstName(payload.me.first_name ?? '')
        setLastName(payload.me.last_name ?? '')
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
    return (
      <div className="space-y-6">
        <PageHeaderSkeleton
          title="Account"
          description="Manage your profile, plan, and security settings."
        />
        <div className="grid gap-6 lg:grid-cols-2">
          <SectionCardSkeleton rows={5} />
          <SectionCardSkeleton rows={4} />
        </div>
        <SectionCardSkeleton rows={1} />
      </div>
    )
  }

  if (error || !me || !orgs) {
    return (
      <ErrorNotice message={error ?? 'Unable to load account details.'} title="Unable to load account" />
    )
  }

  const emailDisplay = me.email?.trim() ? me.email : null

  return (
    <div className="space-y-6">
      <PageHeader
        title="Account"
        description="Manage your profile, plan, and security settings."
        backHref="/dashboard"
        backLabel="Back to dashboard"
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="Profile">
          {completeProfile && (
            <Alert className="border-amber-200 bg-amber-50 text-amber-800">
              Add your first and last name to continue using workspace pages.
            </Alert>
          )}
          {saveError && <ErrorNotice message={saveError} title="Profile update failed" />}
          {saveMessage && (
            <Alert className="border-emerald-200 bg-emerald-50 text-emerald-700">
              {saveMessage}
            </Alert>
          )}
          <FieldGroup className="grid gap-3 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="account-first-name">First Name</FieldLabel>
              <InputGroup>
                <InputGroupInput
                  id="account-first-name"
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                  placeholder="First name"
                />
              </InputGroup>
            </Field>
            <Field>
              <FieldLabel htmlFor="account-last-name">Last Name</FieldLabel>
              <InputGroup>
                <InputGroupInput
                  id="account-last-name"
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                  placeholder="Last name"
                />
              </InputGroup>
            </Field>
          </FieldGroup>
          <div className="flex flex-wrap items-center gap-3">
            <ButtonGroup>
              <Button disabled={savePending || csrfLoading || !csrfToken || !isDirty} onClick={submitProfile}>
                {savePending ? 'Saving…' : 'Save profile'}
              </Button>
            </ButtonGroup>
            {saveRequestId && (
              <span className="text-xs text-muted-foreground">Request ID {saveRequestId}</span>
            )}
          </div>

          <div className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
            <div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground">Email</div>
              <div className={emailDisplay ? 'text-foreground' : 'text-muted-foreground'}>
                {emailDisplay ?? 'Not available'}
              </div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground">Display name</div>
              <div className="text-foreground">{me.display_name ?? 'Not set'}</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground">Account ID</div>
              <div className="break-all font-mono text-xs text-foreground">{me.sub}</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground">Plan</div>
              <div className="text-foreground">{me.plan?.name ?? 'Unknown'}</div>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title="Workspaces"
          action={
            <Button asChild variant="outline" size="sm">
              <Link href="/dashboard/workspaces">Manage workspaces</Link>
            </Button>
          }
        >
          <div className="space-y-3 text-sm text-muted-foreground">
            <div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground">Default workspace</div>
              <div className="text-foreground">{defaultOrg?.name ?? orgs.default_org_id ?? 'Not set'}</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground">Personal workspace</div>
              <div className="text-foreground">{personalOrg?.name ?? orgs.personal_org_id ?? 'Not set'}</div>
            </div>
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Security">
        <div className="flex flex-wrap items-center gap-3">
          <Button asChild variant="outline">
            <Link href="/reset-password">Reset password</Link>
          </Button>
        </div>
      </SectionCard>
    </div>
  )
}

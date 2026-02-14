'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useCsrfToken } from '@/lib/client/use-csrf-token'
import { notifyOrgListUpdated } from '../../org-list-cache'
import Button from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'
import Card from '@/components/ui/card'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { InputGroup, InputGroupInput } from '@/components/ui/input-group'
import {
  DataTableSkeleton,
  EmptyState,
  ErrorNotice,
  InlineStatus,
  PageHeader,
  SectionCard,
} from '@/components/dashboard'

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

  const sortedOrgs = useMemo(() => {
    const list = [...orgs]
    list.sort((a, b) => {
      if (a.org_id === defaultOrgId) return -1
      if (b.org_id === defaultOrgId) return 1
      return (a.name || a.org_id).localeCompare(b.name || b.org_id)
    })
    return list
  }, [orgs, defaultOrgId])

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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update default workspace.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Workspaces"
          description="Choose defaults and manage team workspaces."
          backHref="/dashboard"
          backLabel="Back to dashboard"
        />
        <DataTableSkeleton rows={5} columns={5} />
      </div>
    )
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="space-y-4">
        <PageHeader
          title="Workspaces"
          description="Choose defaults and manage team workspaces."
          backHref="/dashboard"
          backLabel="Back to dashboard"
        />
        {error && <ErrorNotice message={error} title="Workspace action failed" />}

        <SectionCard title="Your workspaces">
          {sortedOrgs.length === 0 && (
            <EmptyState
              title="No workspaces yet"
              description="Create your first workspace to start publishing and running workflows."
              className="py-8"
            />
          )}

          <div className="space-y-3">
            {sortedOrgs.map((org) => {
              const isDefault = org.org_id === defaultOrgId
              const isPersonal = org.org_id === personalOrgId
              return (
                <div
                  key={org.org_id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card px-4 py-4"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="text-sm font-semibold text-foreground">
                        {org.name || org.org_id}
                      </div>
                      {isDefault && <InlineStatus variant="success">Default</InlineStatus>}
                      {isPersonal && <InlineStatus>Personal</InlineStatus>}
                      <InlineStatus>{org.role.replace('org_', '')}</InlineStatus>
                    </div>
                    <div className="text-xs text-muted-foreground">Created {formatDate(org.created_at)}</div>
                  </div>
                  <ButtonGroup>
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/dashboard/workspaces/${encodeURIComponent(org.org_id)}`}>Open</Link>
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={isDefault || submitting || !csrfToken}
                      onClick={() => handleMakeDefault(org.org_id)}
                    >
                      Make default
                    </Button>
                  </ButtonGroup>
                </div>
              )
            })}
          </div>
        </SectionCard>
      </div>

      <div className="space-y-4">
        <SectionCard
          title="Create a workspace"
          description="Workspaces let you invite teammates and share workflows."
        >
          <form onSubmit={handleCreate}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="create-workspace-name">Workspace name</FieldLabel>
                <InputGroup>
                  <InputGroupInput
                    id="create-workspace-name"
                    placeholder="Workspace name"
                    value={createName}
                    onChange={(event) => setCreateName(event.target.value)}
                  />
                </InputGroup>
              </Field>
              <ButtonGroup className="w-full">
                <Button className="w-full" disabled={submitting || !csrfToken} type="submit">
                  Create workspace
                </Button>
              </ButtonGroup>
            </FieldGroup>
          </form>
        </SectionCard>

        <Card className="p-6 text-sm text-muted-foreground">
          <h3 className="text-sm font-semibold text-foreground">Next steps</h3>
          <ul className="mt-3 space-y-2">
            <li>Set your default workspace for desktop clients.</li>
            <li>Create invites when you are ready to onboard teammates.</li>
            <li>Manage roles and ownership from workspace settings.</li>
          </ul>
        </Card>
      </div>
    </div>
  )
}

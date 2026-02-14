'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search } from 'lucide-react'
import { useCsrfToken } from '@/lib/client/use-csrf-token'
import { Alert } from '@/components/ui/alert'
import Button from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'
import Card from '@/components/ui/card'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from '@/components/ui/input-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DataTableSkeleton, DataToolbar, ErrorNotice, PageHeader } from '@/components/dashboard'

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

type MembersResponse = {
  members: MemberRecord[]
}

type MeResponse = {
  sub: string
}

type MembersBootstrapResponse = {
  members?: MembersResponse | null
  me?: MeResponse | null
  error?: string
}

const roleOptions = [
  { value: 'org_owner', label: 'Owner' },
  { value: 'org_admin', label: 'Admin' },
  { value: 'org_member', label: 'Member' },
]

const formatDate = (value?: string) => {
  if (!value) return 'Unknown'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

const memberPrimaryLabel = (member: MemberRecord) =>
  member.display_name?.trim() || member.email || member.user_id

const memberSecondaryEmail = (member: MemberRecord) => {
  if (member.display_name?.trim() && member.email) {
    return member.email
  }
  return null
}

export default function MembersClient({ orgId }: { orgId: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { token: csrfToken } = useCsrfToken()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [members, setMembers] = useState<MemberRecord[]>([])
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [pendingAction, setPendingAction] = useState<string | null>(null)
  const [roleOverrides, setRoleOverrides] = useState<Record<string, string>>({})
  const queryFromUrl = searchParams.get('query') ?? ''
  const [query, setQuery] = useState(queryFromUrl)

  useEffect(() => {
    if (queryFromUrl !== query) {
      setQuery(queryFromUrl)
    }
  }, [queryFromUrl, query])

  const loadMembers = useCallback(async () => {
    const response = await fetch(`/api/orgs/${encodeURIComponent(orgId)}/members/bootstrap`, {
      cache: 'no-store',
    })

    if (response.status === 401) {
      router.replace(`/signin?next=/dashboard/workspaces/${encodeURIComponent(orgId)}/members`)
      return
    }

    const payload = (await response.json().catch(() => null)) as MembersBootstrapResponse | null
    if (!response.ok || !payload?.members) {
      throw new Error('Unable to load members.')
    }

    setMembers(payload.members.members ?? [])
    if (payload.me?.sub) {
      setCurrentUserId(payload.me.sub)
    }
  }, [orgId, router])

  useEffect(() => {
    let active = true
    const run = async () => {
      try {
        await loadMembers()
        if (!active) return
        setLoading(false)
      } catch (err) {
        if (!active) return
        setError(err instanceof Error ? err.message : 'Unable to load members.')
        setLoading(false)
      }
    }
    run()
    return () => {
      active = false
    }
  }, [loadMembers])

  const ownerCount = useMemo(
    () => members.filter((member) => member.role === 'org_owner' && member.status === 'active').length,
    [members]
  )

  const currentMember = useMemo(
    () => members.find((member) => member.user_id === currentUserId) ?? null,
    [members, currentUserId]
  )

  const filteredMembers = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return members
    return members.filter((member) => {
      const label = `${member.email ?? ''} ${member.display_name ?? ''} ${member.user_id}`.toLowerCase()
      return label.includes(normalized)
    })
  }, [members, query])

  const canManage = currentMember?.role === 'org_owner' || currentMember?.role === 'org_admin'
  const canPromoteOwner = currentMember?.role === 'org_owner'

  const handleRoleChange = (userId: string, role: string) => {
    setRoleOverrides((prev) => ({ ...prev, [userId]: role }))
  }

  const submitRoleChange = async (member: MemberRecord) => {
    if (!csrfToken) return
    const nextRole = roleOverrides[member.user_id] ?? member.role
    if (nextRole === member.role) return

    setPendingAction(member.user_id)
    setError(null)
    try {
      const response = await fetch(
        `/api/orgs/${encodeURIComponent(orgId)}/members/${encodeURIComponent(member.user_id)}`,
        {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            'x-csrf-token': csrfToken,
          },
          body: JSON.stringify({ role: nextRole }),
        }
      )
      const payload = (await response.json().catch(() => null)) as { message?: string } | null
      if (!response.ok) {
        throw new Error(payload?.message || 'Unable to update role.')
      }
      setMembers((prev) =>
        prev.map((record) =>
          record.user_id === member.user_id ? { ...record, role: nextRole } : record
        )
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update role.')
    } finally {
      setPendingAction(null)
    }
  }

  const removeMember = async (member: MemberRecord) => {
    if (!csrfToken) return
    setPendingAction(member.user_id)
    setError(null)
    try {
      const response = await fetch(
        `/api/orgs/${encodeURIComponent(orgId)}/members/${encodeURIComponent(member.user_id)}`,
        {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            'x-csrf-token': csrfToken,
          },
          body: JSON.stringify({ action: 'remove' }),
        }
      )
      const payload = (await response.json().catch(() => null)) as { message?: string } | null
      if (!response.ok) {
        throw new Error(payload?.message || 'Unable to remove member.')
      }
      setMembers((prev) =>
        prev.map((record) =>
          record.user_id === member.user_id
            ? { ...record, status: 'removed', removed_at: new Date().toISOString() }
            : record
        )
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to remove member.')
    } finally {
      setPendingAction(null)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Members"
          description="Manage access and roles for this workspace."
          backHref={`/dashboard/workspaces/${encodeURIComponent(orgId)}`}
          backLabel="Back to workspace"
        />
        <DataTableSkeleton rows={7} columns={6} />
      </div>
    )
  }

  if (error && members.length === 0) {
    return <ErrorNotice title="Unable to load members" message={error} />
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Members"
        description="Manage access and roles for this workspace."
        backHref={`/dashboard/workspaces/${encodeURIComponent(orgId)}`}
        backLabel="Back to workspace"
      />

      {error && (
        <ErrorNotice title="Member action failed" message={error} />
      )}

      {!canManage && (
        <Alert className="border-amber-200 bg-amber-50 text-amber-800">
          You need admin access to manage members.
        </Alert>
      )}

      <DataToolbar
        summary={`${filteredMembers.length} members`}
        filters={
          <InputGroup className="w-full max-w-xs">
            <InputGroupAddon>
              <InputGroupText>
                <Search />
              </InputGroupText>
            </InputGroupAddon>
            <InputGroupInput
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search members"
            />
          </InputGroup>
        }
      />

      <Card className="p-6">
        <div className="space-y-4">
          {filteredMembers.length === 0 && (
            <div className="rounded-xl border border-dashed border-border bg-muted/40 p-6 text-sm text-muted-foreground">
              No members match this search.
            </div>
          )}
          {filteredMembers.map((member) => {
            const isYou = member.user_id === currentUserId
            const isRemoved = member.status !== 'active'
            const isLastOwner = member.role === 'org_owner' && ownerCount <= 1
            const roleValue = roleOverrides[member.user_id] ?? member.role
            const secondaryEmail = memberSecondaryEmail(member)
            return (
              <div
                key={member.user_id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border px-4 py-4"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="text-sm font-semibold text-foreground">
                      {memberPrimaryLabel(member)}
                    </div>
                    {isYou && (
                      <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                        You
                      </span>
                    )}
                    {isRemoved && (
                      <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                        Removed
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {secondaryEmail ? `${secondaryEmail} · ` : ''}
                    Joined {formatDate(member.created_at)}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Select
                    value={roleValue}
                    disabled={!canManage || isRemoved || isLastOwner}
                    onValueChange={(value) => handleRoleChange(member.user_id, value)}
                  >
                    <SelectTrigger size="sm" className="min-w-[8.5rem]">
                      <SelectValue placeholder="Role" />
                    </SelectTrigger>
                    <SelectContent>
                      {roleOptions.map((option) => (
                        <SelectItem
                          key={option.value}
                          value={option.value}
                          disabled={option.value === 'org_owner' && !canPromoteOwner}
                        >
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <ButtonGroup>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!canManage || isRemoved || pendingAction === member.user_id || !csrfToken}
                      onClick={() => submitRoleChange(member)}
                    >
                      Update
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      disabled={
                        !canManage || isRemoved || isLastOwner || pendingAction === member.user_id || !csrfToken
                      }
                      onClick={() => removeMember(member)}
                    >
                      Remove
                    </Button>
                  </ButtonGroup>
                </div>
              </div>
            )
          })}
        </div>
        {ownerCount <= 1 && (
          <div className="mt-4 text-xs text-muted-foreground">
            At least one owner is required. Promote another member before removing or demoting the last owner.
          </div>
        )}
      </Card>
    </div>
  )
}

'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCsrfToken } from '@/lib/client/use-csrf-token'

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

export default function MembersClient({ orgId }: { orgId: string }) {
  const router = useRouter()
  const { token: csrfToken } = useCsrfToken()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [members, setMembers] = useState<MemberRecord[]>([])
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [pendingAction, setPendingAction] = useState<string | null>(null)
  const [roleOverrides, setRoleOverrides] = useState<Record<string, string>>({})

  const loadMembers = async () => {
    const [membersRes, meRes] = await Promise.all([
      fetch(`/api/orgs/${encodeURIComponent(orgId)}/members`, { cache: 'no-store' }),
      fetch('/api/me', { cache: 'no-store' }),
    ])

    if (membersRes.status === 401 || meRes.status === 401) {
      router.replace(`/signin?next=/dashboard/workspaces/${encodeURIComponent(orgId)}/members`)
      return
    }

    const membersPayload = (await membersRes.json().catch(() => null)) as MembersResponse | null
    const mePayload = (await meRes.json().catch(() => null)) as MeResponse | null

    if (!membersRes.ok || !membersPayload) {
      throw new Error('Unable to load members.')
    }

    setMembers(membersPayload.members ?? [])
    if (mePayload?.sub) {
      setCurrentUserId(mePayload.sub)
    }
  }

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
  }, [orgId])

  const ownerCount = useMemo(
    () => members.filter((member) => member.role === 'org_owner' && member.status === 'active').length,
    [members]
  )

  const currentMember = useMemo(
    () => members.find((member) => member.user_id === currentUserId) ?? null,
    [members, currentUserId]
  )

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
    return <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">Loading members…</div>
  }

  if (error && members.length === 0) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
        {error}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Members</h1>
          <p className="mt-1 text-sm text-slate-600">
            Manage access and roles for this workspace.
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

      {!canManage && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          You need admin access to manage members.
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="space-y-4">
          {members.map((member) => {
            const isYou = member.user_id === currentUserId
            const isRemoved = member.status !== 'active'
            const isLastOwner = member.role === 'org_owner' && ownerCount <= 1
            const roleValue = roleOverrides[member.user_id] ?? member.role
            return (
              <div
                key={member.user_id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 px-4 py-4"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="text-sm font-semibold text-slate-900">
                      {member.email || member.user_id}
                    </div>
                    {isYou && (
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-500">
                        You
                      </span>
                    )}
                    {isRemoved && (
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-500">
                        Removed
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500">Joined {formatDate(member.created_at)}</div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <select
                    className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 disabled:opacity-60"
                    value={roleValue}
                    disabled={!canManage || isRemoved || isLastOwner}
                    onChange={(event) => handleRoleChange(member.user_id, event.target.value)}
                  >
                    {roleOptions.map((option) => (
                      <option
                        key={option.value}
                        value={option.value}
                        disabled={option.value === 'org_owner' && !canPromoteOwner}
                      >
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <button
                    className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:border-slate-300 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={!canManage || isRemoved || pendingAction === member.user_id || !csrfToken}
                    onClick={() => submitRoleChange(member)}
                  >
                    Update
                  </button>
                  <button
                    className="rounded-full border border-rose-200 px-3 py-1.5 text-xs font-medium text-rose-700 hover:border-rose-300 hover:text-rose-800 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={!canManage || isRemoved || isLastOwner || pendingAction === member.user_id || !csrfToken}
                    onClick={() => removeMember(member)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            )
          })}
        </div>
        {ownerCount <= 1 && (
          <div className="mt-4 text-xs text-slate-500">
            At least one owner is required. Promote another member before removing or demoting the last owner.
          </div>
        )}
      </div>
    </div>
  )
}

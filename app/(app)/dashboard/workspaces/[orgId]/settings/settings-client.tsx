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
}

type OrgProfileResponse = {
  org: OrgProfile
}

export default function SettingsClient({ orgId }: { orgId: string }) {
  const router = useRouter()
  const { token: csrfToken } = useCsrfToken()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [org, setOrg] = useState<OrgProfile | null>(null)
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let active = true
    const run = async () => {
      try {
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
    if (!csrfToken) return
    if (!name.trim()) {
      setError('Workspace name is required.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      const response = await fetch(`/api/orgs/${encodeURIComponent(orgId)}`, {
        method: 'PATCH',
        headers: {
          'content-type': 'application/json',
          'x-csrf-token': csrfToken,
        },
        body: JSON.stringify({ name: name.trim() }),
      })
      const payload = (await response.json().catch(() => null)) as OrgProfileResponse | null
      if (!response.ok) {
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

  if (loading) {
    return <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">Loading settings…</div>
  }

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
          />
          <button
            className="rounded-full bg-[#1861C8] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2171d8] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={saving || !csrfToken}
            type="submit"
          >
            Save changes
          </button>
        </form>
      </div>

      {org?.org_id && (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
          Workspace ID: <span className="text-slate-900">{org.org_id}</span>
        </div>
      )}
    </div>
  )
}

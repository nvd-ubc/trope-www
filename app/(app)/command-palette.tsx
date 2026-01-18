'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Input from '@/components/ui/input'

type OrgListResponse = {
  orgs: Array<{ org_id: string }>
  default_org_id?: string | null
}

type WorkflowDefinition = {
  workflow_id: string
  title: string
}

type WorkflowListResponse = {
  workflows: WorkflowDefinition[]
}

type MemberRecord = {
  user_id: string
  email?: string
  display_name?: string
}

type MembersResponse = {
  members: MemberRecord[]
}

type CommandItem = {
  label: string
  path: string
  description?: string
}

const parseActiveOrgId = (pathname: string) => {
  const match = pathname.match(/\/dashboard\/workspaces\/([^/]+)/)
  return match ? decodeURIComponent(match[1]) : null
}

const staticItems: CommandItem[] = [
  { label: 'Workflows', path: 'workflows' },
  { label: 'Runs', path: 'runs' },
  { label: 'Alerts', path: 'alerts' },
  { label: 'Compliance', path: 'compliance' },
  { label: 'Members', path: 'members' },
  { label: 'Invites', path: 'invites' },
  { label: 'Audit log', path: 'audit' },
  { label: 'Settings', path: 'settings' },
]

export default function CommandPalette() {
  const router = useRouter()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [defaultOrgId, setDefaultOrgId] = useState<string | null>(null)
  const [workflowItems, setWorkflowItems] = useState<CommandItem[]>([])
  const [memberItems, setMemberItems] = useState<CommandItem[]>([])
  const [runItems, setRunItems] = useState<CommandItem[]>([])

  useEffect(() => {
    let active = true
    const load = async () => {
      try {
        const response = await fetch('/api/orgs', { cache: 'no-store' })
        if (!response.ok) return
        const payload = (await response.json().catch(() => null)) as OrgListResponse | null
        if (!active) return
        setDefaultOrgId(payload?.default_org_id ?? null)
      } catch {
        if (!active) return
      }
    }
    load()
    return () => {
      active = false
    }
  }, [])

  const activeOrgId = useMemo(() => {
    return parseActiveOrgId(pathname) || defaultOrgId
  }, [pathname, defaultOrgId])

  useEffect(() => {
    if (!isOpen || !activeOrgId) return
    let active = true

    const loadDynamicItems = async () => {
      try {
        const workflowRes = await fetch(`/api/orgs/${encodeURIComponent(activeOrgId)}/workflows`, {
          cache: 'no-store',
        })
        if (workflowRes.ok) {
          const payload = (await workflowRes.json().catch(() => null)) as WorkflowListResponse | null
          const workflows = payload?.workflows ?? []
          if (!active) return
          setWorkflowItems(
            workflows.map((workflow) => ({
              label: `Workflow: ${workflow.title || workflow.workflow_id}`,
              path: `/dashboard/workspaces/${encodeURIComponent(activeOrgId)}/workflows/${encodeURIComponent(
                workflow.workflow_id
              )}`,
              description: workflow.workflow_id,
            }))
          )
          setRunItems(
            workflows.map((workflow) => ({
              label: `Runs: ${workflow.title || workflow.workflow_id}`,
              path: `/dashboard/workspaces/${encodeURIComponent(activeOrgId)}/runs?workflow_id=${encodeURIComponent(
                workflow.workflow_id
              )}`,
              description: 'Filtered runs',
            }))
          )
        }

        const membersRes = await fetch(`/api/orgs/${encodeURIComponent(activeOrgId)}/members`, {
          cache: 'no-store',
        })
        if (membersRes.ok) {
          const membersPayload = (await membersRes.json().catch(() => null)) as MembersResponse | null
          const members = membersPayload?.members ?? []
          if (!active) return
          setMemberItems(
            members.map((member) => {
              const label = member.display_name || member.email || member.user_id
              const queryValue = encodeURIComponent(member.email || member.display_name || member.user_id)
              return {
                label: `Member: ${label}`,
                path: `/dashboard/workspaces/${encodeURIComponent(activeOrgId)}/members?query=${queryValue}`,
                description: member.email ?? member.user_id,
              }
            })
          )
        } else {
          if (active) setMemberItems([])
        }
      } catch {
        if (!active) return
      }
    }

    loadDynamicItems()
    return () => {
      active = false
    }
  }, [activeOrgId, isOpen])

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setIsOpen(true)
      }
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  const allItems = useMemo(() => {
    return [...staticItems, ...workflowItems, ...runItems, ...memberItems]
  }, [workflowItems, runItems, memberItems])

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return allItems
    return allItems.filter((item) => item.label.toLowerCase().includes(normalized))
  }, [query, allItems])

  const handleNavigate = (path: string) => {
    if (path.startsWith('/')) {
      router.push(path)
      setIsOpen(false)
      return
    }
    const base = activeOrgId
      ? `/dashboard/workspaces/${encodeURIComponent(activeOrgId)}`
      : '/dashboard/workspaces'
    router.push(`${base}/${path}`)
    setIsOpen(false)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/40 px-4 py-16">
      <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-4 shadow-xl">
        <div className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
          Jump to
        </div>
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search workflows, runs, alerts…"
          autoFocus
        />
        <div className="mt-4 space-y-1">
          {filtered.map((item) => (
            <button
              key={`${item.path}-${item.label}`}
              className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
              onClick={() => handleNavigate(item.path)}
            >
              <span>{item.label}</span>
              <span className="text-xs text-slate-400">Enter</span>
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="rounded-xl bg-slate-50 px-3 py-4 text-sm text-slate-500">
              No matches yet.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command'

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
  { label: 'Home', path: 'home' },
  { label: 'Documents', path: 'docs' },
  { label: 'Tasks', path: 'tasks' },
  { label: 'Teammates', path: 'teammates' },
  { label: 'Insights', path: 'insights' },
  { label: 'Community', path: 'community' },
  { label: 'Workflows', path: 'workflows' },
  { label: 'Runs', path: 'runs' },
  { label: 'Alerts', path: 'alerts' },
  { label: 'Compliance', path: 'compliance' },
  { label: 'Members (Admin)', path: 'members' },
  { label: 'Invites', path: 'invites' },
  { label: 'Audit log', path: 'audit' },
  { label: 'Settings', path: 'settings' },
]

const matchesCommandItem = (item: CommandItem, normalizedQuery: string) => {
  if (!normalizedQuery) return true
  const label = item.label.toLowerCase()
  const description = item.description?.toLowerCase() ?? ''
  return label.includes(normalizedQuery) || description.includes(normalizedQuery)
}

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
    if (!isOpen) return
    let active = true
    if (!activeOrgId) return

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
        } else if (active) {
          setWorkflowItems([])
          setRunItems([])
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
        setWorkflowItems([])
        setRunItems([])
        setMemberItems([])
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

  const normalizedQuery = query.trim().toLowerCase()

  const filteredStaticItems = useMemo(
    () => staticItems.filter((item) => matchesCommandItem(item, normalizedQuery)),
    [normalizedQuery]
  )
  const filteredWorkflowItems = useMemo(
    () => workflowItems.filter((item) => matchesCommandItem(item, normalizedQuery)),
    [normalizedQuery, workflowItems]
  )
  const filteredRunItems = useMemo(
    () => runItems.filter((item) => matchesCommandItem(item, normalizedQuery)),
    [normalizedQuery, runItems]
  )
  const filteredMemberItems = useMemo(
    () => memberItems.filter((item) => matchesCommandItem(item, normalizedQuery)),
    [memberItems, normalizedQuery]
  )

  const hasResults =
    filteredStaticItems.length > 0 ||
    filteredWorkflowItems.length > 0 ||
    filteredRunItems.length > 0 ||
    filteredMemberItems.length > 0

  const handleNavigate = (path: string) => {
    if (path.startsWith('/')) {
      router.push(path)
      setIsOpen(false)
      return
    }
    if (!activeOrgId) {
      router.push('/dashboard/workspaces')
      setIsOpen(false)
      return
    }
    const base = activeOrgId
      ? `/dashboard/workspaces/${encodeURIComponent(activeOrgId)}`
      : '/dashboard/workspaces'
    router.push(`${base}/${path}`)
    setIsOpen(false)
  }

  return (
    <CommandDialog
      open={isOpen}
      onOpenChange={setIsOpen}
      className="sm:max-w-2xl"
      title="Jump to"
      description="Search docs, workflows, tasks, teammates, and workspace pages."
    >
      <CommandInput
        value={query}
        onValueChange={setQuery}
        placeholder="Search docs, workflows, tasks, alerts…"
      />
      <CommandList>
        {!hasResults && <CommandEmpty>No matches yet.</CommandEmpty>}

        {filteredStaticItems.length > 0 && (
          <CommandGroup heading="Workspace">
            {filteredStaticItems.map((item) => (
              <CommandItem
                key={`${item.path}-${item.label}`}
                onSelect={() => handleNavigate(item.path)}
              >
                <span>{item.label}</span>
                <CommandShortcut>Enter</CommandShortcut>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {filteredWorkflowItems.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Workflows">
              {filteredWorkflowItems.map((item) => (
                <CommandItem
                  key={`${item.path}-${item.label}`}
                  onSelect={() => handleNavigate(item.path)}
                >
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate">{item.label}</span>
                    {item.description && (
                      <span className="text-xs text-muted-foreground">{item.description}</span>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {filteredRunItems.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Runs">
              {filteredRunItems.map((item) => (
                <CommandItem
                  key={`${item.path}-${item.label}`}
                  onSelect={() => handleNavigate(item.path)}
                >
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate">{item.label}</span>
                    {item.description && (
                      <span className="text-xs text-muted-foreground">{item.description}</span>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {filteredMemberItems.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Members">
              {filteredMemberItems.map((item) => (
                <CommandItem
                  key={`${item.path}-${item.label}`}
                  onSelect={() => handleNavigate(item.path)}
                >
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate">{item.label}</span>
                    {item.description && (
                      <span className="text-xs text-muted-foreground">{item.description}</span>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  )
}

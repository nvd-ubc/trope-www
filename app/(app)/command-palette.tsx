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

type SearchResponse = {
  docs?: Array<{
    doc_id: string
    title: string
    status?: string
  }>
  tasks?: Array<{
    task_id: string
    title: string
    status?: string
  }>
  people?: Array<{
    user_id: string
    display_name?: string | null
    email?: string | null
  }>
}

type CommandItemRecord = {
  label: string
  path: string
  description?: string
}

const parseActiveOrgId = (pathname: string) => {
  const match = pathname.match(/\/dashboard\/workspaces\/([^/]+)/)
  return match ? decodeURIComponent(match[1]) : null
}

const staticItems: CommandItemRecord[] = [
  { label: 'Home', path: 'home' },
  { label: 'Documents', path: 'docs' },
  { label: 'Tasks', path: 'tasks' },
  { label: 'Teammates', path: 'teammates' },
  { label: 'Insights', path: 'insights' },
  { label: 'Workflows', path: 'workflows' },
  { label: 'Runs', path: 'runs' },
  { label: 'Alerts', path: 'alerts' },
  { label: 'Compliance', path: 'compliance' },
  { label: 'Members (Admin)', path: 'members' },
  { label: 'Invites', path: 'invites' },
  { label: 'Audit log', path: 'audit' },
  { label: 'Settings', path: 'settings' },
]

const matchesCommandItem = (item: CommandItemRecord, normalizedQuery: string) => {
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
  const [docItems, setDocItems] = useState<CommandItemRecord[]>([])
  const [taskItems, setTaskItems] = useState<CommandItemRecord[]>([])
  const [peopleItems, setPeopleItems] = useState<CommandItemRecord[]>([])

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
    if (!activeOrgId) return

    const normalized = query.trim()
    if (!normalized) {
      setDocItems([])
      setTaskItems([])
      setPeopleItems([])
      return
    }

    let active = true
    const run = async () => {
      try {
        const response = await fetch(
          `/api/orgs/${encodeURIComponent(activeOrgId)}/search?q=${encodeURIComponent(normalized)}&limit=12`,
          { cache: 'no-store' }
        )
        if (!response.ok) {
          throw new Error('search_failed')
        }

        const payload = (await response.json().catch(() => null)) as SearchResponse | null
        if (!active) return

        setDocItems(
          (payload?.docs ?? []).map((doc) => ({
            label: `Document: ${doc.title || doc.doc_id}`,
            path: `/dashboard/workspaces/${encodeURIComponent(activeOrgId)}/workflows/${encodeURIComponent(doc.doc_id)}`,
            description: doc.status ?? 'guide',
          }))
        )

        setTaskItems(
          (payload?.tasks ?? []).map((task) => ({
            label: `Task: ${task.title || task.task_id}`,
            path: `/dashboard/workspaces/${encodeURIComponent(activeOrgId)}/tasks`,
            description: task.status ?? 'open',
          }))
        )

        setPeopleItems(
          (payload?.people ?? []).map((person) => ({
            label: `Teammate: ${person.display_name || person.email || person.user_id}`,
            path: `/dashboard/workspaces/${encodeURIComponent(activeOrgId)}/teammates`,
            description: person.email ?? person.user_id,
          }))
        )
      } catch {
        if (!active) return
        setDocItems([])
        setTaskItems([])
        setPeopleItems([])
      }
    }

    run()
    return () => {
      active = false
    }
  }, [activeOrgId, isOpen, query])

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

  const hasResults =
    filteredStaticItems.length > 0 ||
    docItems.length > 0 ||
    taskItems.length > 0 ||
    peopleItems.length > 0

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
      description="Search docs, tasks, teammates, and workspace pages."
    >
      <CommandInput
        value={query}
        onValueChange={setQuery}
        placeholder="Search docs, tasks, teammates…"
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

        {docItems.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Documents">
              {docItems.map((item) => (
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

        {taskItems.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Tasks">
              {taskItems.map((item) => (
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

        {peopleItems.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Teammates">
              {peopleItems.map((item) => (
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

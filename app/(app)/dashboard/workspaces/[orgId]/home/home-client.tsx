'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { BellRing, Plus, Users } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCsrfToken } from '@/lib/client/use-csrf-token'
import Badge from '@/components/ui/badge'
import Button from '@/components/ui/button'
import {
  DashboardHomeSkeleton,
  ErrorNotice,
  MetricCard,
  PageHeader,
  SectionCard,
} from '@/components/dashboard'

type HomeRecentsItem = {
  doc_type: string
  doc_id: string
  title: string
  source?: string | null
  updated_at: string
  views_30d?: number
  guided_completions_30d?: number
}

type HomeTaskItem = {
  assignment_id: string
  task_id: string
  title: string
  status: string
  due_at?: string | null
  doc_type?: string | null
  doc_id?: string | null
}

type HomePayload = {
  recents?: HomeRecentsItem[]
  tasks_due_soon?: HomeTaskItem[]
  stats?: {
    guides_total?: number
    guides_created_by_me?: number
    views_30d?: number
    guided_completions_30d?: number
    my_open_tasks?: number
    my_overdue_tasks?: number
    unread_notifications?: number
  }
}

type NotificationItem = {
  notification_id: string
  title: string
  body?: string
  status: 'unread' | 'read'
  task_id?: string
}

type NotificationsPayload = {
  notifications?: NotificationItem[]
}

type HomeBootstrapResponse = {
  home?: HomePayload | null
  notifications?: NotificationsPayload | null
  error?: string
}

const formatDate = (value?: string | null) => {
  if (!value) return 'No due date'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

const formatRelative = (value?: string) => {
  if (!value) return 'No activity yet'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  const diffMs = Date.now() - date.getTime()
  const day = 24 * 60 * 60 * 1000
  if (diffMs < day) return 'Today'
  if (diffMs < 2 * day) return 'Yesterday'
  const days = Math.floor(diffMs / day)
  return `${days}d ago`
}

export default function HomeClient({ orgId }: { orgId: string }) {
  const router = useRouter()
  const { token: csrfToken } = useCsrfToken()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [home, setHome] = useState<HomePayload | null>(null)
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [markingAllRead, setMarkingAllRead] = useState(false)

  const load = useCallback(async () => {
    const response = await fetch(
      `/api/orgs/${encodeURIComponent(orgId)}/home/bootstrap`,
      { cache: 'no-store' }
    )
    if (response.status === 401) {
      router.replace(`/signin?next=/dashboard/workspaces/${encodeURIComponent(orgId)}/home`)
      return
    }
    const payload = (await response.json().catch(() => null)) as HomeBootstrapResponse | null
    if (!response.ok || !payload?.home) {
      throw new Error('Unable to load workspace home.')
    }

    setHome(payload.home)
    setNotifications(payload.notifications?.notifications ?? [])
  }, [orgId, router])

  useEffect(() => {
    let active = true
    const run = async () => {
      try {
        await load()
        if (!active) return
        setLoading(false)
      } catch (err) {
        if (!active) return
        setError(err instanceof Error ? err.message : 'Unable to load workspace home.')
        setLoading(false)
      }
    }
    run()
    return () => {
      active = false
    }
  }, [load])

  const stats = home?.stats ?? {}
  const recents = home?.recents ?? []
  const tasksDueSoon = home?.tasks_due_soon ?? []

  const markAllRead = async () => {
    if (!csrfToken || markingAllRead) return
    setMarkingAllRead(true)
    try {
      const response = await fetch('/api/me/notifications/read-all', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-csrf-token': csrfToken,
        },
        body: JSON.stringify({}),
      })
      if (!response.ok) {
        throw new Error('Unable to mark notifications as read.')
      }
      setNotifications((prev) => prev.map((item) => ({ ...item, status: 'read' })))
    } catch {
      // keep optimistic state unchanged on failure
    } finally {
      setMarkingAllRead(false)
    }
  }

  const unreadCount = useMemo(
    () => notifications.filter((item) => item.status === 'unread').length,
    [notifications]
  )

  if (loading) {
    return <DashboardHomeSkeleton />
  }

  if (error || !home) {
    return <ErrorNotice title="Unable to load home" message={error ?? 'Unable to load home.'} />
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Home"
        description="Recents, tasks, and notifications for this workspace."
        backHref={`/dashboard/workspaces/${encodeURIComponent(orgId)}`}
        backLabel="Workspace overview"
        badges={
          <>
            <Badge variant="info">Scribe parity</Badge>
            <Badge variant={unreadCount > 0 ? 'warning' : 'success'}>
              {unreadCount > 0 ? `${unreadCount} unread` : 'Inbox clear'}
            </Badge>
          </>
        }
        actions={
          <>
            <Button asChild variant="outline" size="sm">
              <Link href={`/dashboard/workspaces/${encodeURIComponent(orgId)}/tasks`}>
                <Plus className="size-4" />
                New task
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href={`/dashboard/workspaces/${encodeURIComponent(orgId)}/invites`}>
                <Users className="size-4" />
                Invite
              </Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Guides" value={stats.guides_total ?? 0} helper="Published + draft" />
        <MetricCard label="Views (30d)" value={stats.views_30d ?? 0} helper="Guide views" />
        <MetricCard
          label="Completions (30d)"
          value={stats.guided_completions_30d ?? 0}
          helper="Guided completions"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard
          title="Recents"
          description="Recently updated guides."
          action={<Badge variant="neutral">{recents.length}</Badge>}
        >
          {recents.length === 0 && (
            <div className="rounded-lg border border-dashed border-border bg-muted/40 p-4 text-sm text-muted-foreground">
              No guides yet.
            </div>
          )}
          <div className="space-y-2">
            {recents.map((item) => (
              <Link
                key={item.doc_id}
                href={`/dashboard/workspaces/${encodeURIComponent(orgId)}/workflows/${encodeURIComponent(item.doc_id)}`}
                className="flex items-center justify-between rounded-lg border border-border bg-card px-3 py-3 text-sm transition-colors hover:bg-muted/40"
              >
                <div className="min-w-0">
                  <div className="truncate font-medium text-foreground">{item.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {item.source ?? 'Workflow'} · {formatRelative(item.updated_at)}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  {item.views_30d ?? 0} views
                </div>
              </Link>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          title="Tasks"
          description="Assignments due soon."
          action={<Badge variant={Number(stats.my_overdue_tasks ?? 0) > 0 ? 'warning' : 'neutral'}>{stats.my_open_tasks ?? 0} open</Badge>}
        >
          {tasksDueSoon.length === 0 && (
            <div className="rounded-lg border border-dashed border-border bg-muted/40 p-4 text-sm text-muted-foreground">
              No active assignments.
            </div>
          )}
          <div className="space-y-2">
            {tasksDueSoon.map((task) => (
              <div
                key={task.assignment_id}
                className="flex items-center justify-between rounded-lg border border-border bg-card px-3 py-3 text-sm"
              >
                <div className="min-w-0">
                  <div className="truncate font-medium text-foreground">{task.title}</div>
                  <div className="text-xs text-muted-foreground">Due {formatDate(task.due_at)}</div>
                </div>
                <Badge variant={task.status === 'overdue' ? 'danger' : task.status === 'completed' ? 'success' : 'neutral'}>
                  {task.status.replace('_', ' ')}
                </Badge>
              </div>
            ))}
          </div>
          <div>
            <Button asChild variant="ghost" size="sm">
              <Link href={`/dashboard/workspaces/${encodeURIComponent(orgId)}/tasks`}>Open tasks</Link>
            </Button>
          </div>
        </SectionCard>
      </div>

      <SectionCard
        title="Notifications"
        description="Assignments, reminders, and workspace activity."
        action={
          <Button size="sm" variant="outline" onClick={markAllRead} disabled={!csrfToken || markingAllRead || unreadCount === 0}>
            <BellRing className="size-4" />
            Mark all read
          </Button>
        }
      >
        {notifications.length === 0 && (
          <div className="rounded-lg border border-dashed border-border bg-muted/40 p-4 text-sm text-muted-foreground">
            No notifications.
          </div>
        )}
        <div className="space-y-2">
          {notifications.map((item) => (
            <div
              key={item.notification_id}
              className="flex items-center justify-between rounded-lg border border-border bg-card px-3 py-3"
            >
              <div className="min-w-0">
                <div className="truncate text-sm font-medium text-foreground">{item.title}</div>
                <div className="truncate text-xs text-muted-foreground">{item.body ?? 'Workspace update'}</div>
              </div>
              <Badge variant={item.status === 'unread' ? 'warning' : 'neutral'}>{item.status}</Badge>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  )
}

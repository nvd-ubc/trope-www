'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { BellRing } from 'lucide-react'
import { useCsrfToken } from '@/lib/client/use-csrf-token'
import Badge from '@/components/ui/badge'
import Button from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

type NotificationRecord = {
  notification_id: string
  title: string
  body?: string
  status: 'unread' | 'read'
  task_id?: string
  org_id?: string
  created_at?: string
}

type NotificationsResponse = {
  notifications?: NotificationRecord[]
}

const formatDate = (value?: string) => {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export default function AppNotificationBell() {
  const { token: csrfToken } = useCsrfToken()
  const [notifications, setNotifications] = useState<NotificationRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [markingAllRead, setMarkingAllRead] = useState(false)

  const load = async () => {
    const response = await fetch('/api/me/notifications?limit=12', { cache: 'no-store' })
    if (!response.ok) {
      return
    }
    const payload = (await response.json().catch(() => null)) as NotificationsResponse | null
    setNotifications(payload?.notifications ?? [])
  }

  useEffect(() => {
    let active = true

    const run = async () => {
      try {
        await load()
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    run()
    return () => {
      active = false
    }
  }, [])

  const unreadCount = useMemo(
    () => notifications.filter((notification) => notification.status === 'unread').length,
    [notifications]
  )

  const markAllRead = async () => {
    if (!csrfToken || markingAllRead || unreadCount === 0) return
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
      if (!response.ok) return
      setNotifications((prev) => prev.map((item) => ({ ...item, status: 'read' })))
    } finally {
      setMarkingAllRead(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-2 px-2">
          <BellRing className="size-4" />
          {loading ? (
            <span className="text-xs text-muted-foreground">…</span>
          ) : unreadCount > 0 ? (
            <Badge variant="warning">{unreadCount}</Badge>
          ) : (
            <span className="text-xs text-muted-foreground">0</span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[24rem] max-w-[90vw]">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 px-2 text-xs"
            disabled={!csrfToken || markingAllRead || unreadCount === 0}
            onClick={markAllRead}
          >
            Mark all read
          </Button>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.length === 0 && (
          <DropdownMenuItem disabled>
            <span className="text-xs text-muted-foreground">No notifications</span>
          </DropdownMenuItem>
        )}
        {notifications.map((notification) => (
          <DropdownMenuItem key={notification.notification_id} className="items-start">
            <div className="min-w-0 space-y-1">
              <div className="flex items-center gap-2">
                <span className="truncate text-sm font-medium">{notification.title}</span>
                <Badge variant={notification.status === 'unread' ? 'warning' : 'neutral'}>
                  {notification.status}
                </Badge>
              </div>
              {notification.body && (
                <div className="truncate text-xs text-muted-foreground">{notification.body}</div>
              )}
              <div className="text-[11px] text-muted-foreground">
                {formatDate(notification.created_at)}
                {notification.org_id && notification.task_id && (
                  <>
                    {' · '}
                    <Link
                      href={`/dashboard/workspaces/${encodeURIComponent(notification.org_id)}/tasks`}
                      className="underline-offset-2 hover:underline"
                    >
                      Open tasks
                    </Link>
                  </>
                )}
              </div>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

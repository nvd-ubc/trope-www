'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { BadgeCheck, BriefcaseBusiness, ChevronsUpDown, LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCsrfToken } from '@/lib/client/use-csrf-token'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import Button from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

type MeResponse = {
  sub: string
  email?: string | null
  first_name?: string | null
  last_name?: string | null
  display_name?: string | null
}

const getInitials = (value: string) => {
  const parts = value
    .split(/\s+/)
    .map((part) => part.trim())
    .filter(Boolean)

  if (parts.length === 0) return 'U'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
}

export default function AppUserMenu() {
  const router = useRouter()
  const { token: csrfToken, loading: csrfLoading } = useCsrfToken()
  const signoutFormRef = useRef<HTMLFormElement | null>(null)
  const [me, setMe] = useState<MeResponse | null>(null)

  useEffect(() => {
    let active = true

    const load = async () => {
      try {
        const response = await fetch('/api/me', { cache: 'no-store' })
        if (response.status === 401) {
          router.replace('/signin?next=/dashboard')
          return
        }
        if (!response.ok) return
        const payload = (await response.json().catch(() => null)) as MeResponse | null
        if (!active || !payload?.sub) return
        setMe(payload)
      } catch {
        if (!active) return
      }
    }

    void load()
    return () => {
      active = false
    }
  }, [router])

  const displayName = useMemo(() => {
    const fromProfile =
      me?.display_name?.trim() ||
      `${me?.first_name ?? ''} ${me?.last_name ?? ''}`.trim()

    if (fromProfile) return fromProfile
    if (me?.email) return me.email
    return me?.sub ?? 'User'
  }, [me])

  const secondary = me?.email ?? me?.sub ?? 'Unknown user'
  const initials = getInitials(displayName)

  return (
    <>
      <form ref={signoutFormRef} action="/api/auth/signout" method="post" className="hidden">
        <input type="hidden" name="csrf_token" value={csrfToken} />
      </form>
      <TooltipProvider>
        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-2 pl-2 pr-2">
                  <Avatar size="sm">
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                  <span className="hidden max-w-[11rem] truncate text-xs sm:block">{displayName}</span>
                  <ChevronsUpDown className="size-3.5 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent side="bottom">Account menu</TooltipContent>
          </Tooltip>
          <DropdownMenuContent align="end" className="min-w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex items-center gap-2">
                <Avatar size="sm">
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <div className="grid min-w-0 flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{displayName}</span>
                  <span className="truncate text-xs text-muted-foreground">{secondary}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard/account">
                <BadgeCheck />
                Account
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/workspaces">
                <BriefcaseBusiness />
                Workspaces
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              disabled={csrfLoading || !csrfToken}
              onSelect={(event) => {
                event.preventDefault()
                signoutFormRef.current?.requestSubmit()
              }}
            >
              <LogOut />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TooltipProvider>
    </>
  )
}

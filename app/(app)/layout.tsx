import { Suspense } from 'react'
import Button from '@/components/ui/button'
import Logo from '@/components/ui/logo'
import { Separator } from '@/components/ui/separator'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import AppBreadcrumb from './app-breadcrumb'
import AppSidebar from './app-sidebar'
import WorkspaceSwitcher from './workspace-switcher'
import CommandPalette from './command-palette'
import ProfileCompletionGate from './profile-completion-gate'
import AppUserMenu from './app-user-menu'
import AppNotificationBell from './app-notification-bell'

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 via-slate-50 to-slate-100 text-foreground">
      <CommandPalette />
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="bg-transparent">
          <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur">
            <div className="flex items-center justify-between px-4 py-3 sm:px-6 lg:px-10">
              <div className="flex min-w-0 items-center gap-2">
                <SidebarTrigger className="md:hidden" />
                <div className="md:hidden">
                  <Logo href="/dashboard" />
                </div>
                <Separator orientation="vertical" className="hidden h-4 md:block" />
                <div className="hidden min-w-0 md:block">
                  <Suspense fallback={<div className="h-5 w-40 rounded bg-muted/60" aria-hidden="true" />}>
                    <AppBreadcrumb />
                  </Suspense>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" className="hidden h-8 px-2 text-xs text-muted-foreground sm:flex">
                  Press <span className="rounded bg-muted px-1 py-0.5 text-[10px] font-medium text-foreground">⌘K</span>{' '}
                  to search
                </Button>
                <AppNotificationBell />
                <WorkspaceSwitcher />
                <AppUserMenu />
              </div>
            </div>
          </header>
          <main className="flex-1 px-4 py-8 sm:px-6 lg:px-10">
            <div className="mx-auto w-full max-w-[1200px]">
              <Suspense fallback={children}>
                <ProfileCompletionGate>{children}</ProfileCompletionGate>
              </Suspense>
            </div>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}

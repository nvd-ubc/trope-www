import Link from 'next/link'
import { Suspense } from 'react'
import Logo from '@/components/ui/logo'
import SignOutForm from './signout-form'
import WorkspaceSwitcher from './workspace-switcher'
import WorkspaceNavLink from './workspace-nav-link'
import CommandPalette from './command-palette'
import ProfileCompletionGate from './profile-completion-gate'

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[color:var(--trope-surface)] text-slate-900">
      <CommandPalette />
      <div className="flex min-h-screen">
        <aside className="hidden w-64 flex-col border-r border-slate-200/80 bg-white lg:flex">
          <div className="flex items-center justify-between px-6 py-6">
            <Logo />
          </div>
          <nav className="flex-1 space-y-1 px-4 text-sm text-slate-600">
            <Link
              className="flex items-center justify-between rounded-xl px-3 py-2 font-medium text-slate-700 hover:bg-slate-100"
              href="/dashboard"
            >
              Dashboard
            </Link>
            <WorkspaceNavLink className="flex items-center justify-between rounded-xl px-3 py-2 font-medium text-slate-700 hover:bg-slate-100" path="workflows">
              Workflows
            </WorkspaceNavLink>
            <WorkspaceNavLink className="flex items-center justify-between rounded-xl px-3 py-2 font-medium text-slate-700 hover:bg-slate-100" path="runs">
              Runs
            </WorkspaceNavLink>
            <WorkspaceNavLink className="flex items-center justify-between rounded-xl px-3 py-2 font-medium text-slate-700 hover:bg-slate-100" path="alerts">
              Alerts
            </WorkspaceNavLink>
            <WorkspaceNavLink className="flex items-center justify-between rounded-xl px-3 py-2 font-medium text-slate-700 hover:bg-slate-100" path="compliance">
              Compliance
            </WorkspaceNavLink>
            <WorkspaceNavLink className="flex items-center justify-between rounded-xl px-3 py-2 font-medium text-slate-700 hover:bg-slate-100" path="members">
              Members
            </WorkspaceNavLink>
            <WorkspaceNavLink className="flex items-center justify-between rounded-xl px-3 py-2 font-medium text-slate-700 hover:bg-slate-100" path="settings">
              Settings
            </WorkspaceNavLink>
            <Link
              className="flex items-center justify-between rounded-xl px-3 py-2 font-medium text-slate-700 hover:bg-slate-100"
              href="/dashboard/account"
            >
              Account
            </Link>
          </nav>
          <div className="px-6 py-6 text-xs text-slate-400">
            Tip: Press <span className="font-semibold text-slate-600">⌘K</span> to jump around.
          </div>
        </aside>
        <div className="flex min-h-screen flex-1 flex-col">
          <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/80 backdrop-blur">
            <div className="flex items-center justify-between px-4 py-4 sm:px-6 lg:px-10">
              <div className="flex items-center gap-3">
                <div className="lg:hidden">
                  <Logo />
                </div>
                <div className="hidden rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-500 sm:flex">
                  Press ⌘K to search
                </div>
              </div>
              <div className="flex items-center gap-3">
                <WorkspaceSwitcher />
                <SignOutForm />
              </div>
            </div>
          </header>
          <main className="flex-1 px-4 py-8 sm:px-6 lg:px-10">
            <Suspense
              fallback={
                <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
                  Loading dashboard…
                </div>
              }
            >
              <ProfileCompletionGate>{children}</ProfileCompletionGate>
            </Suspense>
          </main>
        </div>
      </div>
    </div>
  )
}

import Link from 'next/link'
import {
  BellRing,
  Gauge,
  ListChecks,
  ShieldCheck,
  UserCog,
  Users,
  Workflow,
} from 'lucide-react'
import Logo from '@/components/ui/logo'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import WorkspaceNavLink from './workspace-nav-link'

export default function AppSidebar() {
  return (
    <Sidebar variant="inset" collapsible="offcanvas" className="border-r border-sidebar-border/60">
      <SidebarHeader className="border-b border-sidebar-border/70 px-4 py-4">
        <Logo />
      </SidebarHeader>

      <SidebarContent className="px-2 py-3">
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] tracking-[0.14em] uppercase">Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Dashboard">
                  <Link href="/dashboard">
                    <Gauge />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Workflows">
                  <WorkspaceNavLink path="workflows">
                    <Workflow />
                    <span>Workflows</span>
                  </WorkspaceNavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Runs">
                  <WorkspaceNavLink path="runs">
                    <ListChecks />
                    <span>Runs</span>
                  </WorkspaceNavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Alerts">
                  <WorkspaceNavLink path="alerts">
                    <BellRing />
                    <span>Alerts</span>
                  </WorkspaceNavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Compliance">
                  <WorkspaceNavLink path="compliance">
                    <ShieldCheck />
                    <span>Compliance</span>
                  </WorkspaceNavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Members">
                  <WorkspaceNavLink path="members">
                    <Users />
                    <span>Members</span>
                  </WorkspaceNavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Settings">
                  <WorkspaceNavLink path="settings">
                    <UserCog />
                    <span>Settings</span>
                  </WorkspaceNavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Account">
                  <Link href="/dashboard/account">
                    <UserCog />
                    <span>Account</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="mx-2 mb-2 rounded-lg border border-sidebar-border/60 bg-sidebar-accent/40 px-3 py-3 text-xs text-sidebar-foreground/70">
        Press <span className="font-semibold text-sidebar-foreground">⌘K</span> to open command search.
      </SidebarFooter>
    </Sidebar>
  )
}

'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

const labelForSegment = (segment: string) => {
  const normalized = decodeURIComponent(segment)
  const map: Record<string, string> = {
    dashboard: 'Dashboard',
    workspaces: 'Workspaces',
    workflows: 'Workflows',
    runs: 'Runs',
    alerts: 'Alerts',
    compliance: 'Compliance',
    members: 'Members',
    invites: 'Invites',
    audit: 'Audit',
    settings: 'Settings',
    account: 'Account',
    guide: 'Guide',
  }

  if (map[normalized]) return map[normalized]
  if (/^org_[a-z0-9-]{6,}$/i.test(normalized)) return 'Workspace'
  if (/^wf_[a-z0-9-]{6,}$/i.test(normalized)) return 'Workflow'
  if (/^v_[a-z0-9-]{6,}$/i.test(normalized)) return 'Version'
  if (/^[a-z0-9-]{16,}$/i.test(normalized)) return 'Detail'
  return normalized
}

export default function AppBreadcrumb() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const segments = pathname.split('/').filter(Boolean)

  if (segments.length === 0) return null

  const isGuideRoute =
    segments[0] === 'dashboard' && segments[1] === 'workflows' && segments[3] === 'guide'
  const workflowId = isGuideRoute ? segments[2] : null
  const orgId = (searchParams.get('orgId') ?? '').trim()

  const crumbs = segments.map((segment, index) => {
    let path = `/${segments.slice(0, index + 1).join('/')}`

    if (isGuideRoute && index === 1) {
      path = orgId
        ? `/dashboard/workspaces/${encodeURIComponent(orgId)}/workflows`
        : '/dashboard/workspaces'
    }

    if (isGuideRoute && index === 2) {
      if (orgId && workflowId) {
        path = `/dashboard/workspaces/${encodeURIComponent(orgId)}/workflows/${encodeURIComponent(workflowId)}`
      } else if (orgId) {
        path = `/dashboard/workspaces/${encodeURIComponent(orgId)}/workflows`
      } else {
        path = '/dashboard/workspaces'
      }
    }

    return {
      path,
      label: labelForSegment(segment),
      isLast: index === segments.length - 1,
    }
  })

  return (
    <Breadcrumb className="max-w-full overflow-x-auto">
      <BreadcrumbList className="flex-nowrap whitespace-nowrap">
        {crumbs.map((crumb, index) => (
          <div key={crumb.path} className="flex items-center gap-1.5">
            <BreadcrumbItem>
              {crumb.isLast ? (
                <BreadcrumbPage className="max-w-[18rem] truncate" title={crumb.label}>
                  {crumb.label}
                </BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link href={crumb.path} className="max-w-[14rem] truncate" title={crumb.label}>
                    {crumb.label}
                  </Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
            {index < crumbs.length - 1 && <BreadcrumbSeparator />}
          </div>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}

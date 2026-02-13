'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
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
  if (/^[0-9a-f-]{8,}$/i.test(normalized)) return 'Detail'
  return normalized
}

export default function AppBreadcrumb() {
  const pathname = usePathname()
  const segments = pathname.split('/').filter(Boolean)

  if (segments.length === 0) return null

  const crumbs = segments.map((segment, index) => {
    const path = `/${segments.slice(0, index + 1).join('/')}`
    return {
      path,
      label: labelForSegment(segment),
      isLast: index === segments.length - 1,
    }
  })

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {crumbs.map((crumb, index) => (
          <div key={crumb.path} className="flex items-center gap-1.5">
            <BreadcrumbItem>
              {crumb.isLast ? (
                <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link href={crumb.path}>{crumb.label}</Link>
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

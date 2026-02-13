import DashboardClient from './dashboard-client'
import Badge from '@/components/ui/badge'
import PageHeader from '@/components/dashboard/page-header'

export const metadata = {
  title: 'Dashboard',
  description: 'Your Trope Cloud account and usage overview.',
}

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Account health, usage, and onboarding status."
        badges={
          <>
            <Badge variant="neutral">Operations</Badge>
            <Badge variant="info">Live data</Badge>
          </>
        }
      />

      <DashboardClient />
    </div>
  )
}

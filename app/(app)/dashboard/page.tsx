import DashboardClient from './dashboard-client'

export const metadata = {
  title: 'Dashboard',
  description: 'Your Trope Cloud account and usage overview.',
}

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-600">Account details and monthly usage.</p>
        </div>
        <form action="/api/auth/signout" method="post">
          <button className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:text-slate-900">
            Sign out
          </button>
        </form>
      </div>

      <DashboardClient />
    </div>
  )
}

import WorkspacesClient from './workspaces-client'

export const metadata = {
  title: 'Workspaces',
  description: 'Manage your Trope workspaces and default desktop org.',
}

export default function WorkspacesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Workspaces</h1>
        <p className="mt-2 text-sm text-slate-600">
          Create new workspaces, switch defaults, and invite teammates.
        </p>
      </div>

      <WorkspacesClient />
    </div>
  )
}

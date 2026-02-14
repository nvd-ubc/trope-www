import WorkspacesClient from './workspaces-client'

export const metadata = {
  title: 'Workspaces',
  description: 'Manage your Trope workspaces and default desktop org.',
}

export default function WorkspacesPage() {
  return <WorkspacesClient />
}

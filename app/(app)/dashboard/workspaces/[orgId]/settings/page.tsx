import SettingsClient from './settings-client'

export const dynamic = 'force-dynamic'

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ orgId: string }>
}) {
  const { orgId } = await params
  return <SettingsClient orgId={orgId} />
}

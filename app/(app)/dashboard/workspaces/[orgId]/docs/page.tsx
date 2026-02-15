import DocsClient from './docs-client'

export const dynamic = 'force-dynamic'

export default async function WorkspaceDocsPage({
  params,
}: {
  params: Promise<{ orgId: string }>
}) {
  const { orgId } = await params
  return <DocsClient orgId={orgId} />
}

import ShareClient from './share-client'

export const dynamic = 'force-dynamic'

export default async function SharePage({ params }: { params: Promise<{ shareId: string }> }) {
  const { shareId } = await params
  return <ShareClient shareId={shareId} />
}

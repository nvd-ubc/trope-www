import ShareClient from './share-client'

export const dynamic = 'force-dynamic'

export default function SharePage({ params }: { params: { shareId: string } }) {
  return <ShareClient shareId={params.shareId} />
}

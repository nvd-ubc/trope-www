import type { Metadata } from 'next'
import ShareClient from './share-client'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
  referrer: 'no-referrer',
}

export default async function SharePage({ params }: { params: Promise<{ shareId: string }> }) {
  const { shareId } = await params
  return <ShareClient shareId={shareId} />
}

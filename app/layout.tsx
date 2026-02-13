import './css/style.css'

import localFont from 'next/font/local'
import { Analytics } from '@vercel/analytics/next'

const circularStd = localFont({
  src: [
    {
      path: './fonts/CircularStd-Book.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: './fonts/CircularStd-Medium.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: './fonts/CircularStd-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-circular',
  display: 'swap',
})

export const metadata = {
  metadataBase: new URL('https://trope.ai'),
  title: {
    default: 'Trope - Record once. Guide forever.',
    template: '%s | Trope'
  },
  description:
    'Trope captures desktop workflows and delivers guided runs so teams can onboard faster, reduce errors, and scale operations.',
  keywords: [
    'workflow guidance',
    'desktop workflows',
    'process documentation',
    'SOP software',
    'operations enablement',
    'workflow recording',
    'employee training',
    'knowledge management',
  ],
  authors: [{ name: 'Trope' }],
  creator: 'Trope',
  publisher: 'Trope',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://trope.ai',
    siteName: 'Trope',
    title: 'Trope - Record once. Guide forever.',
    description: 'Capture workflows once and deliver guided runs across desktop and web tools.',
    images: [{
      url: '/images/og-image.jpg',
      width: 1200,
      height: 630,
      alt: 'Trope - Desktop workflow guidance'
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Trope - Record once. Guide forever.',
    description: 'Capture workflows once and deliver guided runs across desktop and web tools.',
    images: ['/images/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: '', // Add Google Search Console verification code here
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${circularStd.variable} bg-background font-sans text-foreground antialiased`} style={{ letterSpacing: '-0.03em' }}>
        <div className="flex flex-col min-h-screen overflow-hidden supports-[overflow:clip]:overflow-clip">
          {children}
        </div>
        <Analytics />
      </body>
    </html>
  )
}

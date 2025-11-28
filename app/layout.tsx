import './css/style.css'

import { DM_Sans, Instrument_Serif } from 'next/font/google'

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap'
})

const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-instrument-serif',
  display: 'swap'
})

export const metadata = {
  metadataBase: new URL('https://trope.ai'),
  title: {
    default: 'Trope - Record Once. Guide & Automate Forever.',
    template: '%s | Trope'
  },
  description: 'Trope records any workflow once—then delivers living, just-in-time guides and safe one-click automations for browser and desktop. Transform tribal knowledge into scalable processes.',
  keywords: ['workflow automation', 'process documentation', 'SOP automation', 'knowledge management', 'workflow recording', 'employee training automation', 'living documentation', 'drift detection'],
  authors: [{ name: 'Trope' }],
  creator: 'Trope',
  publisher: 'Trope',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://trope.ai',
    siteName: 'Trope',
    title: 'Trope - Record Once. Guide & Automate Forever.',
    description: 'Transform tribal knowledge into living guides and safe automation. Record workflows once, guide your team forever.',
    images: [{
      url: '/images/og-image.jpg',
      width: 1200,
      height: 630,
      alt: 'Trope - Workflow Automation Platform'
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Trope - Record Once. Guide & Automate Forever.',
    description: 'Transform tribal knowledge into living guides and safe automation.',
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
      <body className={`${dmSans.variable} ${instrumentSerif.variable} font-sans antialiased bg-white text-gray-900 tracking-tight`}>
        <div className="flex flex-col min-h-screen overflow-hidden supports-[overflow:clip]:overflow-clip">
          {children}
        </div>
      </body>
    </html>
  )
}

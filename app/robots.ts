import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://trope.ai'

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/_next/',
          '/admin/',
          '/private/',
          '/dashboard',
          '/signin',
          '/signup',
          '/invite',
          '/reset-password',
          '/share/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}

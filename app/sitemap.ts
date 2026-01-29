import { MetadataRoute } from 'next'
import { RESOURCES, USE_CASES } from '@/lib/marketing-content'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://trope.ai'
  const currentDate = new Date()

  const staticRoutes = [
    { path: '/', priority: 1.0, changeFrequency: 'weekly' as const },
    { path: '/about', priority: 0.6, changeFrequency: 'monthly' as const },
    { path: '/pricing', priority: 0.7, changeFrequency: 'monthly' as const },
    { path: '/use-cases', priority: 0.7, changeFrequency: 'monthly' as const },
    { path: '/resources', priority: 0.6, changeFrequency: 'monthly' as const },
    { path: '/download', priority: 0.5, changeFrequency: 'monthly' as const },
    { path: '/get-started', priority: 0.6, changeFrequency: 'monthly' as const },
    { path: '/request-access', priority: 0.6, changeFrequency: 'monthly' as const },
    { path: '/roi', priority: 0.5, changeFrequency: 'monthly' as const },
    { path: '/security', priority: 0.5, changeFrequency: 'monthly' as const },
    { path: '/support', priority: 0.4, changeFrequency: 'monthly' as const },
    { path: '/status', priority: 0.3, changeFrequency: 'weekly' as const },
    { path: '/docs', priority: 0.4, changeFrequency: 'monthly' as const },
    { path: '/release-notes', priority: 0.4, changeFrequency: 'monthly' as const },
    { path: '/privacy', priority: 0.3, changeFrequency: 'monthly' as const },
    { path: '/subprocessors', priority: 0.3, changeFrequency: 'monthly' as const },
  ]

  const routes: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${baseUrl}${route.path}`,
    lastModified: currentDate,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }))

  const useCaseRoutes = USE_CASES.map((useCase) => ({
    url: `${baseUrl}/use-cases/${useCase.slug}`,
    lastModified: currentDate,
    changeFrequency: 'monthly' as const,
    priority: 0.5,
  }))

  const resourceRoutes = RESOURCES.map((resource) => ({
    url: `${baseUrl}/resources/${resource.slug}`,
    lastModified: currentDate,
    changeFrequency: 'monthly' as const,
    priority: 0.4,
  }))

  return [...routes, ...useCaseRoutes, ...resourceRoutes]
}

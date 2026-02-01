import { readdir, readFile } from 'node:fs/promises'
import { readdirSync } from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

type RouteMatchers = {
  staticRoutes: Set<string>
  dynamicMatchers: RegExp[]
}

const PROJECT_ROOT = process.cwd()
const SOURCE_DIRS = ['app', 'src']
const ROUTE_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx', '.mdx'])
const HREF_REGEX =
  /href\s*=\s*(?:\{\s*)?(?:"([^"]+)"|'([^']+)'|`([^`]+)`)(?:\s*\})?/g

const IGNORED_PREFIXES = ['http://', 'https://', 'mailto:', 'tel:', 'sms:', 'javascript:']

const IGNORED_INTERNAL_PREFIXES = ['/api']

async function collectFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true })
  const files: string[] = []

  for (const entry of entries) {
    if (entry.name === 'node_modules' || entry.name === '.next' || entry.name === '.git') {
      continue
    }
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...(await collectFiles(fullPath)))
    } else if (ROUTE_EXTENSIONS.has(path.extname(entry.name))) {
      files.push(fullPath)
    }
  }

  return files
}

function normalizeRoute(route: string) {
  if (!route.startsWith('/')) {
    return route
  }
  const clean = route.split('#')[0]?.split('?')[0] ?? route
  if (!clean) {
    return '/'
  }
  if (clean.length > 1 && clean.endsWith('/')) {
    return clean.slice(0, -1)
  }
  return clean
}

export function routeFromPageFile(filePath: string) {
  const relativePath = filePath.split(`${path.sep}app${path.sep}`)[1]
  if (!relativePath) {
    return '/'
  }

  const withoutPage = relativePath.replace(/page\.[^.]+$/, '')
  const segments = withoutPage
    .split(path.sep)
    .filter(Boolean)
    .filter((segment) => !(segment.startsWith('(') && segment.endsWith(')')))

  if (segments.length === 0) {
    return '/'
  }

  return `/${segments.join('/')}`
}

export function buildRouteMatchers(): RouteMatchers {
  const staticRoutes = new Set<string>()
  const dynamicMatchers: RegExp[] = []
  const appRoot = path.join(PROJECT_ROOT, 'app')
  const stack = [appRoot]

  while (stack.length > 0) {
    const current = stack.pop()
    if (!current) continue
    const entries = readdirSync(current, { withFileTypes: true })
    for (const entry of entries) {
      if (entry.name === 'node_modules' || entry.name === '.next' || entry.name === '.git') {
        continue
      }
      const fullPath = path.join(current, entry.name)
      if (entry.isDirectory()) {
        stack.push(fullPath)
      } else if (entry.name.startsWith('page.')) {
        const route = routeFromPageFile(fullPath)
        const normalized = normalizeRoute(route)
        if (normalized.includes('[')) {
          const pattern = normalized
            .split('/')
            .map((segment) => {
              if (!segment) return ''
              if (segment.startsWith('[[...') && segment.endsWith(']]')) {
                return '(?:/.+)?'
              }
              if (segment.startsWith('[...') && segment.endsWith(']')) {
                return '/.+'
              }
              if (segment.startsWith('[') && segment.endsWith(']')) {
                return '/[^/]+'
              }
              return `/${segment}`
            })
            .join('')
          dynamicMatchers.push(new RegExp(`^${pattern}$`))
        } else {
          staticRoutes.add(normalized)
        }
      }
    }
  }

  return { staticRoutes, dynamicMatchers }
}

function isIgnoredLink(href: string) {
  if (!href) return true
  if (href.startsWith('#')) return true
  return IGNORED_PREFIXES.some((prefix) => href.startsWith(prefix))
}

function isIgnoredInternal(href: string) {
  return IGNORED_INTERNAL_PREFIXES.some((prefix) => href.startsWith(prefix))
}

export async function auditLinks() {
  const files = (
    await Promise.all(
      SOURCE_DIRS.map((dir) => collectFiles(path.join(PROJECT_ROOT, dir)))
    )
  ).flat()

  const { staticRoutes, dynamicMatchers } = buildRouteMatchers()
  const errors: string[] = []

  for (const file of files) {
    const contents = await readFile(file, 'utf8')
    HREF_REGEX.lastIndex = 0
    let match: RegExpExecArray | null
    while ((match = HREF_REGEX.exec(contents)) !== null) {
      const href = match[1] ?? match[2] ?? match[3]
      if (!href || isIgnoredLink(href)) continue
      if (!href.startsWith('/')) continue
      if (isIgnoredInternal(href)) continue

      const normalized = normalizeRoute(href)
      const matchesStatic = staticRoutes.has(normalized)
      const matchesDynamic = dynamicMatchers.some((pattern) => pattern.test(normalized))

      if (!matchesStatic && !matchesDynamic) {
        errors.push(`${path.relative(PROJECT_ROOT, file)}: ${href}`)
      }
    }
  }

  return errors
}

async function run() {
  const errors = await auditLinks()
  if (errors.length === 0) {
    console.log('Link audit passed: no dead internal links found.')
    return
  }

  console.error('Link audit failed. Unresolved internal links:')
  errors.forEach((error) => console.error(`- ${error}`))
  process.exitCode = 1
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  run()
}

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const authCookieNames = ['trope_access_token', 'trope_refresh_token']
const canonicalHostMap = new Map<string, string>([
  ['www.trope.ai', 'trope.ai'],
  ['www.dev.trope.ai', 'dev.trope.ai'],
  ['www.staging.trope.ai', 'staging.trope.ai'],
])

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const forwardedHost = request.headers.get('x-forwarded-host')
  const host = forwardedHost ?? request.nextUrl.host

  const canonicalHost = canonicalHostMap.get(host)
  if (canonicalHost) {
    const url = request.nextUrl.clone()
    url.host = canonicalHost
    return NextResponse.redirect(url, 308)
  }

  if (pathname.startsWith('/dashboard')) {
    const hasAuthCookie = authCookieNames.some((name) => request.cookies.get(name)?.value)
    if (!hasAuthCookie) {
      const url = request.nextUrl.clone()
      url.pathname = '/signin'
      url.searchParams.set('next', pathname)
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|public).*)',
  ],
}

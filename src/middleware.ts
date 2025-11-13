import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// List of routes that should be inaccessible
const blockedRoutes = [
  '/about',
  '/integrations',
  '/customers',
  '/changelog',
  '/signup',
  '/reset-password',
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if the current path matches any blocked route
  if (blockedRoutes.some(route => pathname.startsWith(route))) {
    // Redirect to homepage
    return NextResponse.redirect(new URL('/', request.url))
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

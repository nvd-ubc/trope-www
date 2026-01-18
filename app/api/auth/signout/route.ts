import { NextResponse } from 'next/server'
import { clearAuthCookies, safeRedirectPath } from '@/lib/server/auth'
import { clearCsrfCookie, csrfFormField, validateCsrf } from '@/lib/server/csrf'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  const formData = await request.formData().catch(() => null)
  const csrfToken =
    formData && typeof formData.get(csrfFormField) === 'string'
      ? String(formData.get(csrfFormField))
      : undefined
  const nextPath =
    formData && typeof formData.get('next') === 'string' ? String(formData.get('next')).trim() : ''
  const csrfFailure = await validateCsrf(request, csrfToken)
  if (csrfFailure) {
    const url = new URL('/signin', request.url)
    url.searchParams.set('error', 'Session expired. Please try again.')
    return NextResponse.redirect(url, 303)
  }

  const url = new URL('/signin', request.url)
  url.searchParams.set('signed_out', '1')
  if (nextPath) {
    url.searchParams.set('next', safeRedirectPath(nextPath))
  }
  const response = NextResponse.redirect(url, 303)
  clearAuthCookies(response)
  clearCsrfCookie(response)
  return response
}

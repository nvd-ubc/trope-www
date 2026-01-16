import { NextResponse } from 'next/server'
import { authErrorMessage, getAuthConfig, signUp } from '@/lib/server/auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const formValue = (formData: FormData, key: string): string => {
  const value = formData.get(key)
  return typeof value === 'string' ? value.trim() : ''
}

const buildErrorRedirect = (request: Request, message: string) => {
  const url = new URL('/signup', request.url)
  url.searchParams.set('error', message)
  return url
}

export async function POST(request: Request) {
  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.redirect(buildErrorRedirect(request, 'Invalid sign-up request.'))
  }

  const email = formValue(formData, 'email')
  const password = formValue(formData, 'password')
  const name = formValue(formData, 'full_name')
  const company = formValue(formData, 'company')

  if (!email) {
    return NextResponse.redirect(buildErrorRedirect(request, 'Email is required.'))
  }

  try {
    const config = getAuthConfig()

    if (!config.selfSignupEnabled) {
      const response = await fetch(`${config.apiBaseUrl}/v1/access-requests`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          email,
          name: name || undefined,
          company: company || undefined,
        }),
      })

      if (!response.ok) {
        throw new Error('access_request_failed')
      }

      const url = new URL('/signup', request.url)
      url.searchParams.set('requested', '1')
      return NextResponse.redirect(url)
    }

    if (!password) {
      return NextResponse.redirect(buildErrorRedirect(request, 'Password is required.'))
    }

    await signUp({
      email,
      password,
      name: name || undefined,
      company: company || undefined,
    })

    const url = new URL('/signin', request.url)
    url.searchParams.set('signup', '1')
    return NextResponse.redirect(url)
  } catch (error) {
    const message = authErrorMessage(error)
    return NextResponse.redirect(buildErrorRedirect(request, message))
  }
}

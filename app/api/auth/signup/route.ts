import { NextResponse } from 'next/server'
import { authErrorMessage, getAuthConfig, signUp } from '@/lib/server/auth'
import { csrfFormField, validateCsrf } from '@/lib/server/csrf'

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

const redirectAfterPost = (request: Request, url: URL) => {
  const destination = new URL(url.toString(), request.url)
  return NextResponse.redirect(destination, 303)
}

export async function POST(request: Request) {
  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return redirectAfterPost(request, buildErrorRedirect(request, 'Invalid sign-up request.'))
  }

  const csrfToken = formValue(formData, csrfFormField)
  const csrfFailure = await validateCsrf(request, csrfToken)
  if (csrfFailure) {
    return redirectAfterPost(request, buildErrorRedirect(request, 'Session expired. Please refresh and try again.'))
  }

  const email = formValue(formData, 'email')
  const password = formValue(formData, 'password')
  const name = formValue(formData, 'full_name')
  const company = formValue(formData, 'company')
  const nextPath = formValue(formData, 'next')

  if (!email) {
    return redirectAfterPost(request, buildErrorRedirect(request, 'Email is required.'))
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
      if (nextPath) {
        url.searchParams.set('next', nextPath)
      }
      return redirectAfterPost(request, url)
    }

    if (!password) {
      return redirectAfterPost(request, buildErrorRedirect(request, 'Password is required.'))
    }

    await signUp({
      email,
      password,
      name: name || undefined,
      company: company || undefined,
    })

    const url = new URL('/signin', request.url)
    url.searchParams.set('signup', '1')
    if (nextPath) {
      url.searchParams.set('next', nextPath)
    }
    return redirectAfterPost(request, url)
  } catch (error) {
    const message = authErrorMessage(error)
    return redirectAfterPost(request, buildErrorRedirect(request, message))
  }
}

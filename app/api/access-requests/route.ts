import { NextResponse } from 'next/server'
import { getAuthConfig } from '@/lib/server/auth'
import { csrfFormField, validateCsrf } from '@/lib/server/csrf'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const formValue = (formData: FormData, key: string): string => {
  const value = formData.get(key)
  return typeof value === 'string' ? value.trim() : ''
}

const buildErrorRedirect = (request: Request, message: string) => {
  const url = new URL('/request-access', request.url)
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
    return redirectAfterPost(request, buildErrorRedirect(request, 'Invalid access request.'))
  }

  const csrfToken = formValue(formData, csrfFormField)
  const csrfFailure = await validateCsrf(request, csrfToken)
  if (csrfFailure) {
    return redirectAfterPost(request, buildErrorRedirect(request, 'Session expired. Please refresh and try again.'))
  }

  const email = formValue(formData, 'email')
  const firstNameInput = formValue(formData, 'first_name')
  const lastNameInput = formValue(formData, 'last_name')
  const legacyFullName = formValue(formData, 'full_name')
  const company = formValue(formData, 'company')
  const note = formValue(formData, 'note')

  const legacyNameParts = legacyFullName.split(/\s+/).filter(Boolean)
  const firstName = firstNameInput || legacyNameParts[0] || ''
  const lastName =
    lastNameInput || (legacyNameParts.length > 1 ? legacyNameParts.slice(1).join(' ') : '')
  const name = `${firstName} ${lastName}`.trim()

  if (!email) {
    return redirectAfterPost(request, buildErrorRedirect(request, 'Email is required.'))
  }

  if (!firstName) {
    return redirectAfterPost(request, buildErrorRedirect(request, 'First name is required.'))
  }

  if (!lastName) {
    return redirectAfterPost(request, buildErrorRedirect(request, 'Last name is required.'))
  }

  try {
    const config = getAuthConfig()
    const response = await fetch(`${config.apiBaseUrl}/v1/access-requests`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        email,
        name: name || undefined,
        company: company || undefined,
        note: note || undefined,
      }),
    })

    if (!response.ok) {
      throw new Error('access_request_failed')
    }

    const url = new URL('/request-access', request.url)
    url.searchParams.set('requested', '1')
    return redirectAfterPost(request, url)
  } catch {
    return redirectAfterPost(request, buildErrorRedirect(request, 'Unable to submit request. Please try again.'))
  }
}

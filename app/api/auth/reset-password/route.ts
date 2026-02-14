import { NextResponse } from 'next/server'
import {
  authErrorMessage,
  confirmForgotPassword,
  forgotPassword,
} from '@/lib/server/auth'
import { csrfFormField, validateCsrf } from '@/lib/server/csrf'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type ResetMode = 'request' | 'confirm'
type ResetStep = 'request' | 'confirm'
const RESET_EMAIL_COOKIE = 'trope_reset_email'
const RESET_EMAIL_MAX_AGE_SECONDS = 60 * 15

const formValue = (formData: FormData, key: string): string => {
  const value = formData.get(key)
  return typeof value === 'string' ? value.trim() : ''
}

const buildErrorRedirect = (request: Request, message: string, step: ResetStep) => {
  const url = new URL('/reset-password', request.url)
  url.searchParams.set('error', message)
  url.searchParams.set('step', step)
  return url
}

const errorName = (error: unknown): string => {
  if (!error || typeof error !== 'object') return ''
  const candidate = (error as { name?: unknown }).name
  return typeof candidate === 'string' ? candidate : ''
}

const redirectAfterPost = (request: Request, url: URL) => {
  const destination = new URL(url.toString(), request.url)
  return NextResponse.redirect(destination, 303)
}

const setResetEmailCookie = (response: NextResponse, email: string) => {
  const secure = process.env.NODE_ENV === 'production'
  response.cookies.set(RESET_EMAIL_COOKIE, email, {
    httpOnly: true,
    sameSite: 'lax',
    secure,
    path: '/reset-password',
    maxAge: RESET_EMAIL_MAX_AGE_SECONDS,
  })
}

const clearResetEmailCookie = (response: NextResponse) => {
  response.cookies.set(RESET_EMAIL_COOKIE, '', { path: '/reset-password', maxAge: 0 })
}

export async function POST(request: Request) {
  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return redirectAfterPost(request, buildErrorRedirect(request, 'Invalid reset request.', 'request'))
  }

  const csrfToken = formValue(formData, csrfFormField)
  const modeValue = formValue(formData, 'mode').toLowerCase()
  const stepValue = formValue(formData, 'step').toLowerCase()
  const code = formValue(formData, 'code')
  const newPassword = formValue(formData, 'new_password')
  const confirmNewPassword = formValue(formData, 'confirm_new_password')
  const step: ResetStep = stepValue === 'confirm' ? 'confirm' : 'request'
  const mode: ResetMode =
    modeValue === 'confirm' || (modeValue !== 'request' && Boolean(code || newPassword || confirmNewPassword))
      ? 'confirm'
      : 'request'
  const csrfFailure = await validateCsrf(request, csrfToken)
  if (csrfFailure) {
    return redirectAfterPost(
      request,
      buildErrorRedirect(request, 'Session expired. Please refresh and try again.', step)
    )
  }

  const email = formValue(formData, 'email')

  if (!email) {
    return redirectAfterPost(request, buildErrorRedirect(request, 'Email is required.', step))
  }

  try {
    if (mode === 'confirm' && (!code || !newPassword || !confirmNewPassword)) {
      return redirectAfterPost(
        request,
        buildErrorRedirect(
          request,
          'Enter the verification code and both password fields.',
          'confirm'
        )
      )
    }

    if (mode === 'confirm') {
      if (newPassword !== confirmNewPassword) {
        return redirectAfterPost(
          request,
          buildErrorRedirect(request, 'New password and confirmation do not match.', 'confirm')
        )
      }
      await confirmForgotPassword({ email, code, newPassword })
      const url = new URL('/signin', request.url)
      url.searchParams.set('reset', '1')
      const response = redirectAfterPost(request, url)
      clearResetEmailCookie(response)
      return response
    }

    try {
      await forgotPassword(email)
    } catch (error) {
      if (errorName(error) !== 'UserNotFoundException') {
        throw error
      }
    }
    const url = new URL('/reset-password', request.url)
    url.searchParams.set('sent', '1')
    url.searchParams.set('step', 'confirm')
    const response = redirectAfterPost(request, url)
    setResetEmailCookie(response, email)
    return response
  } catch (error) {
    const message = authErrorMessage(error)
    return redirectAfterPost(request, buildErrorRedirect(request, message, mode))
  }
}

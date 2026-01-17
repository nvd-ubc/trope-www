import { NextResponse } from 'next/server'
import {
  authErrorMessage,
  confirmForgotPassword,
  forgotPassword,
} from '@/lib/server/auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const formValue = (formData: FormData, key: string): string => {
  const value = formData.get(key)
  return typeof value === 'string' ? value.trim() : ''
}

const buildErrorRedirect = (request: Request, message: string) => {
  const url = new URL('/reset-password', request.url)
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
    return redirectAfterPost(request, buildErrorRedirect(request, 'Invalid reset request.'))
  }

  const email = formValue(formData, 'email')
  const code = formValue(formData, 'code')
  const newPassword = formValue(formData, 'new_password')

  if (!email) {
    return redirectAfterPost(request, buildErrorRedirect(request, 'Email is required.'))
  }

  try {
    if ((code && !newPassword) || (!code && newPassword)) {
      return redirectAfterPost(
        request,
        buildErrorRedirect(request, 'Enter both the verification code and a new password.')
      )
    }

    if (code && newPassword) {
      await confirmForgotPassword({ email, code, newPassword })
      const url = new URL('/signin', request.url)
      url.searchParams.set('reset', '1')
      return redirectAfterPost(request, url)
    }

    await forgotPassword(email)
    const url = new URL('/reset-password', request.url)
    url.searchParams.set('sent', '1')
    return redirectAfterPost(request, url)
  } catch (error) {
    const message = authErrorMessage(error)
    return redirectAfterPost(request, buildErrorRedirect(request, message))
  }
}

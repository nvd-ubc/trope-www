import 'server-only'

import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { getAuthConfig } from './auth-config'

export type CsrfFailure = 'origin_missing' | 'origin_invalid' | 'token_missing' | 'token_mismatch'

const CSRF_COOKIE = 'trope_csrf'
const CSRF_HEADER = 'x-csrf-token'
const CSRF_FORM_FIELD = 'csrf_token'
const CSRF_MAX_AGE = 60 * 60 * 8

const parseAllowlist = (value: string | undefined): Set<string> => {
  if (!value) return new Set()
  const entries = value
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0)
  return new Set(entries)
}

const buildOriginAllowlist = (): Set<string> => {
  const fromEnv =
    process.env.TROPE_WEB_ORIGIN_ALLOWLIST ||
    process.env.NEXT_PUBLIC_TROPE_WEB_ORIGIN_ALLOWLIST ||
    ''
  const allowlist = parseAllowlist(fromEnv)
  if (process.env.NODE_ENV === 'production') {
    allowlist.add('https://trope.ai')
    allowlist.add('https://www.trope.ai')
  }
  return allowlist
}

const originAllowlist = buildOriginAllowlist()

const buildCookieOptions = () => {
  const { isProd } = getAuthConfig()
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: isProd,
    path: '/',
    maxAge: CSRF_MAX_AGE,
  }
}

export const generateCsrfToken = (): string => {
  if (typeof crypto?.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  const bytes = crypto.getRandomValues(new Uint8Array(16))
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

export const csrfFormField = CSRF_FORM_FIELD

export const readCsrfToken = async (): Promise<string> => {
  const store = await cookies()
  return store.get(CSRF_COOKIE)?.value ?? ''
}

export const setCsrfCookie = (response: NextResponse, token?: string): string => {
  const value = token || generateCsrfToken()
  response.cookies.set(CSRF_COOKIE, value, buildCookieOptions())
  return value
}

export const clearCsrfCookie = (response: NextResponse): void => {
  response.cookies.set(CSRF_COOKIE, '', { path: '/', maxAge: 0 })
}

export const ensureCsrfCookie = async (response: NextResponse): Promise<string> => {
  const existing = await readCsrfToken()
  if (existing) {
    return existing
  }
  return setCsrfCookie(response)
}

export const validateCsrf = async (
  request: Request,
  tokenFromBody?: string
): Promise<CsrfFailure | null> => {
  const origin = request.headers.get('origin')
  if (!origin) {
    if (process.env.NODE_ENV === 'production') {
      return 'origin_missing'
    }
  } else {
    const requestOrigin = new URL(request.url).origin
    if (origin !== requestOrigin && !originAllowlist.has(origin)) {
      return 'origin_invalid'
    }
  }

  const cookieToken = await readCsrfToken()
  const headerToken = request.headers.get(CSRF_HEADER) ?? ''
  const providedToken = tokenFromBody || headerToken

  if (!cookieToken || !providedToken) {
    return 'token_missing'
  }
  if (cookieToken !== providedToken) {
    return 'token_mismatch'
  }

  return null
}

export const csrfErrorResponse = (failure: CsrfFailure) =>
  NextResponse.json(
    {
      error: 'csrf_invalid',
      failure,
      message: 'CSRF validation failed.',
    },
    { status: 403 }
  )

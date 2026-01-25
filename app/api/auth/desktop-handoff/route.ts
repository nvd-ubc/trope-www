import { NextResponse } from 'next/server'
import { getAuthConfig, getSessionWithRefresh, setAuthCookies } from '@/lib/server/auth'
import { setCsrfCookie } from '@/lib/server/csrf'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const defaultDesktopRedirectAllowlist = [
  'trope://auth-callback',
  'http://127.0.0.1:4378/auth-callback',
  'http://localhost:4378/auth-callback',
]

const normalizeRedirectUri = (value: string): string | null => {
  try {
    const url = new URL(value)
    return `${url.protocol}//${url.host}${url.pathname}`
  } catch {
    return null
  }
}

const buildDesktopRedirectAllowlist = (): Set<string> => {
  const raw =
    process.env.TROPE_AUTH_HANDOFF_REDIRECT_ALLOWLIST ?? defaultDesktopRedirectAllowlist.join(',')
  const entries = raw
    .split(',')
    .map(value => value.trim())
    .filter(value => value.length > 0)
  const normalized = entries
    .map(entry => normalizeRedirectUri(entry) ?? entry)
    .filter((entry): entry is string => Boolean(entry))
  return new Set(normalized)
}

const desktopRedirectAllowlist = buildDesktopRedirectAllowlist()

const isAllowedDesktopRedirect = (redirectUri: string): boolean => {
  const normalized = normalizeRedirectUri(redirectUri)
  if (!normalized) return false
  return desktopRedirectAllowlist.has(normalized)
}

const buildErrorRedirect = (request: Request, params: Record<string, string>) => {
  const url = new URL('/signin', request.url)
  Object.entries(params).forEach(([key, value]) => {
    if (value) url.searchParams.set(key, value)
  })
  return url
}

const startHandoff = async (params: {
  apiBaseUrl: string
  state: string
  redirectUri: string
  platform: string
}) => {
  const response = await fetch(`${params.apiBaseUrl}/v1/auth/handoff/start`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      state: params.state,
      redirect_uri: params.redirectUri,
      platform: params.platform,
    }),
  })

  const payload = (await response.json().catch(() => null)) as Record<string, unknown> | null
  const handoffId = payload && typeof payload.handoff_id === 'string' ? payload.handoff_id : ''
  if (!response.ok || !handoffId) {
    const message = typeof payload?.message === 'string' ? payload.message : 'handoff_start_failed'
    throw new Error(message)
  }

  return handoffId
}

const completeHandoff = async (params: {
  apiBaseUrl: string
  handoffId: string
  state: string
  tokens: {
    accessToken: string
    refreshToken?: string
    idToken?: string
    expiresIn: number
  }
}) => {
  const response = await fetch(`${params.apiBaseUrl}/v1/auth/handoff/complete`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${params.tokens.accessToken}`,
    },
    body: JSON.stringify({
      handoff_id: params.handoffId,
      state: params.state,
      access_token: params.tokens.accessToken,
      refresh_token: params.tokens.refreshToken,
      id_token: params.tokens.idToken,
      expires_in: params.tokens.expiresIn,
    }),
  })

  const payload = (await response.json().catch(() => null)) as Record<string, unknown> | null
  const handoffCode = payload && typeof payload.handoff_code === 'string' ? payload.handoff_code : ''
  if (!response.ok || !handoffCode) {
    const message = typeof payload?.message === 'string' ? payload.message : 'handoff_complete_failed'
    throw new Error(message)
  }

  return handoffCode
}

const buildRedirectWithParams = (raw: string, params: Record<string, string>) => {
  const url = new URL(raw)
  Object.entries(params).forEach(([key, value]) => {
    if (value) url.searchParams.set(key, value)
  })
  return url
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const state = url.searchParams.get('state')?.trim() ?? ''
  const redirectUri = url.searchParams.get('redirect')?.trim() ?? ''
  const platform = url.searchParams.get('platform')?.trim() ?? 'unknown'

  if (!state || !redirectUri) {
    return NextResponse.redirect(
      buildErrorRedirect(request, {
        error: 'Missing desktop sign-in details. Try again from the app.',
        client: 'desktop',
        state,
        redirect: redirectUri,
        platform,
      }),
      303
    )
  }

  if (!isAllowedDesktopRedirect(redirectUri)) {
    return NextResponse.redirect(
      buildErrorRedirect(request, {
        error: 'Invalid desktop redirect. Try again from the app.',
        client: 'desktop',
        state,
        redirect: redirectUri,
        platform,
      }),
      303
    )
  }

  const sessionResult = await getSessionWithRefresh()
  if (!sessionResult?.session?.accessToken) {
    return NextResponse.redirect(
      buildErrorRedirect(request, {
        error: 'Please sign in to continue.',
        client: 'desktop',
        state,
        redirect: redirectUri,
        platform,
      }),
      303
    )
  }

  const { session, refreshed, tokens } = sessionResult
  const config = getAuthConfig()
  const expiresIn = session.expiresAt
    ? Math.max(0, Math.floor((session.expiresAt - Date.now()) / 1000))
    : 0

  try {
    const handoffId = await startHandoff({
      apiBaseUrl: config.apiBaseUrl,
      state,
      redirectUri,
      platform,
    })

    const handoffCode = await completeHandoff({
      apiBaseUrl: config.apiBaseUrl,
      handoffId,
      state,
      tokens: {
        accessToken: session.accessToken,
        refreshToken: session.refreshToken,
        idToken: session.idToken,
        expiresIn,
      },
    })

    const callbackUrl = buildRedirectWithParams(redirectUri, {
      handoff_code: handoffCode,
      state,
    })
    const completeUrl = new URL('/signin/desktop-complete', request.url)
    completeUrl.searchParams.set('callback', callbackUrl.toString())

    const response = NextResponse.redirect(completeUrl, 303)
    if (refreshed && tokens) {
      setAuthCookies(response, tokens)
      setCsrfCookie(response)
    }
    return response
  } catch (error) {
    const message = error instanceof Error ? error.message : 'handoff_failed'
    return NextResponse.redirect(
      buildErrorRedirect(request, {
        error: message,
        client: 'desktop',
        state,
        redirect: redirectUri,
        platform,
      }),
      303
    )
  }
}

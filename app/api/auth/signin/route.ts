import { NextResponse } from 'next/server'
import {
  authErrorMessage,
  getAuthConfig,
  safeRedirectPath,
  setAuthCookies,
  signInWithPassword,
} from '@/lib/server/auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const formValue = (formData: FormData, key: string): string => {
  const value = formData.get(key)
  return typeof value === 'string' ? value.trim() : ''
}

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

const redirectAfterPost = (request: Request, url: URL) => {
  const destination = new URL(url.toString(), request.url)
  return NextResponse.redirect(destination, 303)
}

export async function POST(request: Request) {
  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return redirectAfterPost(request, buildErrorRedirect(request, { error: 'Invalid sign-in request.' }))
  }

  const email = formValue(formData, 'email')
  const password = formValue(formData, 'password')
  const client = formValue(formData, 'client') === 'desktop' ? 'desktop' : 'web'
  const state = formValue(formData, 'state')
  const redirectUri = formValue(formData, 'redirect')
  const platform = formValue(formData, 'platform') || 'unknown'
  const next = formValue(formData, 'next')

  if (!email || !password) {
    return redirectAfterPost(
      request,
      buildErrorRedirect(request, {
        error: 'Email and password are required.',
        client,
        state,
        redirect: redirectUri,
        platform,
      })
    )
  }

  try {
    const config = getAuthConfig()

    if (client === 'desktop') {
      if (!state || !redirectUri) {
        return redirectAfterPost(
          request,
          buildErrorRedirect(request, {
            error: 'Missing desktop sign-in details. Try again from the app.',
          })
        )
      }

      if (!isAllowedDesktopRedirect(redirectUri)) {
        return redirectAfterPost(
          request,
          buildErrorRedirect(request, {
            error: 'Invalid desktop redirect. Try again from the app.',
            client,
            state,
            platform,
          })
        )
      }

      const desktopTokens = await signInWithPassword(email, password, 'desktop')
      let webTokens = config.webClientId === config.desktopClientId ? desktopTokens : null
      if (!webTokens && config.webClientId !== config.desktopClientId) {
        try {
          webTokens = await signInWithPassword(email, password, 'web')
        } catch {
          webTokens = null
        }
      }

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
        tokens: desktopTokens,
      })

      const callbackUrl = buildRedirectWithParams(redirectUri, {
        handoff_code: handoffCode,
        state,
      })

      const response = redirectAfterPost(request, callbackUrl)
      if (webTokens) {
        setAuthCookies(response, webTokens)
      }
      return response
    }

    const tokens = await signInWithPassword(email, password, 'web')
    const response = redirectAfterPost(request, new URL(safeRedirectPath(next), request.url))
    setAuthCookies(response, tokens)
    return response
  } catch (error) {
    const message = authErrorMessage(error)
    return redirectAfterPost(
      request,
      buildErrorRedirect(request, {
        error: message,
        client,
        state,
        redirect: redirectUri,
        platform,
        next,
      })
    )
  }
}

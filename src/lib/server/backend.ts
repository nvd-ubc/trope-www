import 'server-only'

import { NextResponse } from 'next/server'
import {
  clearAuthCookies,
  getAuthConfig,
  getSessionWithRefresh,
  refreshTokens,
  setAuthCookies,
} from './auth'

type TokenType = 'access' | 'id'

type ProxyOptions = {
  method?: string
  tokenType?: TokenType
  body?: BodyInit | null
  headers?: HeadersInit
  cache?: RequestCache
}

type PublicOptions = {
  method?: string
  body?: BodyInit | null
  headers?: HeadersInit
  cache?: RequestCache
}

const readJson = async (response: Response) => {
  if (response.status === 204) return null
  const contentType = response.headers.get('content-type') || ''
  if (!contentType.includes('application/json')) return null
  return response.json().catch(() => null)
}

export const proxyBackendRequest = async (
  path: string,
  options: ProxyOptions = {}
): Promise<NextResponse> => {
  const sessionResult = await getSessionWithRefresh()
  if (!sessionResult) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  let { session, refreshed, tokens } = sessionResult
  const config = getAuthConfig()

  if (options.tokenType === 'id' && !session.idToken && session.refreshToken) {
    try {
      const refreshedTokens = await refreshTokens(session.refreshToken, 'web')
      session = {
        accessToken: refreshedTokens.accessToken,
        refreshToken: refreshedTokens.refreshToken,
        idToken: refreshedTokens.idToken,
        expiresAt: Date.now() + refreshedTokens.expiresIn * 1000,
      }
      tokens = refreshedTokens
      refreshed = true
    } catch {
      // ignore id token refresh failure
    }
  }

  const token = options.tokenType === 'id' ? session.idToken : session.accessToken
  if (!token) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const headers = new Headers(options.headers)
  headers.set('authorization', `Bearer ${token}`)

  const requestInit: RequestInit = {
    method: options.method ?? 'GET',
    headers,
    body: options.body ?? undefined,
    cache: options.cache ?? 'no-store',
  }

  let response = await fetch(`${config.apiBaseUrl}${path}`, requestInit)

  if (response.status === 401 && session.refreshToken) {
    try {
      const refreshedTokens = await refreshTokens(session.refreshToken, 'web')
      session = {
        accessToken: refreshedTokens.accessToken,
        refreshToken: refreshedTokens.refreshToken,
        idToken: refreshedTokens.idToken,
        expiresAt: Date.now() + refreshedTokens.expiresIn * 1000,
      }
      tokens = refreshedTokens
      refreshed = true

      const retryHeaders = new Headers(options.headers)
      const retryToken = options.tokenType === 'id' ? session.idToken : session.accessToken
      if (retryToken) {
        retryHeaders.set('authorization', `Bearer ${retryToken}`)
      }
      response = await fetch(`${config.apiBaseUrl}${path}`, {
        ...requestInit,
        headers: retryHeaders,
      })
    } catch {
      // ignore refresh failures
    }
  }

  const payload = await readJson(response)
  const next = NextResponse.json(payload ?? {}, { status: response.status })

  const requestId = response.headers.get('x-trope-request-id')
  if (requestId) {
    next.headers.set('X-Trope-Request-Id', requestId)
  }

  if (refreshed && tokens) {
    setAuthCookies(next, tokens)
  }

  if (response.status === 401) {
    clearAuthCookies(next)
  }

  return next
}

export const publicBackendRequest = async (
  path: string,
  options: PublicOptions = {}
): Promise<NextResponse> => {
  const config = getAuthConfig()
  const response = await fetch(`${config.apiBaseUrl}${path}`, {
    method: options.method ?? 'GET',
    headers: options.headers,
    body: options.body ?? undefined,
    cache: options.cache ?? 'no-store',
  })

  const payload = await readJson(response)
  const next = NextResponse.json(payload ?? {}, { status: response.status })

  const requestId = response.headers.get('x-trope-request-id')
  if (requestId) {
    next.headers.set('X-Trope-Request-Id', requestId)
  }

  return next
}

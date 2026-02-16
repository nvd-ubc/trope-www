import 'server-only'

import { NextResponse } from 'next/server'

export type InternalJsonFetchResult<T = unknown> = {
  ok: boolean
  status: number
  data: T | null
  requestId: string | null
  serverTiming: string | null
  setCookies: string[]
  timedOut?: boolean
  error?: string
}

type InternalJsonFetchOptions = {
  timeoutMs?: number
  cookieHeader?: string | null
}

const readSetCookies = (response: Response): string[] => {
  const maybeHeaders = response.headers as Headers & { getSetCookie?: () => string[] }
  if (typeof maybeHeaders.getSetCookie === 'function') {
    const values = maybeHeaders.getSetCookie()
    if (Array.isArray(values) && values.length > 0) {
      return values
    }
  }

  const single = response.headers.get('set-cookie')
  return single ? [single] : []
}

const applyCookieHeader = (cookieHeader: string | null | undefined, headers: Headers) => {
  if (typeof cookieHeader === 'string' && cookieHeader.trim().length > 0) {
    headers.set('cookie', cookieHeader)
  }
}

const parseCookieHeader = (cookieHeader: string): Map<string, string> => {
  const values = new Map<string, string>()
  for (const part of cookieHeader.split(';')) {
    const segment = part.trim()
    if (!segment) continue
    const delimiter = segment.indexOf('=')
    if (delimiter <= 0) continue
    const name = segment.slice(0, delimiter).trim()
    const value = segment.slice(delimiter + 1).trim()
    if (!name) continue
    values.set(name, value)
  }
  return values
}

const parseSetCookiePair = (setCookie: string): [string, string] | null => {
  const pair = setCookie.split(';', 1)[0]?.trim()
  if (!pair) return null
  const delimiter = pair.indexOf('=')
  if (delimiter <= 0) return null
  const name = pair.slice(0, delimiter).trim()
  const value = pair.slice(delimiter + 1).trim()
  if (!name) return null
  return [name, value]
}

export const mergeCookieHeader = (
  baseCookieHeader: string | null | undefined,
  setCookies: string[] | null | undefined
): string | undefined => {
  const merged = new Map<string, string>()
  if (typeof baseCookieHeader === 'string' && baseCookieHeader.trim().length > 0) {
    for (const [name, value] of parseCookieHeader(baseCookieHeader)) {
      merged.set(name, value)
    }
  }

  for (const setCookie of setCookies ?? []) {
    const parsed = parseSetCookiePair(setCookie)
    if (!parsed) continue
    const [name, value] = parsed
    merged.set(name, value)
  }

  if (merged.size === 0) {
    return undefined
  }

  return Array.from(merged.entries())
    .map(([name, value]) => `${name}=${value}`)
    .join('; ')
}

export const fetchInternalJson = async <T>(
  request: Request,
  path: string,
  options?: InternalJsonFetchOptions
): Promise<InternalJsonFetchResult<T>> => {
  const targetUrl = new URL(path, request.url)
  const headers = new Headers()
  applyCookieHeader(options?.cookieHeader ?? request.headers.get('cookie'), headers)

  const timeoutMs = options?.timeoutMs
  const controller = typeof timeoutMs === 'number' && timeoutMs > 0 ? new AbortController() : null
  const timeoutId =
    controller && typeof timeoutMs === 'number' && timeoutMs > 0
      ? setTimeout(() => controller.abort(), timeoutMs)
      : null

  let response: Response
  try {
    response = await fetch(targetUrl, {
      method: 'GET',
      headers,
      cache: 'no-store',
      signal: controller?.signal,
    })
  } catch {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    const timedOut = controller?.signal.aborted === true
    return {
      ok: false,
      status: timedOut ? 504 : 503,
      data: null,
      requestId: null,
      serverTiming: null,
      setCookies: [],
      timedOut,
      error: timedOut ? 'timeout' : 'network_error',
    }
  }

  if (timeoutId) {
    clearTimeout(timeoutId)
  }

  const data = (await response.json().catch(() => null)) as T | null
  return {
    ok: response.ok,
    status: response.status,
    data,
    requestId: response.headers.get('x-trope-request-id'),
    serverTiming: response.headers.get('server-timing'),
    setCookies: readSetCookies(response),
  }
}

export const firstFailedResult = (
  ...results: Array<InternalJsonFetchResult<unknown>>
): InternalJsonFetchResult<unknown> | null => {
  for (const result of results) {
    if (!result.ok) return result
  }
  return null
}

export const applyBootstrapMeta = (
  response: NextResponse,
  ...results: Array<InternalJsonFetchResult<unknown>>
) => {
  const requestId = results.map((result) => result.requestId).find(Boolean)
  if (requestId) {
    response.headers.set('X-Trope-Request-Id', requestId)
  }

  const timingEntries = results.map((result) => result.serverTiming).filter(Boolean)
  if (timingEntries.length > 0) {
    response.headers.set('Server-Timing', timingEntries.join(', '))
  }

  const setCookies = results.flatMap((result) => result.setCookies ?? [])
  const seen = new Set<string>()
  for (const cookie of setCookies) {
    if (!cookie || seen.has(cookie)) continue
    response.headers.append('Set-Cookie', cookie)
    seen.add(cookie)
  }
}

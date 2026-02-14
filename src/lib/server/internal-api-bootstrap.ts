import 'server-only'

import { NextResponse } from 'next/server'

export type InternalJsonFetchResult<T = unknown> = {
  ok: boolean
  status: number
  data: T | null
  requestId: string | null
  serverTiming: string | null
  timedOut?: boolean
  error?: string
}

type InternalJsonFetchOptions = {
  timeoutMs?: number
}

export const fetchInternalJson = async <T>(
  request: Request,
  path: string,
  options?: InternalJsonFetchOptions
): Promise<InternalJsonFetchResult<T>> => {
  const targetUrl = new URL(path, request.url)
  const headers = new Headers()
  const cookieHeader = request.headers.get('cookie')
  if (cookieHeader) {
    headers.set('cookie', cookieHeader)
  }

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
}

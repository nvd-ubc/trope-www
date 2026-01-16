import { NextResponse } from 'next/server'
import {
  clearAuthCookies,
  getAuthConfig,
  getSessionWithRefresh,
  refreshTokens,
  setAuthCookies,
} from '@/lib/server/auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const readJson = async (response: Response) => {
  if (response.status === 204) return null
  const contentType = response.headers.get('content-type') || ''
  if (!contentType.includes('application/json')) return null
  return response.json().catch(() => null)
}

export async function GET() {
  const sessionResult = await getSessionWithRefresh()
  if (!sessionResult) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  let { session, refreshed, tokens } = sessionResult
  const config = getAuthConfig()

  let response = await fetch(`${config.apiBaseUrl}/v1/me`, {
    headers: {
      authorization: `Bearer ${session.accessToken}`,
    },
    cache: 'no-store',
  })

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
      response = await fetch(`${config.apiBaseUrl}/v1/me`, {
        headers: {
          authorization: `Bearer ${session.accessToken}`,
        },
        cache: 'no-store',
      })
    } catch {
      // Ignore refresh failures below.
    }
  }

  const payload = await readJson(response)
  const next = NextResponse.json(payload ?? {}, { status: response.status })

  if (refreshed && tokens) {
    setAuthCookies(next, tokens)
  }

  if (response.status === 401) {
    clearAuthCookies(next)
  }

  return next
}

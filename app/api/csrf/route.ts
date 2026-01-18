import { NextResponse } from 'next/server'
import { generateCsrfToken, readCsrfToken, setCsrfCookie } from '@/lib/server/csrf'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  const existing = await readCsrfToken()
  const token = existing || generateCsrfToken()
  const response = NextResponse.json({ csrf_token: token })
  if (!existing) {
    setCsrfCookie(response, token)
  }
  response.headers.set('cache-control', 'no-store')
  return response
}

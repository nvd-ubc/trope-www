import { NextResponse } from 'next/server'
import { clearAuthCookies } from '@/lib/server/auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  const response = NextResponse.redirect(new URL('/signin?signed_out=1', request.url))
  clearAuthCookies(response)
  return response
}

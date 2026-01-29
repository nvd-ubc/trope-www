'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import AuthLogo from '../auth-logo'
import { useCsrfToken } from '@/lib/client/use-csrf-token'

const queryValue = (params: URLSearchParams, key: string): string => params.get(key)?.trim() ?? ''

export default function SignInForm() {
  const searchParams = useSearchParams()
  const { token: csrfToken, loading: csrfLoading } = useCsrfToken()

  const error = queryValue(searchParams, 'error')
  const redirect = queryValue(searchParams, 'redirect')
  const state = queryValue(searchParams, 'state')
  const platform = queryValue(searchParams, 'platform')
  const next = queryValue(searchParams, 'next')
  const signup = queryValue(searchParams, 'signup')
  const reset = queryValue(searchParams, 'reset')
  const signedOut = queryValue(searchParams, 'signed_out')
  const inviteIntent = next.includes('/invite')

  const inferredDesktop = queryValue(searchParams, 'client') === 'desktop' || Boolean(redirect && state)
  const client = inferredDesktop ? 'desktop' : 'web'

  return (
    <>
      <div className="max-w-3xl mx-auto text-center pb-8">
        <AuthLogo />
        <h1 className="text-2xl md:text-3xl font-medium text-slate-900">Sign in to your account</h1>
        {client === 'desktop' && (
          <p className="mt-3 text-sm text-slate-600">
            Finish signing in to Trope Cloud and we&apos;ll return you to the app.
          </p>
        )}
      </div>

      <div className="max-w-sm mx-auto">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          {(error || signup || reset || signedOut) && (
            <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
              {error && <p>{error}</p>}
              {!error && signup && <p>Account created. Check your email to verify, then sign in.</p>}
              {!error && reset && <p>Password updated. Please sign in again.</p>}
              {!error && signedOut && <p>You&apos;re signed out.</p>}
            </div>
          )}

          <form action="/api/auth/signin" method="post">
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-700 font-medium mb-1.5" htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:border-[#1861C8] focus:ring-1 focus:ring-[#1861C8] transition"
                  type="email"
                  placeholder="you@example.com"
                  required
                />
              </div>
              <div>
                <div className="flex justify-between">
                  <label className="block text-sm text-slate-700 font-medium mb-1.5" htmlFor="password">
                    Password
                  </label>
                  <Link
                    className="text-sm font-medium text-[#1861C8] hover:text-[#1861C8]/80 transition"
                    href="/reset-password"
                  >
                    Forgot?
                  </Link>
                </div>
                <input
                  id="password"
                  name="password"
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:border-[#1861C8] focus:ring-1 focus:ring-[#1861C8] transition"
                  type="password"
                  autoComplete="on"
                  required
                />
              </div>
            </div>

            <input type="hidden" name="client" value={client} />
            {client === 'desktop' ? (
              <>
                <input type="hidden" name="state" value={state} />
                <input type="hidden" name="redirect" value={redirect} />
                <input type="hidden" name="platform" value={platform} />
              </>
            ) : (
              <input type="hidden" name="next" value={next} />
            )}
            <input type="hidden" name="csrf_token" value={csrfToken} />

            <div className="mt-6">
              <button
                className="w-full py-3 px-4 text-sm font-semibold text-white bg-[#1861C8] rounded-full hover:bg-[#2171d8] transition disabled:cursor-not-allowed disabled:opacity-60"
                disabled={csrfLoading || !csrfToken}
              >
                Sign In
              </button>
            </div>
          </form>
        </div>

        <p className="text-center text-sm text-slate-600 mt-6">
          Need access?{' '}
          <Link className="font-medium text-[#1861C8] hover:text-[#1861C8]/80" href="/request-access">
            Request access
          </Link>
          {inviteIntent && (
            <>
              {' '}or{' '}
              <Link
                className="font-medium text-[#1861C8] hover:text-[#1861C8]/80"
                href={`/signup?next=${encodeURIComponent(next)}`}
              >
                create an account
              </Link>
              {' '}to accept your invite.
            </>
          )}
        </p>
      </div>
    </>
  )
}

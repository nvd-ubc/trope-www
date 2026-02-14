'use client'

import Link from 'next/link'
import AuthLogo from '../auth-logo'
import { useCsrfToken } from '@/lib/client/use-csrf-token'

type ResetPasswordFormProps = {
  error?: string
  sent?: string
}

export default function ResetPasswordForm({ error, sent }: ResetPasswordFormProps) {
  const { token: csrfToken, loading: csrfLoading } = useCsrfToken()

  return (
    <>
      <div className="max-w-3xl mx-auto text-center pb-8">
        <AuthLogo />
        <h1 className="text-2xl md:text-3xl font-medium text-slate-900">Reset your password</h1>
        <p className="mt-3 text-sm text-slate-600">
          Send a reset code, then enter the code and your new password below.
        </p>
      </div>

      <div className="max-w-sm mx-auto">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          {(error || sent) && (
            <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
              {error && <p>{error}</p>}
              {!error && sent && <p>Reset code sent. Check your email for the verification code.</p>}
            </div>
          )}
          <form action="/api/auth/reset-password" method="post">
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
                <label className="block text-sm text-slate-700 font-medium mb-1.5" htmlFor="code">
                  Verification Code
                </label>
                <input
                  id="code"
                  name="code"
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:border-[#1861C8] focus:ring-1 focus:ring-[#1861C8] transition"
                  type="text"
                  placeholder="123456"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-700 font-medium mb-1.5" htmlFor="new-password">
                  New Password
                </label>
                <input
                  id="new-password"
                  name="new_password"
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:border-[#1861C8] focus:ring-1 focus:ring-[#1861C8] transition"
                  type="password"
                  autoComplete="new-password"
                  placeholder="••••••••"
                />
              </div>
            </div>
            <input type="hidden" name="csrf_token" value={csrfToken} />
            <div className="mt-6">
              <button
                className="w-full py-3 px-4 text-sm font-semibold text-white bg-[#1861C8] rounded-full hover:bg-[#2171d8] transition disabled:cursor-not-allowed disabled:opacity-60"
                disabled={csrfLoading || !csrfToken}
              >
                Reset Password
              </button>
            </div>
          </form>
        </div>

        <p className="text-center text-sm text-slate-600 mt-6">
          Remember your password?{' '}
          <Link className="font-medium text-[#1861C8] hover:text-[#1861C8]/80" href="/signin">
            Sign in
          </Link>
        </p>
      </div>
    </>
  )
}

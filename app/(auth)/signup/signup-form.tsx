'use client'

import Link from 'next/link'
import { useCsrfToken } from '@/lib/client/use-csrf-token'
import AuthLogo from '../auth-logo'

type SignUpFormProps = {
  selfSignupEnabled: boolean
  error?: string
  requested?: string
  nextPath?: string
}

const SignUpFields = ({
  error,
  requested,
  nextPath,
}: {
  error?: string
  requested?: string
  nextPath?: string
}) => {
  const { token: csrfToken, loading: csrfLoading } = useCsrfToken()

  return (
    <>
      <div className="max-w-3xl mx-auto text-center pb-8">
        <AuthLogo />
        <h1 className="text-2xl md:text-3xl font-medium text-slate-900">
          Create your Trope account
        </h1>
      </div>

      <div className="max-w-sm mx-auto">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          {(error || requested) && (
            <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
              {error && <p>{error}</p>}
              {!error && requested && <p>Request received. We&apos;ll be in touch soon.</p>}
            </div>
          )}
          <form action="/api/auth/signup" method="post">
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-700 font-medium mb-1.5" htmlFor="company">
                  Company
                </label>
                <input
                  id="company"
                  name="company"
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-slate-900 placeholder-slate-400 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition"
                  type="text"
                  placeholder="Acme Inc."
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-slate-700 font-medium mb-1.5" htmlFor="full-name">
                  Full Name
                </label>
                <input
                  id="full-name"
                  name="full_name"
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-slate-900 placeholder-slate-400 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition"
                  type="text"
                  placeholder="Mark Rossi"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-slate-700 font-medium mb-1.5" htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-slate-900 placeholder-slate-400 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition"
                  type="email"
                  placeholder="you@example.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-slate-700 font-medium mb-1.5" htmlFor="password">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-slate-900 placeholder-slate-400 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition"
                  type="password"
                  autoComplete="on"
                  required
                />
              </div>
            </div>
            <input type="hidden" name="next" value={nextPath ?? ''} />
            <input type="hidden" name="csrf_token" value={csrfToken} />
            <div className="mt-6">
              <button
                className="w-full py-3 px-4 text-sm font-semibold text-white bg-[#1861C8] rounded-full hover:bg-[#2171d8] transition disabled:cursor-not-allowed disabled:opacity-60"
                disabled={csrfLoading || !csrfToken}
              >
                Sign Up
              </button>
            </div>
          </form>
        </div>

        <p className="text-center text-sm text-slate-600 mt-6">
          Already have an account?{' '}
          <Link
            className="font-medium text-slate-900 hover:underline"
            href={nextPath ? `/signin?next=${encodeURIComponent(nextPath)}` : '/signin'}
          >
            Sign in
          </Link>
        </p>
      </div>
    </>
  )
}

const SignupDecision = () => {
  return (
    <>
      <div className="max-w-3xl mx-auto text-center pb-8">
        <AuthLogo />
        <h1 className="text-2xl md:text-3xl font-medium text-slate-900">Get access to Trope</h1>
        <p className="mt-3 text-sm text-slate-600">
          Trope is in closed beta. Request access or use an invite link to get started.
        </p>
      </div>

      <div className="max-w-md mx-auto space-y-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <h2 className="text-base font-semibold text-slate-900">Request access</h2>
          <p className="mt-2 text-sm text-slate-600">
            Tell us about your team and we&apos;ll follow up with next steps.
          </p>
          <Link
            className="mt-4 inline-flex w-full justify-center rounded-full bg-[#1861C8] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2171d8]"
            href="/request-access"
          >
            Request access
          </Link>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <h2 className="text-base font-semibold text-slate-900">Have an invite?</h2>
          <p className="mt-2 text-sm text-slate-600">
            Use your invite link to accept and join the workspace.
          </p>
          <Link
            className="mt-4 inline-flex w-full justify-center rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-slate-300"
            href="/invite"
          >
            Accept invite
          </Link>
        </div>

        <div className="text-center text-sm text-slate-600">
          Already have an account?{' '}
          <Link className="font-medium text-slate-900 hover:underline" href="/signin">
            Sign in
          </Link>
        </div>
      </div>
    </>
  )
}

export default function SignUpForm({
  selfSignupEnabled,
  error,
  requested,
  nextPath,
}: SignUpFormProps) {
  if (!selfSignupEnabled) {
    return <SignupDecision />
  }

  return <SignUpFields error={error} requested={requested} nextPath={nextPath} />
}

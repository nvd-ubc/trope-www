export const metadata = {
  title: 'Sign Up',
  description: 'Create your free Trope account and start automating workflows with living documentation and in-app guidance.',
}

import Link from 'next/link'
import AuthLogo from '../auth-logo'

type SignUpSearchParams = {
  error?: string
  requested?: string
}

const toSingle = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value

const parseBoolean = (value: string | undefined): boolean | undefined => {
  if (!value) return undefined
  const normalized = value.trim().toLowerCase()
  if (['1', 'true', 'yes', 'on'].includes(normalized)) return true
  if (['0', 'false', 'no', 'off'].includes(normalized)) return false
  return undefined
}

const isSelfSignupEnabled = () => {
  const stage =
    process.env.TROPE_STAGE ||
    process.env.NEXT_PUBLIC_TROPE_STAGE ||
    (process.env.NODE_ENV === 'production' ? 'prod' : 'dev')
  const override =
    parseBoolean(process.env.TROPE_SELF_SIGNUP_ENABLED) ??
    parseBoolean(process.env.NEXT_PUBLIC_TROPE_SELF_SIGNUP_ENABLED)
  return override ?? stage !== 'prod'
}

export default function SignUp({
  searchParams,
}: {
  searchParams?: SignUpSearchParams
}) {
  const selfSignupEnabled = isSelfSignupEnabled()
  const error = toSingle(searchParams?.error)
  const requested = toSingle(searchParams?.requested)

  return (
    <>
      {/* Page header */}
      <div className="max-w-3xl mx-auto text-center pb-8">
        <AuthLogo />
        <h1 className="text-2xl md:text-3xl font-medium text-slate-900">
          {selfSignupEnabled ? 'Create your free account' : 'Request access'}
        </h1>
        {!selfSignupEnabled && (
          <p className="mt-3 text-sm text-slate-600">
            Production access is invite-only. We&apos;ll follow up with next steps.
          </p>
        )}
      </div>

      {/* Form */}
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
                <label className="block text-sm text-slate-700 font-medium mb-1.5" htmlFor="company">Company</label>
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
                <label className="block text-sm text-slate-700 font-medium mb-1.5" htmlFor="full-name">Full Name</label>
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
                <label className="block text-sm text-slate-700 font-medium mb-1.5" htmlFor="email">Email</label>
                <input
                  id="email"
                  name="email"
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-slate-900 placeholder-slate-400 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition"
                  type="email"
                  placeholder="you@example.com"
                  required
                />
              </div>
              {selfSignupEnabled && (
                <div>
                  <label className="block text-sm text-slate-700 font-medium mb-1.5" htmlFor="password">Password</label>
                  <input
                    id="password"
                    name="password"
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-slate-900 placeholder-slate-400 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition"
                    type="password"
                    autoComplete="on"
                    required
                  />
                </div>
              )}
            </div>
            <div className="mt-6">
              <button className="w-full py-3 px-4 text-sm font-semibold text-white bg-[#1861C8] rounded-full hover:bg-[#2171d8] transition">
                {selfSignupEnabled ? 'Sign Up' : 'Request access'}
              </button>
            </div>
          </form>
        </div>

        <p className="text-center text-sm text-slate-600 mt-6">
          Already have an account?{' '}
          <Link className="font-medium text-slate-900 hover:underline" href="/signin">Sign in</Link>
        </p>
      </div>
    </>
  )
}

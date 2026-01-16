export const metadata = {
  title: 'Sign In',
  description: 'Sign in to your Trope account to access your workflows, documentation, and team workspace.',
}

export const dynamic = 'force-dynamic'

import Link from 'next/link'
import AuthLogo from '../auth-logo'

type SignInSearchParams = {
  error?: string
  next?: string
  client?: string
  redirect?: string
  state?: string
  platform?: string
  signup?: string
  reset?: string
  signed_out?: string
}

const toSingle = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value

export default function SignIn({
  searchParams,
}: {
  searchParams?: SignInSearchParams
}) {
  const error = toSingle(searchParams?.error)
  const client = toSingle(searchParams?.client) === 'desktop' ? 'desktop' : 'web'
  const redirect = toSingle(searchParams?.redirect) ?? ''
  const state = toSingle(searchParams?.state) ?? ''
  const platform = toSingle(searchParams?.platform) ?? ''
  const next = toSingle(searchParams?.next) ?? ''
  const signup = toSingle(searchParams?.signup)
  const reset = toSingle(searchParams?.reset)
  const signedOut = toSingle(searchParams?.signed_out)

  return (
    <>
      {/* Page header */}
      <div className="max-w-3xl mx-auto text-center pb-8">
        <AuthLogo />
        <h1 className="text-2xl md:text-3xl font-medium text-slate-900">Sign in to your account</h1>
        {client === 'desktop' && (
          <p className="mt-3 text-sm text-slate-600">
            Finish signing in to Trope Cloud and we&apos;ll return you to the app.
          </p>
        )}
      </div>

      {/* Form */}
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
                <label className="block text-sm text-slate-700 font-medium mb-1.5" htmlFor="email">Email</label>
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
                  <label className="block text-sm text-slate-700 font-medium mb-1.5" htmlFor="password">Password</label>
                  <Link className="text-sm font-medium text-[#1861C8] hover:text-[#1861C8]/80 transition" href="/reset-password">Forgot?</Link>
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
            {client === 'desktop' && (
              <>
                <input type="hidden" name="state" value={state} />
                <input type="hidden" name="redirect" value={redirect} />
                <input type="hidden" name="platform" value={platform} />
              </>
            )}
            {client !== 'desktop' && <input type="hidden" name="next" value={next} />}
            <div className="mt-6">
              <button className="w-full py-3 px-4 text-sm font-semibold text-white bg-[#1861C8] rounded-full hover:bg-[#2171d8] transition">
                Sign In
              </button>
            </div>
          </form>
        </div>

        <p className="text-center text-sm text-slate-600 mt-6">
          Don&apos;t have an account?{' '}
          <Link className="font-medium text-[#1861C8] hover:text-[#1861C8]/80" href="/signup">Sign up</Link>
        </p>
      </div>
    </>
  )
}

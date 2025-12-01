export const metadata = {
  title: 'Sign In',
  description: 'Sign in to your Trope account to access your workflows, documentation, and team workspace.',
}

import Link from 'next/link'
import AuthLogo from '../auth-logo'

export default function SignIn() {
  return (
    <>
      {/* Page header */}
      <div className="max-w-3xl mx-auto text-center pb-8">
        <AuthLogo />
        <h1 className="text-2xl md:text-3xl font-medium text-slate-900">Sign in to your account</h1>
      </div>

      {/* Form */}
      <div className="max-w-sm mx-auto">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <form>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-700 font-medium mb-1.5" htmlFor="email">Email</label>
                <input
                  id="email"
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
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:border-[#1861C8] focus:ring-1 focus:ring-[#1861C8] transition"
                  type="password"
                  autoComplete="on"
                  required
                />
              </div>
            </div>
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

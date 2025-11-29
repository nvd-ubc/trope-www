export const metadata = {
  title: 'Sign Up',
  description: 'Create your free Trope account and start automating workflows with living documentation and in-app guidance.',
}

import Link from 'next/link'
import AuthLogo from '../auth-logo'

export default function SignUp() {
  return (
    <>
      {/* Page header */}
      <div className="max-w-3xl mx-auto text-center pb-8">
        <AuthLogo />
        <h1 className="text-2xl md:text-3xl font-medium text-white">Create your free account</h1>
      </div>

      {/* Form */}
      <div className="max-w-sm mx-auto">
        <div className="bg-[#010329]/60 rounded-2xl border border-[#1861C8]/20 p-6 backdrop-blur-sm">
          <form>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-[#D7EEFC]/70 font-medium mb-1.5" htmlFor="company">Company</label>
                <input
                  id="company"
                  className="w-full px-4 py-2.5 rounded-lg border border-[#1861C8]/30 bg-[#000E2E] text-white placeholder-[#D7EEFC]/30 focus:border-[#61AFF9] focus:ring-1 focus:ring-[#61AFF9] transition"
                  type="text"
                  placeholder="Acme Inc."
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-[#D7EEFC]/70 font-medium mb-1.5" htmlFor="full-name">Full Name</label>
                <input
                  id="full-name"
                  className="w-full px-4 py-2.5 rounded-lg border border-[#1861C8]/30 bg-[#000E2E] text-white placeholder-[#D7EEFC]/30 focus:border-[#61AFF9] focus:ring-1 focus:ring-[#61AFF9] transition"
                  type="text"
                  placeholder="Mark Rossi"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-[#D7EEFC]/70 font-medium mb-1.5" htmlFor="email">Email</label>
                <input
                  id="email"
                  className="w-full px-4 py-2.5 rounded-lg border border-[#1861C8]/30 bg-[#000E2E] text-white placeholder-[#D7EEFC]/30 focus:border-[#61AFF9] focus:ring-1 focus:ring-[#61AFF9] transition"
                  type="email"
                  placeholder="you@example.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-[#D7EEFC]/70 font-medium mb-1.5" htmlFor="password">Password</label>
                <input
                  id="password"
                  className="w-full px-4 py-2.5 rounded-lg border border-[#1861C8]/30 bg-[#000E2E] text-white placeholder-[#D7EEFC]/30 focus:border-[#61AFF9] focus:ring-1 focus:ring-[#61AFF9] transition"
                  type="password"
                  autoComplete="on"
                  required
                />
              </div>
            </div>
            <div className="mt-6">
              <button className="w-full py-3 px-4 text-sm font-semibold text-white bg-[#1861C8] rounded-full hover:bg-[#2171d8] transition">
                Sign Up
              </button>
            </div>
          </form>
        </div>

        <p className="text-center text-sm text-[#D7EEFC]/50 mt-6">
          Already have an account?{' '}
          <Link className="font-medium text-[#61AFF9] hover:text-[#61AFF9]/80" href="/signin">Sign in</Link>
        </p>
      </div>
    </>
  )
}

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
        <h1 className="text-2xl md:text-3xl font-medium text-gray-900">Create your free account</h1>
      </div>

      {/* Form */}
      <div className="max-w-sm mx-auto">
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <form>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-700 font-medium mb-1.5" htmlFor="company">Company</label>
                <input
                  id="company"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-gray-900 placeholder-gray-400 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition"
                  type="text"
                  placeholder="Acme Inc."
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 font-medium mb-1.5" htmlFor="full-name">Full Name</label>
                <input
                  id="full-name"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-gray-900 placeholder-gray-400 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition"
                  type="text"
                  placeholder="Mark Rossi"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 font-medium mb-1.5" htmlFor="email">Email</label>
                <input
                  id="email"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-gray-900 placeholder-gray-400 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition"
                  type="email"
                  placeholder="you@example.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 font-medium mb-1.5" htmlFor="password">Password</label>
                <input
                  id="password"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-gray-900 placeholder-gray-400 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition"
                  type="password"
                  autoComplete="on"
                  required
                />
              </div>
            </div>
            <div className="mt-6">
              <button className="w-full py-3 px-4 text-sm font-medium text-white bg-gray-900 rounded-full hover:bg-gray-800 transition">
                Sign Up
              </button>
            </div>
          </form>
        </div>

        <p className="text-center text-sm text-gray-600 mt-6">
          Already have an account?{' '}
          <Link className="font-medium text-gray-900 hover:underline" href="/signin">Sign in</Link>
        </p>
      </div>
    </>
  )
}

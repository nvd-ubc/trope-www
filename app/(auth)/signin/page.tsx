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
      <div className="max-w-3xl mx-auto text-center pb-12">
        {/* Logo */}
        <AuthLogo />
        {/* Page title */}
        <h1 className="h2 bg-clip-text text-transparent bg-linear-to-r from-slate-200/60 via-slate-200 to-slate-200/60">Sign in to your account</h1>
      </div>

      {/* Form */}
      <div className="max-w-sm mx-auto">

        <form>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-slate-300 font-medium mb-1" htmlFor="email">Email</label>
              <input id="email" className="form-input w-full" type="email" required />
            </div>
            <div>
              <div className="flex justify-between">
                <label className="block text-sm text-slate-300 font-medium mb-1" htmlFor="password">Password</label>
                <Link className="text-sm font-medium text-purple-500 hover:text-purple-400 transition duration-150 ease-in-out ml-2" href="/reset-password">Forgot?</Link>
              </div>
              <input id="password" className="form-input w-full" type="password" autoComplete="on" required />
            </div>
          </div>
          <div className="mt-6">
            <button className="btn text-sm text-white bg-purple-500 hover:bg-purple-600 w-full shadow-xs group">
              Sign In <span className="tracking-normal text-purple-300 group-hover:translate-x-0.5 transition-transform duration-150 ease-in-out ml-1">-&gt;</span>
            </button>
          </div>
        </form>

      </div>
    </>
  )
}

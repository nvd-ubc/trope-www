'use client'

import Link from 'next/link'
import { useCsrfToken } from '@/lib/client/use-csrf-token'
import AuthLogo from '../auth-logo'

type RequestAccessFormProps = {
  error?: string
  requested?: string
}

export default function RequestAccessForm({ error, requested }: RequestAccessFormProps) {
  const { token: csrfToken, loading: csrfLoading, error: csrfError } = useCsrfToken()

  return (
    <>
      <div className="max-w-3xl mx-auto text-center pb-8">
        <AuthLogo />
        <h1 className="text-2xl md:text-3xl font-medium text-slate-900">Request access</h1>
        <p className="mt-3 text-sm text-slate-600">
          Trope is in closed beta for B2B teams. Tell us about your workflows and we&apos;ll follow up.
        </p>
      </div>

      <div className="max-w-sm mx-auto">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          {(error || requested || csrfError) && (
            <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
              {error && <p>{error}</p>}
              {!error && requested && <p>Request received. We&apos;ll be in touch soon.</p>}
              {!error && !requested && csrfError && <p>{csrfError}</p>}
            </div>
          )}
          <form action="/api/access-requests" method="post">
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
                <label className="block text-sm text-slate-700 font-medium mb-1.5" htmlFor="team-size">
                  Team size
                </label>
                <select
                  id="team-size"
                  name="team_size"
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-900 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition"
                  defaultValue=""
                  required
                >
                  <option value="" disabled>
                    Select team size
                  </option>
                  <option value="1-10">1-10</option>
                  <option value="11-50">11-50</option>
                  <option value="51-200">51-200</option>
                  <option value="201-1000">201-1000</option>
                  <option value="1000+">1000+</option>
                </select>
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
                  Work email
                </label>
                <input
                  id="email"
                  name="email"
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-slate-900 placeholder-slate-400 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition"
                  type="email"
                  placeholder="you@company.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-slate-700 font-medium mb-1.5" htmlFor="tools">
                  Primary tools
                </label>
                <input
                  id="tools"
                  name="tools"
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition"
                  type="text"
                  placeholder="Excel, NetSuite, Salesforce..."
                />
              </div>
              <div>
                <label className="block text-sm text-slate-700 font-medium mb-1.5" htmlFor="note">
                  Which workflows should we start with?
                </label>
                <textarea
                  id="note"
                  name="note"
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition"
                  rows={3}
                  placeholder="Onboarding, reconciliations, audits, customer updates…"
                />
              </div>
            </div>
            <input type="hidden" name="csrf_token" value={csrfToken} />
            <div className="mt-6">
              <button
                className="w-full py-3 px-4 text-sm font-semibold text-white bg-[#1861C8] rounded-full hover:bg-[#2171d8] transition disabled:cursor-not-allowed disabled:opacity-60"
                disabled={csrfLoading || !csrfToken}
              >
                Request access
              </button>
            </div>
          </form>
        </div>

        <div className="mt-6 space-y-2 text-center text-sm text-slate-600">
          <p>
            Already have an invite?{' '}
            <Link className="font-medium text-slate-900 hover:underline" href="/invite">
              Accept it here
            </Link>
          </p>
          <p>
            Already have an account?{' '}
            <Link className="font-medium text-slate-900 hover:underline" href="/signin">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </>
  )
}

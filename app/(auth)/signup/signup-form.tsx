'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useCsrfToken } from '@/lib/client/use-csrf-token'
import AuthLogo from '../auth-logo'

type InviteContext = {
  org_id: string
  org_name: string
  invite_id: string
  role: string
  invited_email_hint?: string | null
  invited_email?: string | null
}

type SignUpFormProps = {
  error?: string
  requested?: string
  nextPath?: string
  blocked?: boolean
  prefillEmail?: string
  invite?: InviteContext
}

export default function SignUpForm({
  error,
  requested,
  nextPath,
  blocked,
  prefillEmail,
  invite,
}: SignUpFormProps) {
  const { token: csrfToken, loading: csrfLoading } = useCsrfToken()
  const initialEmail = prefillEmail || invite?.invited_email || ''
  const [emailValue, setEmailValue] = useState(initialEmail)
  const [allowEmailEdit, setAllowEmailEdit] = useState(!invite?.invited_email)
  const emailLocked = Boolean(invite?.invited_email) && !allowEmailEdit

  const heading = invite?.org_name ? `You're invited to ${invite.org_name}` : 'Create your account'
  const subheading = invite?.org_name
    ? 'Sign up with the invited email to join the workspace.'
    : 'Create your account and start automating workflows.'

  return (
    <>
      <div className="max-w-3xl mx-auto text-center pb-8">
        <AuthLogo />
        <h1 className="text-2xl md:text-3xl font-medium text-slate-900">{heading}</h1>
        <p className="mt-3 text-sm text-slate-600">{subheading}</p>
        {invite?.invited_email && (
          <p className="mt-2 text-xs text-slate-500">Invited as {invite.invited_email}</p>
        )}
      </div>

      <div className="max-w-sm mx-auto">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          {(error || requested || blocked) && (
            <div className="mb-4 space-y-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
              {error && <p>{error}</p>}
              {!error && requested && <p>Request received. We&apos;ll be in touch soon.</p>}
              {!error && !requested && blocked && (
                <>
                  <p>This email isn&apos;t approved yet.</p>
                  <div className="flex flex-col gap-2 text-xs text-slate-600">
                    <Link className="font-medium text-[#1861C8]" href="/request-access">
                      Request access
                    </Link>
                    <span>Have an invite link? Open it to sign up with an approved email.</span>
                  </div>
                </>
              )}
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
                <div className="flex items-center justify-between">
                  <label className="block text-sm text-slate-700 font-medium mb-1.5" htmlFor="email">
                    Email
                  </label>
                  {emailLocked && (
                    <button
                      type="button"
                      className="text-xs font-medium text-slate-500 hover:text-slate-700"
                      onClick={() => setAllowEmailEdit(true)}
                    >
                      Use a different email
                    </button>
                  )}
                </div>
                <input
                  id="email"
                  name="email"
                  className={`w-full px-4 py-2.5 rounded-lg border text-slate-900 placeholder-slate-400 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition ${
                    emailLocked ? 'border-slate-200 bg-slate-50 text-slate-500' : 'border-slate-300'
                  }`}
                  type="email"
                  placeholder="you@example.com"
                  value={emailValue}
                  readOnly={emailLocked}
                  onChange={(event) => setEmailValue(event.target.value)}
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

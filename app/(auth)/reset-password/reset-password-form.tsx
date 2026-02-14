'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import AuthLogo from '../auth-logo'
import { useCsrfToken } from '@/lib/client/use-csrf-token'

type ResetStep = 'request' | 'confirm'
const RESEND_COOLDOWN_SECONDS = 30

type ResetPasswordFormProps = {
  error?: string
  sent?: string
  step: ResetStep
  initialEmail?: string
}

export default function ResetPasswordForm({
  error,
  sent,
  step: initialStep,
  initialEmail,
}: ResetPasswordFormProps) {
  const { token: csrfToken, loading: csrfLoading } = useCsrfToken()
  const [step, setStep] = useState<ResetStep>(initialStep)
  const [email, setEmail] = useState(initialEmail ?? '')
  const [cooldownEndsAt, setCooldownEndsAt] = useState<number>(0)
  const [now, setNow] = useState<number>(0)
  const hasInitialEmail = (initialEmail ?? '').trim().length > 0
  const hasEmail = email.trim().length > 0
  const isConfirmStep = step === 'confirm'
  const cooldownRemaining = Math.max(0, Math.ceil((cooldownEndsAt - now) / 1000))
  const resendDisabled = cooldownRemaining > 0 || !hasEmail || csrfLoading || !csrfToken

  useEffect(() => {
    setStep(initialStep)
  }, [initialStep])

  useEffect(() => {
    setEmail(initialEmail ?? '')
  }, [initialEmail])

  useEffect(() => {
    if (!sent) return
    setCooldownEndsAt(Date.now() + RESEND_COOLDOWN_SECONDS * 1000)
  }, [sent])

  useEffect(() => {
    setNow(Date.now())
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  return (
    <>
      <div className="max-w-3xl mx-auto text-center pb-8">
        <AuthLogo />
        <h1 className="text-2xl md:text-3xl font-medium text-slate-900">Reset your password</h1>
        <p className="mt-3 text-sm text-slate-600">
          {isConfirmStep
            ? 'Enter the verification code from your email and set a new password.'
            : "Enter your email and we'll send you a verification code."}
        </p>
      </div>

      <div className="max-w-sm mx-auto">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          {(error || sent) && (
            <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
              {error && <p>{error}</p>}
              {!error && sent && <p>Reset code sent. Check your email, then enter the code below.</p>}
            </div>
          )}
          {!isConfirmStep ? (
            <>
              <form action="/api/auth/reset-password" method="post">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-slate-700 font-medium mb-1.5" htmlFor="email-request">
                      Email
                    </label>
                    <input
                      id="email-request"
                      name="email"
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:border-[#1861C8] focus:ring-1 focus:ring-[#1861C8] transition"
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      required
                    />
                  </div>
                </div>
                <input type="hidden" name="mode" value="request" />
                <input type="hidden" name="step" value="request" />
                <input type="hidden" name="csrf_token" value={csrfToken} />
                <div className="mt-6">
                  <button
                    className="w-full py-3 px-4 text-sm font-semibold text-white bg-[#1861C8] rounded-full hover:bg-[#2171d8] transition disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={csrfLoading || !csrfToken}
                  >
                    Send verification code
                  </button>
                </div>
              </form>
              <div className="mt-4 text-right">
                <button
                  className="text-sm font-medium text-[#1861C8] hover:text-[#1861C8]/80 transition"
                  type="button"
                  onClick={() => setStep('confirm')}
                >
                  Already have a code? Continue
                </button>
              </div>
            </>
          ) : (
            <>
              <form action="/api/auth/reset-password" method="post">
                <div className="space-y-4">
                  {hasInitialEmail ? (
                    <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                      Code will be verified for <span className="font-medium text-slate-900">{email}</span>.
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm text-slate-700 font-medium mb-1.5" htmlFor="email-confirm">
                        Email
                      </label>
                      <input
                        id="email-confirm"
                        name="email"
                        className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:border-[#1861C8] focus:ring-1 focus:ring-[#1861C8] transition"
                        type="email"
                        autoComplete="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        required
                      />
                    </div>
                  )}
                  {hasInitialEmail && <input type="hidden" name="email" value={email} />}
                  <div>
                    <label className="block text-sm text-slate-700 font-medium mb-1.5" htmlFor="code-confirm">
                      Verification code
                    </label>
                    <input
                      id="code-confirm"
                      name="code"
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:border-[#1861C8] focus:ring-1 focus:ring-[#1861C8] transition"
                      type="text"
                      placeholder="123456"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-700 font-medium mb-1.5" htmlFor="new-password-confirm">
                      New password
                    </label>
                    <input
                      id="new-password-confirm"
                      name="new_password"
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:border-[#1861C8] focus:ring-1 focus:ring-[#1861C8] transition"
                      type="password"
                      autoComplete="new-password"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                  <div>
                    <label
                      className="block text-sm text-slate-700 font-medium mb-1.5"
                      htmlFor="confirm-new-password-confirm"
                    >
                      Confirm new password
                    </label>
                    <input
                      id="confirm-new-password-confirm"
                      name="confirm_new_password"
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:border-[#1861C8] focus:ring-1 focus:ring-[#1861C8] transition"
                      type="password"
                      autoComplete="new-password"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>
                <input type="hidden" name="mode" value="confirm" />
                <input type="hidden" name="step" value="confirm" />
                <input type="hidden" name="csrf_token" value={csrfToken} />
                <div className="mt-6">
                  <button
                    className="w-full py-3 px-4 text-sm font-semibold text-white bg-[#1861C8] rounded-full hover:bg-[#2171d8] transition disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={csrfLoading || !csrfToken}
                  >
                    Reset password
                  </button>
                </div>
              </form>
              <div className="mt-4 border-t border-slate-200 pt-4">
                <form action="/api/auth/reset-password" method="post">
                  <input type="hidden" name="email" value={email} />
                  <input type="hidden" name="mode" value="request" />
                  <input type="hidden" name="step" value="confirm" />
                  <input type="hidden" name="csrf_token" value={csrfToken} />
                  <button
                    className="w-full py-2.5 px-4 text-sm font-medium text-[#1861C8] border border-[#1861C8]/30 rounded-full hover:bg-[#1861C8]/5 transition disabled:cursor-not-allowed disabled:opacity-60"
                    type="submit"
                    disabled={resendDisabled}
                  >
                    {cooldownRemaining > 0
                      ? `Resend code in ${cooldownRemaining}s`
                      : 'Resend verification code'}
                  </button>
                </form>
                <button
                  className="mt-3 text-sm font-medium text-[#1861C8] hover:text-[#1861C8]/80 transition"
                  type="button"
                  onClick={() => setStep('request')}
                >
                  Use a different email
                </button>
              </div>
            </>
          )}
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

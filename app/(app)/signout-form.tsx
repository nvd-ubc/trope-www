'use client'

import { useCsrfToken } from '@/lib/client/use-csrf-token'

export default function SignOutForm() {
  const { token: csrfToken, loading: csrfLoading } = useCsrfToken()

  return (
    <form action="/api/auth/signout" method="post">
      <input type="hidden" name="csrf_token" value={csrfToken} />
      <button
        className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={csrfLoading || !csrfToken}
      >
        Sign out
      </button>
    </form>
  )
}

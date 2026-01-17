'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'

type Props = {
  callback: string
}

const allowedCallbackPrefixes = new Set([
  'trope://auth-callback',
  'trope://auth-callback/',
  'http://127.0.0.1:4378/auth-callback',
  'http://localhost:4378/auth-callback',
])

const normalizeCallback = (value: string): string | null => {
  try {
    const url = new URL(value)
    return `${url.protocol}//${url.host}${url.pathname}`
  } catch {
    return null
  }
}

export default function DesktopCompleteClient({ callback }: Props) {
  const [attempted, setAttempted] = useState(false)
  const searchParams = useSearchParams()
  const rawCallback = callback || searchParams.get('callback') || ''
  const normalized = rawCallback ? normalizeCallback(rawCallback) : null
  const resolvedCallback = normalized && allowedCallbackPrefixes.has(normalized) ? rawCallback : ''

  useEffect(() => {
    if (!resolvedCallback) return
    const timeout = window.setTimeout(() => {
      setAttempted(true)
      window.location.href = resolvedCallback
    }, 300)
    return () => window.clearTimeout(timeout)
  }, [resolvedCallback])

  if (!resolvedCallback) {
    return (
      <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
        Missing or invalid redirect details. Return to the Trope app and start sign-in again.
      </div>
    )
  }

  return (
    <div className="mt-6 space-y-4">
      <p className="text-sm text-slate-600">
        {attempted ? 'If nothing happens, click the button below.' : 'You’ll be sent back to the Trope app shortly.'}
      </p>

      <div className="flex flex-wrap items-center gap-3">
        <a
          className="inline-flex items-center justify-center rounded-full bg-[#1861C8] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#2171d8] transition"
          href={resolvedCallback}
        >
          Open Trope
        </a>
        <a className="text-sm font-medium text-slate-600 hover:text-slate-800 transition" href="/dashboard">
          Go to dashboard
        </a>
      </div>
    </div>
  )
}

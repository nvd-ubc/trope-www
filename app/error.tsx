'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { CONTACT_EMAIL } from '@/lib/constants'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-slate-50">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10" aria-hidden="true">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[400px] bg-[#1861C8]/10 rounded-full blur-[120px]" />
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
        <p className="text-[#1861C8] text-sm font-medium mb-5 tracking-wide uppercase">
          Something went wrong
        </p>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-slate-900 mb-5">
          Oops! An error occurred
        </h1>

        <p className="text-lg text-slate-600 mb-10 max-w-md mx-auto">
          We encountered an unexpected error. Please try again or contact support if the problem persists.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={reset}
            className="group inline-flex items-center justify-center px-7 py-3.5 text-base font-semibold text-white bg-[#1861C8] rounded-full hover:bg-[#2171d8] transition-all duration-200"
          >
            Try Again
            <svg
              className="ml-2 w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>
          <Link
            className="inline-flex items-center justify-center px-7 py-3.5 text-base font-semibold text-slate-700 border border-slate-300 rounded-full hover:border-slate-400 hover:text-slate-900 transition-all duration-200"
            href="/"
          >
            Go to Homepage
          </Link>
          <a
            className="inline-flex items-center justify-center px-7 py-3.5 text-base font-semibold text-slate-700 border border-slate-300 rounded-full hover:border-slate-400 hover:text-slate-900 transition-all duration-200"
            href={`mailto:${CONTACT_EMAIL}`}
          >
            Contact Support
          </a>
        </div>
      </div>
    </div>
  )
}

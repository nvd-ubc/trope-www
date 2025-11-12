'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import Particles from '@/components/particles'
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
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Particles animation */}
      <Particles className="absolute inset-0 -z-10" quantity={30} />

      {/* Radial gradient */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10" aria-hidden="true">
        <div className="absolute flex items-center justify-center top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/2 aspect-square">
          <div className="absolute inset-0 translate-z-0 bg-purple-500 rounded-full blur-[120px] opacity-30" />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
        <div className="mb-8">
          <div className="inline-flex font-medium bg-clip-text text-transparent bg-linear-to-r from-purple-500 to-purple-200 pb-3 text-lg">
            Something went wrong
          </div>
        </div>

        <h1 className="h1 bg-clip-text text-transparent bg-linear-to-r from-slate-200/60 via-slate-200 to-slate-200/60 pb-4">
          Oops! An error occurred
        </h1>

        <p className="text-lg text-slate-400 mb-8">
          We encountered an unexpected error. Please try again or contact support if the problem persists.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={reset}
            className="btn text-slate-900 bg-linear-to-r from-white/80 via-white to-white/80 hover:bg-white transition duration-150 ease-in-out group"
          >
            Try Again <span className="tracking-normal text-purple-500 group-hover:translate-x-0.5 transition-transform duration-150 ease-in-out ml-1">→</span>
          </button>
          <Link
            className="btn text-slate-200 hover:text-white bg-slate-900/25 hover:bg-slate-900/30 transition duration-150 ease-in-out"
            href="/"
          >
            Go to Homepage
          </Link>
          <a
            className="btn text-slate-200 hover:text-white bg-slate-900/25 hover:bg-slate-900/30 transition duration-150 ease-in-out"
            href={`mailto:${CONTACT_EMAIL}`}
          >
            Contact Support
          </a>
        </div>
      </div>
    </div>
  )
}

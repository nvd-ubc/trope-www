export const metadata = {
  title: 'Download - Trope',
  description: 'Download the Trope desktop app for macOS or Windows. Closed beta access required.',
}

import Link from 'next/link'
import { CONTACT_EMAIL, DOWNLOAD_MAC_URL, DOWNLOAD_WINDOWS_URL, SALES_CALL_URL } from '@/lib/constants'

export default function DownloadPage() {
  const macAvailable = Boolean(DOWNLOAD_MAC_URL)
  const windowsAvailable = Boolean(DOWNLOAD_WINDOWS_URL)
  const salesHref = SALES_CALL_URL || `mailto:${CONTACT_EMAIL}`

  return (
    <section className="bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="pt-28 pb-16 md:pt-36 md:pb-20">
          <div className="max-w-3xl">
            <p className="text-[#1861C8] text-sm font-medium mb-4 tracking-wide uppercase">Download</p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 mb-6">
              Trope desktop apps
            </h1>
            <p className="text-lg text-slate-600">
              Trope is currently in closed beta. Request access to receive installer links and onboarding support.
            </p>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-white p-6">
              <div className="flex items-center justify-between">
                <h2 className="inline-flex items-center gap-2 text-xl font-semibold text-slate-900">
                  <AppleIcon className="h-5 w-5 text-slate-900" />
                  <span>macOS</span>
                </h2>
                <span className="text-xs uppercase tracking-wide text-slate-400">Apple Silicon + Intel</span>
              </div>
              <p className="mt-3 text-sm text-slate-600">
                Capture workflows across desktop apps and web browsers with guided overlays.
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                {macAvailable ? (
                  <a
                    className="inline-flex items-center justify-center rounded-full bg-[#1861C8] px-5 py-2 text-sm font-semibold text-white hover:bg-[#2171d8]"
                    href={DOWNLOAD_MAC_URL}
                  >
                    Download for macOS
                  </a>
                ) : (
                  <Link
                    className="inline-flex items-center justify-center rounded-full bg-[#1861C8] px-5 py-2 text-sm font-semibold text-white hover:bg-[#2171d8]"
                    href="/request-access"
                  >
                    Request access
                  </Link>
                )}
                <Link className="inline-flex items-center text-sm font-medium text-slate-600 hover:text-slate-900" href="/get-started">
                  Installation help →
                </Link>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6">
              <div className="flex items-center justify-between">
                <h2 className="inline-flex items-center gap-2 text-xl font-semibold text-slate-900">
                  <WindowsIcon className="h-5 w-5 text-slate-900" />
                  <span>Windows</span>
                </h2>
                <span className="text-xs uppercase tracking-wide text-slate-400">Windows 11+</span>
              </div>
              <p className="mt-3 text-sm text-slate-600">
                Record, guide, and review desktop workflows with full run history.
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                {windowsAvailable ? (
                  <a
                    className="inline-flex items-center justify-center rounded-full bg-[#1861C8] px-5 py-2 text-sm font-semibold text-white hover:bg-[#2171d8]"
                    href={DOWNLOAD_WINDOWS_URL}
                  >
                    Download for Windows
                  </a>
                ) : (
                  <Link
                    className="inline-flex items-center justify-center rounded-full bg-[#1861C8] px-5 py-2 text-sm font-semibold text-white hover:bg-[#2171d8]"
                    href="/request-access"
                  >
                    Request access
                  </Link>
                )}
                <Link className="inline-flex items-center text-sm font-medium text-slate-600 hover:text-slate-900" href="/get-started">
                  Installation help →
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-10 rounded-3xl border border-slate-200 bg-white px-6 py-8 md:px-10">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-xl font-semibold text-slate-900">Need onboarding support?</h3>
                <p className="mt-2 text-sm text-slate-600">
                  We&apos;ll help IT admins and operators set up Trope and capture the first workflows.
                </p>
              </div>
              <a
                className="inline-flex items-center justify-center rounded-full bg-[#1861C8] px-5 py-2 text-sm font-semibold text-white hover:bg-[#2171d8]"
                href={salesHref}
              >
                Book a call
              </a>
            </div>
          </div>

          <div className="mt-6 text-sm text-slate-500">
            Already have an invite? <Link className="text-[#1861C8]" href="/signin">Sign in</Link> to download from your workspace.
          </div>
        </div>
      </div>
    </section>
  )
}

function AppleIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M16.5 13.4c-.02-2.2 1.8-3.3 1.88-3.36-1.03-1.5-2.63-1.7-3.19-1.72-1.35-.14-2.64.8-3.33.8-.7 0-1.77-.78-2.92-.76-1.5.02-2.9.88-3.67 2.24-1.57 2.72-.4 6.76 1.12 8.96.75 1.08 1.63 2.3 2.8 2.26 1.12-.04 1.55-.73 2.91-.73 1.35 0 1.74.73 2.93.71 1.2-.02 1.96-1.09 2.7-2.18.86-1.26 1.22-2.48 1.24-2.54-.03-.01-2.37-.91-2.39-3.64Z" />
      <path d="M14.3 4.2c.62-.76 1.04-1.82.93-2.88-.9.04-1.99.6-2.63 1.36-.58.67-1.08 1.77-.94 2.81 1 .08 2-.5 2.64-1.29Z" />
    </svg>
  )
}

function WindowsIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M3 4h8v8H3V4Z" />
      <path d="M13 4h8v8h-8V4Z" />
      <path d="M3 14h8v8H3v-8Z" />
      <path d="M13 14h8v8h-8v-8Z" />
    </svg>
  )
}

export const metadata = {
  title: 'Get Started - Trope',
  description: 'Request access, book a demo, or sign in to begin guided workflow pilots with Trope.',
}

import Link from 'next/link'
import { CONTACT_EMAIL, SALES_CALL_URL } from '@/lib/constants'

export default function GetStartedPage() {
  const salesHref = SALES_CALL_URL || `mailto:${CONTACT_EMAIL}`

  return (
    <section className="bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="pt-28 pb-16 md:pt-36 md:pb-20">
          <div className="max-w-3xl">
            <p className="text-[#1861C8] text-sm font-medium mb-4 tracking-wide uppercase">Get started</p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 mb-6">
              Launch a guided workflow pilot
            </h1>
            <p className="text-lg text-slate-600">
              Trope is in closed beta for operations teams. We&apos;ll help you capture a pilot workflow, onboard operators, and
              measure impact quickly.
            </p>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
              <div className="text-xs uppercase tracking-wide text-slate-400">Step 1</div>
              <h2 className="mt-3 text-xl font-semibold text-slate-900">Request access</h2>
              <p className="mt-2 text-sm text-slate-600">
                Tell us about your workflows and team size. We&apos;ll confirm fit and share access details.
              </p>
              <Link
                className="mt-4 inline-flex items-center text-sm font-medium text-[#1861C8] hover:text-[#2171d8]"
                href="/request-access"
              >
                Request access →
              </Link>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
              <div className="text-xs uppercase tracking-wide text-slate-400">Step 2</div>
              <h2 className="mt-3 text-xl font-semibold text-slate-900">Accept your invite</h2>
              <p className="mt-2 text-sm text-slate-600">
                Invite-only access keeps pilots focused. Accept your invite to join a workspace.
              </p>
              <Link
                className="mt-4 inline-flex items-center text-sm font-medium text-[#1861C8] hover:text-[#2171d8]"
                href="/invite"
              >
                Use invite link →
              </Link>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
              <div className="text-xs uppercase tracking-wide text-slate-400">Step 3</div>
              <h2 className="mt-3 text-xl font-semibold text-slate-900">Download the desktop app</h2>
              <p className="mt-2 text-sm text-slate-600">
                Capture workflows where the work happens: desktop apps, browsers, and legacy systems.
              </p>
              <Link
                className="mt-4 inline-flex items-center text-sm font-medium text-[#1861C8] hover:text-[#2171d8]"
                href="/download"
              >
                Download Trope →
              </Link>
            </div>
          </div>

          <div className="mt-12 rounded-3xl border border-slate-200 bg-white px-6 py-8 md:px-10">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-xl font-semibold text-slate-900">Want a live walkthrough?</h3>
                <p className="mt-2 text-sm text-slate-600">
                  We&apos;ll review your workflows, propose a pilot, and share a timeline for rollout.
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
            Already have access? <Link className="text-[#1861C8]" href="/signin">Sign in</Link> to your workspace.
          </div>
        </div>
      </div>
    </section>
  )
}

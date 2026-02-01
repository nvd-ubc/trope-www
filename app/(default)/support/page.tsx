export const metadata = {
  title: 'Support - Trope',
  description: 'Get help with Trope onboarding, workflow capture, and guidance.',
}

import Link from 'next/link'
import { SUPPORT_EMAIL } from '@/lib/constants'

export default function SupportPage() {
  return (
    <section className="bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="pt-28 pb-16 md:pt-36 md:pb-20">
          <div className="max-w-3xl">
            <p className="text-[#1861C8] text-sm font-medium mb-4 tracking-wide uppercase">Support</p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 mb-6">
              We&apos;re here to help your team succeed
            </h1>
            <p className="text-lg text-slate-600">
              Get onboarding guidance, workflow troubleshooting, and deployment support from the Trope team.
            </p>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
              <h2 className="text-lg font-semibold text-slate-900">Support inbox</h2>
              <p className="mt-2 text-sm text-slate-600">
                Email us for help with installs, capture sessions, and workspace access.
              </p>
              <a
                className="mt-4 inline-flex items-center text-sm font-medium text-[#1861C8] hover:text-[#2171d8]"
                href={`mailto:${SUPPORT_EMAIL}`}
              >
                {SUPPORT_EMAIL} →
              </a>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
              <h2 className="text-lg font-semibold text-slate-900">Documentation</h2>
              <p className="mt-2 text-sm text-slate-600">
                Browse the docs for capture best practices, guidance setup, and sharing workflows.
              </p>
              <Link className="mt-4 inline-flex items-center text-sm font-medium text-[#1861C8]" href="/docs">
                Read the docs →
              </Link>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
              <h2 className="text-lg font-semibold text-slate-900">Status updates</h2>
              <p className="mt-2 text-sm text-slate-600">
                See availability updates for Trope Cloud and the desktop apps.
              </p>
              <Link className="mt-4 inline-flex items-center text-sm font-medium text-[#1861C8]" href="/status">
                View status →
              </Link>
            </div>
          </div>

          <div className="mt-12 rounded-3xl border border-slate-200 bg-white px-6 py-8 md:px-10">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-xl font-semibold text-slate-900">Need rollout help?</h3>
                <p className="mt-2 text-sm text-slate-600">
                  We can join your onboarding sessions and help map workflows with your SMEs.
                </p>
              </div>
              <Link
                className="inline-flex items-center justify-center rounded-full bg-[#1861C8] px-5 py-2 text-sm font-semibold text-white hover:bg-[#2171d8]"
                href="/get-started"
              >
                Schedule onboarding
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

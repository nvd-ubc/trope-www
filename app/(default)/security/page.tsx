export const metadata = {
  title: 'Security - Trope',
  description:
    'Learn how Trope separates on-device capture from cloud processing and keeps workflow access controlled.',
}

import Link from 'next/link'
import { SECURITY_EMAIL } from '@/lib/constants'

export default function SecurityPage() {
  return (
    <section className="bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="pt-28 pb-16 md:pt-36 md:pb-20">
          <div className="max-w-3xl">
            <p className="text-[#1861C8] text-sm font-medium mb-4 tracking-wide uppercase">Security</p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 mb-6">
              Built for trusted, controlled workflows
            </h1>
            <p className="text-lg text-slate-600">
              Trope is designed to keep desktop capture explicit and cloud access scoped to workspaces. We focus on
              transparency, permissioned access, and auditability.
            </p>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            <div className="rounded-3xl border border-slate-200 bg-white p-6">
              <h2 className="text-lg font-semibold text-slate-900">Permissioned capture</h2>
              <p className="mt-2 text-sm text-slate-600">
                The desktop agent only captures what a user authorizes. Capabilities are explicitly granted and can be
                reviewed by admins.
              </p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-6">
              <h2 className="text-lg font-semibold text-slate-900">Cloud isolation</h2>
              <p className="mt-2 text-sm text-slate-600">
                Workflow artifacts and guidance live in Trope Cloud, scoped to your workspace with invite-based access
                controls.
              </p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-6">
              <h2 className="text-lg font-semibold text-slate-900">Auditability</h2>
              <p className="mt-2 text-sm text-slate-600">
                Every workflow run produces structured logs so teams can review usage, outcomes, and compliance needs.
              </p>
            </div>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-white p-6">
              <h3 className="text-lg font-semibold text-slate-900">Data handling highlights</h3>
              <ul className="mt-4 space-y-3 text-sm text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#1861C8]" />
                  <span>Workflow capture runs locally on the desktop app and agent.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#1861C8]" />
                  <span>Artifacts are uploaded to Trope Cloud for processing and guidance generation.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#1861C8]" />
                  <span>Workspace membership and invites control who can access workflows.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#1861C8]" />
                  <span>Shared workflow links can be scoped and time-bound.</span>
                </li>
              </ul>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6">
              <h3 className="text-lg font-semibold text-slate-900">Operational controls</h3>
              <ul className="mt-4 space-y-3 text-sm text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#1861C8]" />
                  <span>Workspace admin roles to manage access and invites.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#1861C8]" />
                  <span>Run history for auditing, QA, and compliance reviews.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#1861C8]" />
                  <span>Workflow ownership and review cadences for critical processes.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#1861C8]" />
                  <span>Clear separation between capture, guidance, and automation actions.</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 rounded-3xl border border-slate-200 bg-white px-6 py-8 md:px-10">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-xl font-semibold text-slate-900">Have security questions?</h3>
                <p className="mt-2 text-sm text-slate-600">
                  We can share architecture details, data flow diagrams, and pilot security reviews.
                </p>
              </div>
              <a
                className="inline-flex items-center justify-center rounded-full bg-[#1861C8] px-5 py-2 text-sm font-semibold text-white hover:bg-[#2171d8]"
                href={`mailto:${SECURITY_EMAIL}`}
              >
                Contact security
              </a>
            </div>
            <div className="mt-4 text-xs text-slate-500">
              Prefer a high-level overview? See our <Link className="text-[#1861C8]" href="/resources/security-overview">Security brief</Link>.
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

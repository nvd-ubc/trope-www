export const metadata = {
  title: 'Docs - Trope',
  description: 'Documentation for capturing workflows, running guides, and managing workspaces in Trope.',
}

import Link from 'next/link'

export default function DocsPage() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white via-slate-50 to-slate-50">
      <div className="pointer-events-none absolute -top-16 right-0 h-[320px] w-[320px] rounded-full bg-[#1861C8]/10 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-[260px] w-[260px] rounded-full bg-slate-200/70 blur-[120px]" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
        <div className="pt-28 pb-16 md:pt-36 md:pb-20">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#1861C8]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#1861C8]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#1861C8]" />
              Docs
            </span>
            <h1 className="mt-4 text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 mb-6">
              Documentation is under construction
            </h1>
            <p className="text-lg text-slate-600">
              We&apos;re assembling a comprehensive guide for enterprise rollouts, governance, and workflow scale.
              Early access is available for pilot partners.
            </p>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_18px_50px_-40px_rgba(15,23,42,0.4)]">
              <h2 className="text-xl font-semibold text-slate-900">What&apos;s coming</h2>
              <p className="mt-2 text-sm text-slate-600">
                We&apos;re prioritizing the highest-leverage guidance for teams rolling Trope out across complex desktops.
              </p>
              <ul className="mt-6 grid gap-3 text-sm text-slate-600">
                {[
                  'Installation + desktop permissions (macOS + Windows)',
                  'Capture best practices for multi-app workflows',
                  'Publishing standards, approvals, and governance',
                  'Run monitoring, QA, and audit readiness',
                  'Security, data boundaries, and compliance expectations',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-1.5 h-2 w-2 rounded-full bg-[#1861C8]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-white to-[#F1F6FF] p-8 shadow-[0_20px_45px_-35px_rgba(24,97,200,0.5)]">
              <h2 className="text-xl font-semibold text-slate-900">Need guidance now?</h2>
              <p className="mt-2 text-sm text-slate-600">
                We&apos;ll share pilot documentation, checklists, and workflows tailored to your team.
              </p>
              <div className="mt-6 flex flex-col gap-3">
                <Link
                  className="inline-flex items-center justify-center rounded-full bg-[#1861C8] px-5 py-2 text-sm font-semibold text-white hover:bg-[#2171d8]"
                  href="/request-access"
                >
                  Request early access
                </Link>
                <Link
                  className="inline-flex items-center justify-center rounded-full border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-600 hover:border-slate-300"
                  href="/support"
                >
                  Contact support
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

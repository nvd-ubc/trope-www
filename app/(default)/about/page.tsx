export const metadata = {
  title: 'About Trope',
  description: 'Learn how Trope helps teams turn brittle workflows into reliable, guided operations.',
}

export default function About() {
  return (
    <div className="bg-white">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#F8FAFC] via-white to-white" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
          <div className="pt-28 pb-16 md:pt-36 md:pb-20">
            <div className="max-w-3xl">
              <p className="text-[#1861C8] text-sm font-medium tracking-wide uppercase mb-4">
                About Trope
              </p>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 leading-tight">
                We help teams turn brittle workflows into reliable, guided operations.
              </h1>
              <p className="mt-5 text-base md:text-lg text-slate-600">
                Trope is built for the messy, high-stakes work that happens inside desktop apps and
                legacy systems. We make it easy to capture what experts do once, then guide every
                teammate through the same workflow with confidence.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20 border-t border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <h2 className="text-2xl md:text-3xl font-semibold text-slate-900">
                Why we exist
              </h2>
              <p className="mt-4 text-slate-600 leading-relaxed">
                Every team has workflows that are critical but fragile: month-end close, onboarding,
                audits, claims processing, reconciliation, and more. The best knowledge lives in
                people&apos;s heads, and the cost of mistakes is high. Trope captures that expertise
                and turns it into living guides that evolve as software changes.
              </p>
              <p className="mt-4 text-slate-600 leading-relaxed">
                We believe operational excellence is a competitive advantage, and that the tools
                used by operations teams deserve the same innovation as developer tooling.
              </p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
              <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">
                What we optimize for
              </h3>
              <ul className="mt-4 space-y-3 text-sm text-slate-600">
                <li className="flex items-start gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-[#1861C8]" />
                  Reliability over hype. Guides must keep working as apps change.
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-[#1861C8]" />
                  Desktop-first. We meet teams inside the software they already use.
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-[#1861C8]" />
                  Governance by default. Ownership, audit, and compliance are core.
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-[#1861C8]" />
                  Human-in-the-loop. We guide, validate, and reduce risk.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20 border-t border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <h3 className="text-lg font-semibold text-slate-900">Built for teams</h3>
              <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                Trope is a B2B platform with workspaces, roles, audit trails, and operational
                reporting so leaders can scale knowledge across the org.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <h3 className="text-lg font-semibold text-slate-900">Desktop + cloud</h3>
              <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                Capture and run workflows on macOS and Windows. Manage governance and visibility in
                the cloud dashboard.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <h3 className="text-lg font-semibold text-slate-900">Partner-led pilots</h3>
              <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                We run targeted pilots with teams who have high-volume, high-cost workflows. If
                you&apos;re exploring a pilot, we&apos;ll build the rollout plan together.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

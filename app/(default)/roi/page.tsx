export const metadata = {
  title: 'ROI Calculator - Trope',
  description: 'Estimate the impact of guided workflows on training time, rework, and operational cost.',
}

import Link from 'next/link'
import RoiCalculator from './roi-calculator'

export default function RoiPage() {
  return (
    <section className="bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="pt-28 pb-16 md:pt-36 md:pb-20">
          <div className="max-w-3xl">
            <p className="text-[#1861C8] text-sm font-medium mb-4 tracking-wide uppercase">ROI calculator</p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 mb-6">
              Model the impact of guided workflows
            </h1>
            <p className="text-lg text-slate-600">
              Use this quick model to estimate how much time and cost you can save by turning tribal knowledge into
              repeatable, guided workflows.
            </p>
          </div>

          <div className="mt-12">
            <RoiCalculator />
          </div>

          <div className="mt-12">
            <div className="max-w-3xl">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Long-term impact beyond cost savings</h2>
              <p className="mt-3 text-base text-slate-600">
                ROI compounds when workflows stay consistent, knowledge stays in the system, and changes roll out without
                disruption.
              </p>
            </div>
            <div className="mt-8 grid gap-6 lg:grid-cols-3">
              <div className="rounded-3xl border border-slate-200 bg-white p-6">
                <p className="text-xs uppercase tracking-wide text-slate-400">Institutional memory</p>
                <h3 className="mt-3 text-lg font-semibold text-slate-900">SOPs codified and preserved</h3>
                <p className="mt-2 text-sm text-slate-600">
                  Keep critical workflows documented in context so departures don&apos;t erase hard-won expertise.
                </p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white p-6">
                <p className="text-xs uppercase tracking-wide text-slate-400">Change management</p>
                <h3 className="mt-3 text-lg font-semibold text-slate-900">Faster rollouts, fewer regressions</h3>
                <p className="mt-2 text-sm text-slate-600">
                  When tools or policies shift, update a workflow once and push a verified path to every operator.
                </p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white p-6">
                <p className="text-xs uppercase tracking-wide text-slate-400">Operational resilience</p>
                <h3 className="mt-3 text-lg font-semibold text-slate-900">Audit-ready, consistent execution</h3>
                <p className="mt-2 text-sm text-slate-600">
                  Build a reliable run history to support compliance, coaching, and cross-team accountability.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-12 rounded-3xl border border-slate-200 bg-white px-6 py-8 md:px-10">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-xl font-semibold text-slate-900">Need a tailored ROI model?</h3>
                <p className="mt-2 text-sm text-slate-600">
                  We can help you size a pilot and track the metrics that matter most to your team.
                </p>
              </div>
              <Link
                className="inline-flex items-center justify-center rounded-full bg-[#1861C8] px-5 py-2 text-sm font-semibold text-white hover:bg-[#2171d8]"
                href="/get-started"
              >
                Talk to us
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

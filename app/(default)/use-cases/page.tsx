export const metadata = {
  title: 'Use Cases - Trope',
  description:
    'Explore how Trope helps finance, IT, customer success, compliance, and operations teams capture and scale critical desktop workflows.',
}

import Link from 'next/link'
import { USE_CASES } from '@/lib/marketing-content'

export default function UseCasesPage() {
  return (
    <section className="bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="pt-28 pb-16 md:pt-36 md:pb-20">
          <div className="max-w-3xl">
            <p className="text-[#1861C8] text-sm font-medium mb-4 tracking-wide uppercase">Use cases</p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 mb-6">
              Workflow guidance for teams that run the business
            </h1>
            <p className="text-lg text-slate-600">
              Trope works where your team works—desktop apps, web tools, and legacy systems. Pick a use case to see how
              guided workflows reduce ramp time, errors, and rework across every department.
            </p>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            {USE_CASES.map((useCase) => (
              <div
                key={useCase.slug}
                className="group flex h-full flex-col bg-white rounded-3xl border border-slate-200 p-6 shadow-sm transition hover:border-slate-300"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">
                      <Link className="group-hover:text-[#1861C8]" href={`/use-cases/${useCase.slug}`}>
                        {useCase.title}
                      </Link>
                    </h2>
                    <p className="mt-2 text-sm text-slate-600">{useCase.summary}</p>
                  </div>
                  <span className="text-xs uppercase tracking-wide text-slate-400">{useCase.category}</span>
                </div>

                <div className="mt-5 flex-1">
                  <p className="text-xs uppercase tracking-wide text-slate-400">Outcomes</p>
                  <ul className="mt-3 space-y-2 text-sm text-slate-600">
                    {useCase.outcomes.map((outcome) => (
                      <li key={outcome} className="flex items-start gap-2">
                        <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#1861C8]" />
                        <span>{outcome}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6 flex items-center justify-between">
                  <Link className="text-sm font-medium text-[#1861C8]" href={`/use-cases/${useCase.slug}`}>
                    View workflow examples →
                  </Link>
                  <span className="text-xs text-slate-500 group-hover:text-slate-700">Pilot ready</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-14 rounded-3xl border border-slate-200 bg-white px-6 py-8 md:px-10">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-xl font-semibold text-slate-900">Have a different workflow?</h3>
                <p className="mt-2 text-sm text-slate-600">
                  We&apos;ll map Trope to your critical paths and build a pilot that proves value fast.
                </p>
              </div>
              <Link
                className="inline-flex items-center justify-center rounded-full bg-[#1861C8] px-5 py-2 text-sm font-semibold text-white hover:bg-[#2171d8]"
                href="/request-access"
              >
                Request access
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

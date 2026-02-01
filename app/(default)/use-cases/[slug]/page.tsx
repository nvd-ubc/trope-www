import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { USE_CASES } from '@/lib/marketing-content'

type Params = {
  slug: string
}

export async function generateStaticParams() {
  return USE_CASES.map((useCase) => ({ slug: useCase.slug }))
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params
  const useCase = USE_CASES.find((item) => item.slug === slug)
  if (!useCase) {
    return {
      title: 'Use case - Trope',
      description: 'Explore how Trope helps teams scale workflow guidance.',
    }
  }

  return {
    title: `${useCase.title} - Trope`,
    description: useCase.summary,
  }
}

export default async function UseCaseDetail({ params }: { params: Promise<Params> }) {
  const { slug } = await params
  const useCase = USE_CASES.find((item) => item.slug === slug)
  if (!useCase) {
    notFound()
  }
  const workflowCount = useCase.workflows.length
  const stepCount = useCase.workflows.reduce((total, workflow) => total + workflow.steps.length, 0)
  const systemCount = new Set(useCase.workflows.flatMap((workflow) => workflow.systems)).size

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 via-slate-50 to-white">
      <div className="pointer-events-none absolute -top-24 right-0 h-[380px] w-[380px] rounded-full bg-[#1861C8]/10 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-[320px] w-[320px] rounded-full bg-slate-200/60 blur-[120px]" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
        <div className="pt-28 pb-16 md:pt-36 md:pb-20">
          <Link className="text-sm text-slate-500 hover:text-slate-700" href="/use-cases">
            ← Back to use cases
          </Link>

          <div className="mt-6 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-[#1861C8]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#1861C8]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#1861C8]" />
                Use case
              </span>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 mb-5">{useCase.title}</h1>
              <p className="text-lg text-slate-700">{useCase.hero}</p>
              <p className="mt-4 text-base text-slate-600">{useCase.summary}</p>
            </div>

            <div className="rounded-3xl bg-gradient-to-br from-[#E6F0FF] via-white to-white p-[1px] shadow-[0_24px_60px_-40px_rgba(24,97,200,0.6)]">
              <div className="rounded-[22px] bg-white p-6">
                <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-slate-400">
                  <span className="h-2 w-2 rounded-full bg-[#1861C8]/60" />
                  Outcomes
                </div>
                <ul className="mt-4 space-y-3 text-sm text-slate-700">
                  {useCase.outcomes.map((outcome) => (
                    <li key={outcome} className="flex items-start gap-2">
                      <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#1861C8]" />
                      <span>{outcome}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-10 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="space-y-6 lg:sticky lg:top-28 h-fit">
              <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-white to-[#F4F7FF] p-6 shadow-[0_16px_40px_-32px_rgba(15,23,42,0.5)]">
                <p className="text-xs uppercase tracking-wide text-slate-400">Metrics to watch</p>
                <h2 className="mt-2 text-lg font-semibold text-slate-900">Pilot validation signals</h2>
                <p className="mt-2 text-sm text-slate-600">
                  Use these signals to validate your pilot and prioritize what to scale next.
                </p>
                <ul className="mt-4 space-y-3 text-sm text-slate-700">
                  {useCase.metrics.map((metric) => (
                    <li key={metric} className="flex items-start gap-2">
                      <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#1861C8]" />
                      <span>{metric}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_18px_50px_-40px_rgba(15,23,42,0.4)]">
                <p className="text-xs uppercase tracking-wide text-slate-400">Coverage snapshot</p>
                <h2 className="mt-2 text-lg font-semibold text-slate-900">Workflow scope</h2>
                <div className="mt-4 grid gap-3">
                  {[
                    { label: 'Example workflows', value: workflowCount },
                    { label: 'Steps captured', value: stepCount },
                    { label: 'Tools involved', value: systemCount },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                      <span className="text-sm text-slate-600">{item.label}</span>
                      <span className="text-lg font-semibold text-slate-900">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-slate-900">Example workflows</h2>
              <p className="mt-2 text-sm text-slate-600">
                Detailed, cross-application steps that show how Trope guides real operators.
              </p>
              <div className="mt-6 grid gap-6">
                {useCase.workflows.map((workflow) => (
                  <div key={workflow.title} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_18px_50px_-38px_rgba(15,23,42,0.45)]">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h3 className="text-base font-semibold text-slate-900">{workflow.title}</h3>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {workflow.systems.map((system) => (
                            <span
                              key={system}
                              className="inline-flex items-center rounded-full border border-[#D6E4FF] bg-[#F1F6FF] px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#1D4ED8]"
                            >
                              {system}
                            </span>
                          ))}
                        </div>
                      </div>
                      <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                        {workflow.steps.length} steps
                      </span>
                    </div>
                    <ol className="mt-5 space-y-4 border-l border-slate-200/70 pl-6 text-sm text-slate-600">
                      {workflow.steps.map((step, index) => (
                        <li key={`${workflow.title}-${index}`} className="relative flex gap-3">
                          <span className="absolute -left-3 top-0 flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white text-[11px] font-semibold text-slate-600 tabular-nums shadow-sm">
                            {index + 1}
                          </span>
                          <span className="pl-4">{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-12 rounded-3xl border border-slate-200 bg-gradient-to-br from-white to-[#F1F6FF] px-6 py-8 md:px-10 shadow-[0_20px_45px_-35px_rgba(24,97,200,0.5)]">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-xl font-semibold text-slate-900">Launch a pilot for this workflow</h3>
                <p className="mt-2 text-sm text-slate-600">
                  We&apos;ll help capture your first workflow and prove value in weeks, not months.
                </p>
              </div>
              <Link
                className="inline-flex items-center justify-center rounded-full bg-[#1861C8] px-5 py-2 text-sm font-semibold text-white hover:bg-[#2171d8]"
                href="/get-started"
              >
                Get started
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

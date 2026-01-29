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

  return (
    <section className="bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="pt-28 pb-16 md:pt-36 md:pb-20">
          <Link className="text-sm text-slate-500 hover:text-slate-700" href="/use-cases">
            ← Back to use cases
          </Link>

          <div className="mt-6 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <p className="text-[#1861C8] text-sm font-medium mb-4 tracking-wide uppercase">Use case</p>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 mb-5">{useCase.title}</h1>
              <p className="text-lg text-slate-600">{useCase.hero}</p>
              <p className="mt-4 text-base text-slate-600">{useCase.summary}</p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6">
              <div className="text-xs uppercase tracking-wide text-slate-400">Outcomes</div>
              <ul className="mt-4 space-y-3 text-sm text-slate-600">
                {useCase.outcomes.map((outcome) => (
                  <li key={outcome} className="flex items-start gap-2">
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#1861C8]" />
                    <span>{outcome}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 h-fit">
              <h2 className="text-lg font-semibold text-slate-900">Metrics to watch</h2>
              <p className="mt-2 text-sm text-slate-600">
                Use these signals to validate your pilot and prioritize what to scale next.
              </p>
              <ul className="mt-4 space-y-2 text-sm text-slate-600">
                {useCase.metrics.map((metric) => (
                  <li key={metric} className="flex items-start gap-2">
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-slate-300" />
                    <span>{metric}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-slate-900">Example workflows</h2>
              <p className="mt-2 text-sm text-slate-600">
                Detailed, cross-application steps that show how Trope guides real operators.
              </p>
              <div className="mt-6 grid gap-6">
                {useCase.workflows.map((workflow) => (
                  <div key={workflow.title} className="rounded-3xl border border-slate-200 bg-white p-6">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h3 className="text-base font-semibold text-slate-900">{workflow.title}</h3>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {workflow.systems.map((system) => (
                            <span
                              key={system}
                              className="inline-flex items-center rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-500"
                            >
                              {system}
                            </span>
                          ))}
                        </div>
                      </div>
                      <span className="text-xs uppercase tracking-wide text-slate-400">
                        {workflow.steps.length} steps
                      </span>
                    </div>
                    <ol className="mt-5 space-y-3 text-sm text-slate-600">
                      {workflow.steps.map((step, index) => (
                        <li key={`${workflow.title}-${index}`} className="flex gap-3">
                          <span className="w-7 text-xs font-semibold text-slate-400 tabular-nums">
                            {String(index + 1).padStart(2, '0')}
                          </span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-12 rounded-3xl border border-slate-200 bg-white px-6 py-8 md:px-10">
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

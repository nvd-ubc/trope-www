export const metadata = {
  title: 'Use Cases - Trope',
  description:
    'Explore how Trope helps finance, IT, healthcare, nonprofit, and operations teams capture and scale critical desktop workflows.',
}

import Link from 'next/link'
import AnimateIn, { Stagger } from '@/components/animate-in'
import { USE_CASES } from '@/lib/marketing-content'

export default function UseCasesPage() {
  return (
    <section className="relative overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 120% 70% at 10% 0%, rgba(97, 175, 249, 0.18), transparent 55%),
            radial-gradient(ellipse 120% 70% at 90% 70%, rgba(24, 97, 200, 0.10), transparent 60%),
            linear-gradient(180deg, #F8FAFC 0%, #F1F5F9 100%)
          `,
        }}
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage: 'radial-gradient(rgba(24, 97, 200, 0.55) 0.8px, transparent 0.8px)',
          backgroundSize: '28px 28px',
        }}
        aria-hidden="true"
      />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
        <div className="pt-28 pb-16 md:pt-36 md:pb-20">
          <div className="max-w-3xl">
            <AnimateIn>
              <p className="text-[#1861C8] text-sm font-medium mb-4 tracking-wide uppercase">Use cases</p>
            </AnimateIn>
            <AnimateIn delay={90}>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 mb-6">
                Workflow guidance for teams that run the business
              </h1>
            </AnimateIn>
            <AnimateIn delay={180}>
              <p className="text-lg text-slate-600">
                Trope works in the real mix of systems your team already uses. Explore each use case to see how guided workflows
                reduce ramp time, errors, and rework across desktop and web tools.
              </p>
            </AnimateIn>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            <Stagger staggerDelay={90} baseDelay={100} duration={520} animation="fade-up">
              {USE_CASES.map((useCase) => (
                <div
                  key={useCase.slug}
                  className="group relative flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-md will-change-transform"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#1861C8]/10 ring-1 ring-[#1861C8]/15 text-[#1861C8]">
                      {getUseCaseIcon(useCase.category)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-xs uppercase tracking-wide text-slate-400">{useCase.category}</p>
                        <span className="hidden sm:inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">
                          {useCase.workflows.length} workflows
                        </span>
                      </div>
                      <h2 className="mt-2 text-xl font-semibold text-slate-900">
                        <Link className="group-hover:text-[#1861C8]" href={`/use-cases/${useCase.slug}`}>
                          {useCase.title}
                        </Link>
                      </h2>
                      <p className="mt-2 text-sm text-slate-600">{useCase.summary}</p>
                    </div>
                  </div>

                  <div className="mt-5 flex-1">
                    <p className="text-xs uppercase tracking-wide text-slate-400">Outcomes</p>
                    <ul className="mt-3 space-y-2 text-sm text-slate-600">
                      {useCase.outcomes.map((outcome) => (
                        <li key={outcome} className="flex items-start gap-2">
                          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#1861C8]" />
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
            </Stagger>
          </div>

          <div className="mt-14 rounded-3xl border border-slate-200 bg-white/70 px-6 py-8 shadow-sm backdrop-blur-sm md:px-10">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-xl font-semibold text-slate-900">Have a different workflow?</h3>
                <p className="mt-2 text-sm text-slate-600">
                  We can map Trope to your critical paths and build a pilot that proves value fast.
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

function IconSpreadsheet(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M7 3h10a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
      <path d="M8 8h8" />
      <path d="M8 12h8" />
      <path d="M8 16h8" />
      <path d="M10 8v8" />
      <path d="M14 8v8" />
    </svg>
  )
}

function IconClipboardCheck(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M9 4h6a2 2 0 0 1 2 2v1H7V6a2 2 0 0 1 2-2Z" />
      <path d="M7 7h10v13a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V7Z" />
      <path d="m9.5 14 1.6 1.6 3.9-3.9" />
    </svg>
  )
}

function IconHeadset(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4 12a8 8 0 0 1 16 0" />
      <path d="M4 12v6a2 2 0 0 0 2 2h2v-7H6a2 2 0 0 0-2 2Z" />
      <path d="M20 12v6a2 2 0 0 1-2 2h-2v-7h2a2 2 0 0 1 2 2Z" />
      <path d="M12 19a3 3 0 0 0 3-3v-1" />
    </svg>
  )
}

function IconShieldCheck(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 2 19 5v6c0 5-3 9-7 11C8 20 5 16 5 11V5l7-3Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  )
}

function getUseCaseIcon(category: string) {
  const normalized = category.toLowerCase()

  if (normalized.includes('finance')) {
    return <IconSpreadsheet className="h-5 w-5" />
  }
  if (normalized.includes('operations')) {
    return <IconClipboardCheck className="h-5 w-5" />
  }
  if (normalized.includes('support')) {
    return <IconHeadset className="h-5 w-5" />
  }

  return <IconShieldCheck className="h-5 w-5" />
}

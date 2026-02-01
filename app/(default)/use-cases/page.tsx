export const metadata = {
  title: 'Use Cases - Trope',
  description:
    'Explore how Trope helps finance, IT, healthcare, nonprofit, and operations teams capture and scale critical desktop workflows.',
}

import Link from 'next/link'
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
            <p className="text-[#1861C8] text-sm font-medium mb-4 tracking-wide uppercase">Use cases</p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 mb-6">
              Workflow guidance for teams that run the business
            </h1>
            <p className="text-lg text-slate-600">
              Trope works in the real mix of systems your team already uses. Explore each use case to see how guided workflows
              reduce ramp time, errors, and rework across desktop and web tools.
            </p>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            {USE_CASES.map((useCase) => (
              <div
                key={useCase.slug}
                className="group relative flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-md will-change-transform"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-xs uppercase tracking-wide text-slate-400">{useCase.category}</p>
                    <h2 className="mt-2 text-xl font-semibold text-slate-900">
                      <Link className="group-hover:text-[#1861C8]" href={`/use-cases/${useCase.slug}`}>
                        {useCase.title}
                      </Link>
                    </h2>
                  </div>
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#1861C8]/10 ring-1 ring-[#1861C8]/15 text-[#1861C8]">
                    {getUseCaseIcon(useCase.slug)}
                  </div>
                </div>

                <p className="mt-3 text-sm text-slate-600">{useCase.summary}</p>

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

function IconSparkles(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 2l1.2 4.2L17 7.5l-3.8 1.3L12 13l-1.2-4.2L7 7.5l3.8-1.3L12 2Z" />
      <path d="M19 11l.7 2.4L22 14l-2.3.6L19 17l-.7-2.4L16 14l2.3-.6L19 11Z" />
      <path d="M5 13l.7 2.4L8 16l-2.3.6L5 19l-.7-2.4L2 16l2.3-.6L5 13Z" />
    </svg>
  )
}

function IconKey(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M21 7a4 4 0 0 1-7.7 1.5L7 14.8V18h3v3h3v-3h2l1.1-1.1V14l-1.3-1.3 1.1-1.1A4 4 0 0 1 21 7Z" />
      <path d="M17 7h.01" />
    </svg>
  )
}

function IconBadgeCheck(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 2l2.2 1.4 2.6.2 1.3 2.3 2.1 1.6-.6 2.6.6 2.6-2.1 1.6-1.3 2.3-2.6.2L12 22l-2.2-1.4-2.6-.2-1.3-2.3-2.1-1.6.6-2.6-.6-2.6L5.9 6l1.3-2.3 2.6-.2L12 2Z" />
      <path d="m9.5 12 1.6 1.6 3.9-3.9" />
    </svg>
  )
}

function IconCart(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M6 6h15l-1.6 8.2a2 2 0 0 1-2 1.6H9a2 2 0 0 1-2-1.6L5 2H2" />
      <path d="M9 20a1 1 0 1 0 0.001 0Z" />
      <path d="M17 20a1 1 0 1 0 0.001 0Z" />
    </svg>
  )
}

function IconRocket(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M14 4c3.2 0 6 2.8 6 6 0 6-7 10-10 10-1.3 0-3.4-.8-5-2.4S2.6 14 4 12c0-3 4-10 10-10Z" />
      <path d="M9 15l-4 4" />
      <path d="M8 19l-3 1 1-3" />
      <path d="M15 9h.01" />
    </svg>
  )
}

function IconFileCheck(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M14 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7l-5-5Z" />
      <path d="M14 2v5h5" />
      <path d="m9.5 13 1.6 1.6 3.9-3.9" />
    </svg>
  )
}

function IconTruck(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 7h11v10H3V7Z" />
      <path d="M14 11h4l3 3v3h-7v-6Z" />
      <path d="M7 20a1 1 0 1 0 0.001 0Z" />
      <path d="M18 20a1 1 0 1 0 0.001 0Z" />
    </svg>
  )
}

function IconMedicalCross(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 21s-7-4.4-7-10a4 4 0 0 1 7-2 4 4 0 0 1 7 2c0 5.6-7 10-7 10Z" />
      <path d="M12 8v6" />
      <path d="M9 11h6" />
    </svg>
  )
}

function IconHandHeart(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 7c1.6-2 4-2 5.2-.8 1.4 1.4 1 3.8-.7 5.2L12 15l-4.5-3.6c-1.7-1.4-2.1-3.8-.7-5.2C8 5 10.4 5 12 7Z" />
      <path d="M3 17c2.5 0 4.5-1 6.4-2" />
      <path d="M9.4 15 12 17c1 .7 2.2 1 3.4.7l5.6-1.4a2 2 0 0 1 2.5 1.6" />
    </svg>
  )
}

function getUseCaseIcon(slug: string) {
  switch (slug) {
    case 'finance-close':
      return <IconSpreadsheet className="h-5 w-5" />
    case 'operations-onboarding':
      return <IconClipboardCheck className="h-5 w-5" />
    case 'support-desk':
      return <IconHeadset className="h-5 w-5" />
    case 'revops-hygiene':
      return <IconSparkles className="h-5 w-5" />
    case 'it-access-provisioning':
      return <IconKey className="h-5 w-5" />
    case 'compliance-audit':
      return <IconBadgeCheck className="h-5 w-5" />
    case 'procurement-approvals':
      return <IconCart className="h-5 w-5" />
    case 'customer-onboarding':
      return <IconRocket className="h-5 w-5" />
    case 'claims-processing':
      return <IconFileCheck className="h-5 w-5" />
    case 'logistics-fulfillment':
      return <IconTruck className="h-5 w-5" />
    case 'healthcare-intake':
      return <IconMedicalCross className="h-5 w-5" />
    case 'nonprofit-grant-management':
      return <IconHandHeart className="h-5 w-5" />
    default:
      return <IconShieldCheck className="h-5 w-5" />
  }
}

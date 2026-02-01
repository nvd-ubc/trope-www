export const metadata = {
  title: 'Resources - Trope',
  description:
    'Guides, templates, and playbooks to help teams scale workflow guidance across desktop and web applications.',
}

import Link from 'next/link'
import { RESOURCES } from '@/lib/marketing-content'

export default function ResourcesPage() {
  return (
    <section className="relative overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 140% 70% at 50% 0%, rgba(24, 97, 200, 0.10), transparent 62%),
            radial-gradient(ellipse 120% 70% at 15% 65%, rgba(97, 175, 249, 0.10), transparent 60%),
            linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 55%, #F1F5F9 100%)
          `,
        }}
        aria-hidden="true"
      />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
        <div className="pt-28 pb-16 md:pt-36 md:pb-20">
          <div className="max-w-3xl">
            <p className="text-[#1861C8] text-sm font-medium mb-4 tracking-wide uppercase">Resources</p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 mb-6">
              Guidance for scaling workflow knowledge
            </h1>
            <p className="text-lg text-slate-600">
              Use these playbooks, templates, and briefs to roll out Trope in your organization, keep workflows current,
              and build a repeatable operating system for critical procedures.
            </p>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            {RESOURCES.map((resource) => (
              <Link
                key={resource.slug}
                href={`/resources/${resource.slug}`}
                className="group relative flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-md will-change-transform"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex min-w-0 items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#1861C8]/10 ring-1 ring-[#1861C8]/15 text-[#1861C8]">
                      {getResourceIcon(resource.slug)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-wide text-slate-400">
                        <span>{resource.category}</span>
                        <span>•</span>
                        <span>{resource.readTime}</span>
                      </div>
                      <h2 className="mt-2 text-xl font-semibold text-slate-900 group-hover:text-[#1861C8]">
                        {resource.title}
                      </h2>
                    </div>
                  </div>
                  <span className="hidden sm:inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-600 whitespace-nowrap shadow-sm">
                    {resource.audience}
                  </span>
                </div>

                <p className="mt-3 text-sm text-slate-600">{resource.summary}</p>

                <div className="mt-auto pt-6">
                  <div className="flex items-center justify-between text-sm font-medium text-[#1861C8]">
                    <span>Read resource</span>
                    <span className="transition-transform duration-200 group-hover:translate-x-0.5">→</span>
                  </div>
                  <div
                    className="pointer-events-none mt-6 h-px bg-gradient-to-r from-transparent via-[#1861C8]/25 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    aria-hidden="true"
                  />
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-12 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-xl font-semibold text-slate-900">Need a custom rollout plan?</h3>
                <p className="mt-2 text-sm text-slate-600">
                  We can co-design a pilot, training plan, and change management strategy for your workflows.
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

function IconBook(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4 5a3 3 0 0 1 3-3h11v18H7a3 3 0 0 0-3 3V5Z" />
      <path d="M18 20V2" />
      <path d="M8 6h6" />
      <path d="M8 10h6" />
      <path d="M8 14h5" />
    </svg>
  )
}

function IconTemplate(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M6 3h12a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
      <path d="M8 7h8" />
      <path d="M8 11h8" />
      <path d="M8 15h5" />
      <path d="M16 15h0" />
    </svg>
  )
}

function IconCalculator(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M7 3h10a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
      <path d="M8 7h8" />
      <path d="M8 12h3" />
      <path d="M13 12h3" />
      <path d="M8 16h3" />
      <path d="M13 16h3" />
    </svg>
  )
}

function IconShield(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 2 19 5v6c0 5-3 9-7 11C8 20 5 16 5 11V5l7-3Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  )
}

function getResourceIcon(slug: string) {
  switch (slug) {
    case 'workflow-drift-playbook':
      return <IconBook className="h-5 w-5" />
    case 'desktop-onboarding-kit':
      return <IconTemplate className="h-5 w-5" />
    case 'roi-model':
      return <IconCalculator className="h-5 w-5" />
    case 'security-overview':
      return <IconShield className="h-5 w-5" />
    default:
      return <IconBook className="h-5 w-5" />
  }
}

export const metadata = {
  title: 'Trope - Record once. Guide forever.',
  description:
    'Trope captures desktop workflows and delivers guided runs so teams can onboard faster, reduce errors, and scale operations.',
}

import Link from 'next/link'
import Hero from '@/components/hero'
import Features from '@/components/features'
import Features02 from '@/components/features-02'
import Features03 from '@/components/features-03'
import AnimateIn, { Stagger } from '@/components/animate-in'
import Pricing from './pricing-section'
import Faqs from '@/components/faqs'
import Cta from '@/components/cta'
import SchemaMarkup from '@/components/schema-markup'
import FAQSchema from '@/components/faq-schema'
import { USE_CASES } from '@/lib/marketing-content'

export default function Home() {
  return (
    <>
      <SchemaMarkup />
      <FAQSchema />
      <Hero />
      <div id="features">
        <Features />
        <Features02 />
        <Features03 />
      </div>
      <section className="relative overflow-hidden py-16 md:py-24">
        {/* Background layers */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 140% 70% at 0% 0%, rgba(97, 175, 249, 0.18), transparent 58%),
              radial-gradient(ellipse 120% 70% at 100% 60%, rgba(24, 97, 200, 0.10), transparent 60%),
              linear-gradient(180deg, #F8FAFC 0%, #F1F5F9 100%)
            `,
          }}
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: 'radial-gradient(rgba(24, 97, 200, 0.5) 0.8px, transparent 0.8px)',
            backgroundSize: '28px 28px',
          }}
          aria-hidden="true"
        />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
          {/* Floating accents */}
          <div className="hidden xl:block absolute inset-0 pointer-events-none" aria-hidden="true">
            <FloatingIcon className="-left-20 top-28 -rotate-6 animate-float-slow">
              <IconSpreadsheet className="h-7 w-7 text-[#1861C8]" />
            </FloatingIcon>
            <FloatingIcon className="-left-20 top-[62%] rotate-6 animate-float-slower">
              <IconClipboardCheck className="h-7 w-7 text-[#1861C8]" />
            </FloatingIcon>
            <FloatingIcon className="-right-20 top-36 rotate-6 animate-float-slower">
              <IconHeadset className="h-7 w-7 text-[#1861C8]" />
            </FloatingIcon>
            <FloatingIcon className="-right-20 top-[66%] -rotate-6 animate-float-slow">
              <IconShieldCheck className="h-7 w-7 text-[#1861C8]" />
            </FloatingIcon>
          </div>

          <div className="max-w-3xl">
            <AnimateIn>
              <p className="text-[#1861C8] text-sm font-medium mb-3 tracking-wide uppercase">Use cases</p>
            </AnimateIn>
            <AnimateIn delay={90}>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                Built for teams running critical workflows
              </h2>
            </AnimateIn>
            <AnimateIn delay={180}>
              <p className="text-base md:text-lg text-slate-600">
                From finance close to service desk operations, Trope keeps execution consistent across desktop and web tools.
              </p>
            </AnimateIn>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            <Stagger className="h-full" staggerDelay={90} baseDelay={80} duration={520} animation="fade-up">
              {USE_CASES.slice(0, 3).map((useCase) => (
                <div
                  key={useCase.slug}
                  className="group relative flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-md will-change-transform"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#1861C8]/10 ring-1 ring-[#1861C8]/15 text-[#1861C8]">
                      {getUseCaseIcon(useCase.category)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs uppercase tracking-wide text-slate-400">{useCase.category}</p>
                      <h3 className="mt-1 text-lg font-semibold text-slate-900">
                        <Link className="group-hover:text-[#1861C8]" href={`/use-cases/${useCase.slug}`}>
                          {useCase.title}
                        </Link>
                      </h3>
                    </div>
                  </div>

                  <p className="mt-3 flex-1 text-sm text-slate-600">{useCase.summary}</p>

                  <Link
                    className="mt-5 inline-flex items-center text-sm font-medium text-[#1861C8]"
                    href={`/use-cases/${useCase.slug}`}
                  >
                    View use case
                    <span className="ml-1 transition-transform duration-200 group-hover:translate-x-0.5">→</span>
                  </Link>

                  <div
                    className="pointer-events-none absolute inset-x-8 bottom-0 h-px bg-gradient-to-r from-transparent via-[#1861C8]/25 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    aria-hidden="true"
                  />
                </div>
              ))}
            </Stagger>
          </div>

          <AnimateIn delay={200}>
            <div className="mt-8">
              <Link className="text-sm font-medium text-[#1861C8]" href="/use-cases">
                View all use cases →
              </Link>
            </div>
          </AnimateIn>
        </div>
      </section>
      <div id="pricing">
        <Pricing />
      </div>
      <Faqs />
      <Cta />
    </>
  )
}

function FloatingIcon({ className, children }: { className: string; children: React.ReactNode }) {
  return (
    <div className={`absolute ${className}`}>
      <div className="rounded-2xl border border-slate-200 bg-white/70 p-3 shadow-sm backdrop-blur-sm">
        {children}
      </div>
    </div>
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

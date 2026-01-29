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
      <section className="py-16 md:py-24 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="max-w-3xl">
            <p className="text-[#1861C8] text-sm font-medium mb-3 tracking-wide uppercase">Use cases</p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Built for teams running critical workflows
            </h2>
            <p className="text-base md:text-lg text-slate-600">
              From finance close to service desk operations, Trope keeps execution consistent across desktop and web tools.
            </p>
          </div>
          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {USE_CASES.slice(0, 3).map((useCase) => (
              <Link
                key={useCase.slug}
                className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-slate-300"
                href={`/use-cases/${useCase.slug}`}
              >
                <h3 className="text-lg font-semibold text-slate-900 group-hover:text-[#1861C8]">{useCase.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{useCase.summary}</p>
                <span className="mt-4 inline-flex items-center text-sm font-medium text-[#1861C8]">
                  View use case →
                </span>
              </Link>
            ))}
          </div>
          <div className="mt-8">
            <Link className="text-sm font-medium text-[#1861C8]" href="/use-cases">
              View all use cases →
            </Link>
          </div>
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

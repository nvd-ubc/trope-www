export const metadata = {
  title: 'Plans - Trope',
  description: 'Flexible plans for Trope pilots and enterprise workflow rollouts.',
}

import Pricing from '@/components/pricing'
import Faqs from '@/components/faqs'
import Cta from '@/components/cta'
import FAQSchema from '@/components/faq-schema'

export default function PricingPage() {
  return (
    <>
      <FAQSchema />
      <section className="bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="pt-28 pb-16 md:pt-36 md:pb-20">
            <div className="max-w-3xl">
              <p className="text-[#1861C8] text-sm font-medium mb-4 tracking-wide uppercase">Plans</p>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 mb-6">
                Pricing for guided workflow pilots
              </h1>
              <p className="text-lg text-slate-600">
                Trope is currently invite-only. We build pilots that prove impact first, then scale with your team.
              </p>
            </div>
            <div className="mt-12">
              <Pricing />
            </div>
          </div>
        </div>
      </section>
      <Faqs />
      <Cta />
    </>
  )
}

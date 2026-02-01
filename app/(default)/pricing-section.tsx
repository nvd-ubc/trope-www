import Pricing from '@/components/pricing'

export default function PricingSection() {
  return (
    <section id="pricing" className="py-16 md:py-24 lg:py-28 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Section header */}
        <div className="max-w-3xl mx-auto text-center mb-12 md:mb-16">
          <p className="text-[#1861C8] text-sm font-medium mb-3 tracking-wide uppercase">Plans</p>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Flexible plans for guided workflow pilots
          </h2>
          <p className="text-base md:text-lg text-slate-600">
            Start with a focused pilot, then scale to department-wide rollout when you&apos;re ready.
          </p>
        </div>
        <Pricing />
      </div>
    </section>
  )
}

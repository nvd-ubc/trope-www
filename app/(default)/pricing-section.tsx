import Pricing from '@/components/pricing'

export default function PricingSection() {
  return (
    <section id="pricing" className="py-16 md:py-24 lg:py-28 bg-[#000E2E]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Section header */}
        <div className="max-w-3xl mx-auto text-center mb-12 md:mb-16">
          <p className="text-[#61AFF9] text-sm font-medium mb-3 tracking-wide uppercase">Pricing</p>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-base md:text-lg text-[#D7EEFC]/60">
            Pay per user, scale as you grow.
          </p>
        </div>
        <Pricing />
      </div>
    </section>
  )
}

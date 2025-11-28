import Pricing from '@/components/pricing'

export default function PricingSection() {
  return (
    <section id="pricing" className="py-20 md:py-28 relative bg-[#000E2E]">
      {/* Subtle gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#010329] to-[#000E2E]" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative">
        {/* Section header */}
        <div className="max-w-3xl mx-auto text-center mb-16" data-aos="fade-up">
          <p className="text-[#61AFF9] text-sm font-medium mb-3 tracking-wide uppercase">Pricing</p>
          <h2 className="text-3xl md:text-4xl font-medium text-white mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-lg text-[#D7EEFC]/60">
            Pay per user, scale as you grow.
          </p>
        </div>
        <Pricing />
      </div>
    </section>
  )
}

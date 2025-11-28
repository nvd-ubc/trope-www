import Pricing from '@/components/pricing'

export default function PricingSection() {
  return (
    <section className="py-20 md:py-28">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Section header */}
        <div className="max-w-3xl mx-auto text-center mb-16" data-aos="fade-up">
          <h2 className="text-3xl md:text-4xl font-medium text-gray-900 mb-4">
            Pricing
          </h2>
          <p className="text-lg text-gray-600">
            Simple, transparent pricing. Pay per user, scale as you grow.
          </p>
        </div>
        <Pricing />
      </div>
    </section>
  )
}

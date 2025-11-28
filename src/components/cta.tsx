import { CONTACT_EMAIL } from '@/lib/constants'

export default function Cta() {
  return (
    <section className="py-16 md:py-24 lg:py-28 bg-[#00050F]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
            Ready to transform<br className="hidden sm:block" />
            <span className="text-[#61AFF9]"> how your team works?</span>
          </h2>
          <p className="text-base md:text-lg text-[#D7EEFC]/60 mb-8 max-w-xl mx-auto">
            Join teams who have turned tribal knowledge into living documentation that scales.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              className="inline-flex items-center justify-center px-6 py-3 text-base font-medium text-white bg-[#1861C8] rounded-full hover:bg-[#61AFF9] transition-colors duration-200"
              href={`mailto:${CONTACT_EMAIL}`}
            >
              Talk to Sales
            </a>
            <a
              className="inline-flex items-center justify-center px-6 py-3 text-base font-medium text-[#D7EEFC]/80 border border-[#1861C8]/40 rounded-full hover:border-[#61AFF9] hover:text-white transition-colors duration-200"
              href="#features"
            >
              Learn more
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

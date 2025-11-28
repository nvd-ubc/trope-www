import { CONTACT_EMAIL } from '@/lib/constants'

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Soft gradient background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-violet-50/50 via-rose-50/30 to-amber-50/20" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-200/30 rounded-full blur-3xl" />
        <div className="absolute top-20 right-1/4 w-80 h-80 bg-rose-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/2 w-[600px] h-[400px] bg-amber-100/30 rounded-full blur-3xl -translate-x-1/2" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="pt-32 pb-20 md:pt-44 md:pb-32">

          {/* Hero content */}
          <div className="max-w-4xl mx-auto text-center">
            {/* Subtitle */}
            <p className="text-gray-500 text-sm md:text-base mb-6" data-aos="fade-down">
              A workflow automation platform for teams
            </p>

            {/* Main headline with gradient text */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-medium tracking-tight mb-6" data-aos="fade-down" data-aos-delay="100">
              <span className="text-gradient-warm font-serif italic">Record</span>{' '}
              <span className="text-gray-900">once, guide forever</span>
            </h1>

            {/* Description */}
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-10" data-aos="fade-down" data-aos-delay="200">
              Trope records any workflow once—across desktop apps and the web—then delivers living guides and safe one-click automations.
            </p>

            {/* CTA Button */}
            <div data-aos="fade-down" data-aos-delay="300">
              <a
                className="inline-flex items-center justify-center px-8 py-4 text-base font-medium text-white bg-gray-900 rounded-full hover:bg-gray-800 transition-all duration-200 shadow-lg shadow-gray-900/10 hover:shadow-xl hover:shadow-gray-900/20 hover:-translate-y-0.5"
                href={`mailto:${CONTACT_EMAIL}`}
              >
                Talk to Sales
              </a>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
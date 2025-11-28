import { CONTACT_EMAIL } from '@/lib/constants'
import HeroDemo from './hero-demo'

export default function Hero() {
  return (
    <section className="relative overflow-hidden min-h-screen flex items-center bg-[#000E2E]">
      {/* Optimized gradient background - using CSS gradients instead of blur */}
      <div className="absolute inset-0">
        {/* Base radial gradient */}
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(24, 97, 200, 0.15), transparent)'
          }}
        />
        {/* Bottom glow */}
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse 60% 40% at 50% 100%, rgba(97, 175, 249, 0.08), transparent)'
          }}
        />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 w-full relative">
        <div className="pt-24 pb-16 md:pt-32 md:pb-24 lg:pt-40 lg:pb-32">

          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            {/* Left: Content */}
            <div className="text-center lg:text-left">
              {/* Subtitle */}
              <p className="text-[#61AFF9] text-sm md:text-base mb-4 tracking-wide font-medium">
                Workflow automation for teams
              </p>

              {/* Main headline */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-5 text-white leading-[1.1]">
                Record once,<br />
                <span className="text-[#61AFF9]">guide forever</span>
              </h1>

              {/* Description */}
              <p className="text-base md:text-lg text-[#D7EEFC]/60 max-w-lg mx-auto lg:mx-0 mb-8">
                Trope records any workflow once—across desktop apps and the web—then delivers living guides and safe one-click automations.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
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

            {/* Right: Animated demo */}
            <div className="relative flex justify-center lg:justify-end">
              <HeroDemo />
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}

import { CONTACT_EMAIL } from '@/lib/constants'
import HeroDemo from './hero-demo'
import AnimateIn from './animate-in'

export default function Hero() {
  return (
    <section className="relative overflow-hidden min-h-screen flex items-center">
      {/* Layered gradient background matching brand */}
      <div className="absolute inset-0">
        {/* Base: dark gradient from top to bottom */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(180deg, #00050F 0%, #000E2E 50%, #010329 100%)'
          }}
        />
        {/* Radial glow from bottom center - creates the horizon effect */}
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse 140% 70% at 50% 100%, rgba(24, 97, 200, 0.45), transparent 65%)'
          }}
        />
        {/* Secondary glow for depth */}
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse 100% 50% at 50% 105%, rgba(97, 175, 249, 0.3), transparent 55%)'
          }}
        />
        {/* Bright horizon line */}
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse 120% 15% at 50% 100%, rgba(97, 175, 249, 0.4), transparent 50%)'
          }}
        />
        {/* Subtle top vignette */}
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse 100% 50% at 50% 0%, rgba(0, 5, 15, 0.5), transparent 50%)'
          }}
        />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 w-full relative">
        <div className="pt-24 pb-16 md:pt-32 md:pb-24 lg:pt-40 lg:pb-32">

          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            {/* Left: Content */}
            <div className="text-center lg:text-left">
              {/* Subtitle */}
              <AnimateIn delay={0} duration={700}>
                <p className="text-[#61AFF9] text-sm md:text-base mb-4 tracking-wide font-medium">
                  Workflow documentation for teams
                </p>
              </AnimateIn>

              {/* Main headline */}
              <AnimateIn delay={100} duration={700}>
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 text-white leading-[1.05] tracking-tight">
                  Record once,<br />
                  <span className="bg-gradient-to-r from-[#61AFF9] to-[#D7EEFC] bg-clip-text text-transparent">guide forever</span>
                </h1>
              </AnimateIn>

              {/* Description */}
              <AnimateIn delay={200} duration={700}>
                <p className="text-base md:text-lg text-[#D7EEFC]/50 max-w-lg mx-auto lg:mx-0 mb-8 leading-relaxed">
                  Trope records any workflow once—across desktop apps and the web—then delivers living guides and safe one-click automations.
                </p>
              </AnimateIn>

              {/* CTA Buttons */}
              <AnimateIn delay={300} duration={700}>
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <a
                    className="group inline-flex items-center justify-center px-7 py-3.5 text-base font-semibold text-white bg-[#1861C8] rounded-full hover:bg-[#2171d8] transition-all duration-200 shadow-lg shadow-[#1861C8]/20"
                    href={`mailto:${CONTACT_EMAIL}`}
                  >
                    Talk to Sales
                    <svg
                      className="ml-2 w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </a>
                  <a
                    className="inline-flex items-center justify-center px-7 py-3.5 text-base font-semibold text-[#D7EEFC]/80 border border-[#D7EEFC]/20 rounded-full hover:border-[#D7EEFC]/40 hover:text-white transition-all duration-200"
                    href="#features"
                  >
                    Learn more
                  </a>
                </div>
              </AnimateIn>
            </div>

            {/* Right: Animated demo */}
            <AnimateIn delay={400} duration={800} animation="scale">
              <div className="relative flex justify-center lg:justify-end">
                <HeroDemo />
              </div>
            </AnimateIn>
          </div>

        </div>
      </div>
    </section>
  )
}

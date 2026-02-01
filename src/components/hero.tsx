import Link from 'next/link'
import { CONTACT_EMAIL, SALES_CALL_URL } from '@/lib/constants'
import HeroDemo from './hero-demo'
import AnimateIn from './animate-in'
import ChromaText from './chroma-text'

export default function Hero() {
  const salesHref = SALES_CALL_URL || `mailto:${CONTACT_EMAIL}`

  return (
    <section className="relative overflow-hidden min-h-screen flex items-center">
      {/* Layered gradient background - light theme */}
      <div className="absolute inset-0">
        {/* Base: light gradient from top to bottom */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(180deg, #FFFFFF 0%, #F1F5F9 50%, #E2E8F0 100%)'
          }}
        />
        {/* Radial glow from bottom center - creates the horizon effect */}
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse 140% 70% at 50% 100%, rgba(24, 97, 200, 0.15), transparent 65%)'
          }}
        />
        {/* Secondary glow for depth */}
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse 100% 50% at 50% 105%, rgba(97, 175, 249, 0.12), transparent 55%)'
          }}
        />
        {/* Bright horizon line */}
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse 120% 15% at 50% 100%, rgba(24, 97, 200, 0.2), transparent 50%)'
          }}
        />
        {/* Subtle top fade */}
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse 100% 50% at 50% 0%, rgba(255, 255, 255, 0.8), transparent 50%)'
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
                <p className="text-[#1861C8] text-sm md:text-base mb-4 tracking-wide font-medium">
                  Desktop workflow guidance for operations teams
                </p>
              </AnimateIn>

              {/* Main headline */}
              <AnimateIn delay={100} duration={700}>
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 text-slate-900 leading-[1.05] tracking-tight">
                  Record once,<br />
                  <ChromaText delay={400}>guide forever</ChromaText>
                </h1>
              </AnimateIn>

              {/* Description */}
              <AnimateIn delay={200} duration={700}>
                <p className="text-base md:text-lg text-slate-600 max-w-lg mx-auto lg:mx-0 mb-8 leading-relaxed">
                  Trope turns complex desktop workflows into guided, repeatable playbooks. Standardize onboarding,
                  reduce errors, and scale execution across every team.
                </p>
              </AnimateIn>

              {/* CTA Buttons */}
              <AnimateIn delay={300} duration={700}>
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Link
                    className="group inline-flex items-center justify-center px-7 py-3.5 text-base font-semibold text-white bg-[#1861C8] rounded-full hover:bg-[#2171d8] transition-all duration-200 shadow-lg shadow-[#1861C8]/20"
                    href="/request-access"
                  >
                    Request access
                    <svg
                      className="ml-2 w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                  <a
                    className="inline-flex items-center justify-center px-7 py-3.5 text-base font-semibold text-slate-700 border border-slate-300 rounded-full hover:border-slate-400 hover:text-slate-900 transition-all duration-200"
                    href={salesHref}
                  >
                    Book a call
                  </a>
                </div>
                <p className="mt-3 text-xs text-slate-500">Closed beta • Invite-only access for teams</p>
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

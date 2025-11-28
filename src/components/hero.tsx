import { CONTACT_EMAIL } from '@/lib/constants'

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

            {/* Right: Visual element - floating UI card */}
            <div className="relative flex justify-center lg:justify-end">
              <div className="relative w-full max-w-md">
                {/* Glow behind card */}
                <div className="absolute inset-0 bg-[#1861C8]/20 rounded-3xl blur-2xl transform scale-95" />

                {/* Main card */}
                <div className="relative bg-gradient-to-b from-[#0a1a3a] to-[#061025] border border-[#1861C8]/30 rounded-2xl p-6 shadow-2xl">
                  {/* Card header */}
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-[#1861C8]/20 flex items-center justify-center">
                      <svg className="w-5 h-5 text-[#61AFF9]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">Recording workflow</p>
                      <p className="text-[#D7EEFC]/40 text-xs">3 steps captured</p>
                    </div>
                    <div className="ml-auto flex gap-1">
                      <span className="w-2 h-2 rounded-full bg-[#61AFF9] animate-pulse" />
                    </div>
                  </div>

                  {/* Workflow steps */}
                  <div className="space-y-3">
                    {[
                      { step: 1, action: 'Open Excel spreadsheet', status: 'done' },
                      { step: 2, action: 'Navigate to cell B12', status: 'done' },
                      { step: 3, action: 'Enter quarterly data', status: 'active' },
                    ].map((item) => (
                      <div
                        key={item.step}
                        className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                          item.status === 'active'
                            ? 'bg-[#1861C8]/20 border border-[#1861C8]/40'
                            : 'bg-[#000E2E]/50'
                        }`}
                      >
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                          item.status === 'done'
                            ? 'bg-[#1861C8] text-white'
                            : 'bg-[#61AFF9] text-white'
                        }`}>
                          {item.status === 'done' ? (
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          ) : item.step}
                        </div>
                        <span className={`text-sm ${item.status === 'active' ? 'text-white' : 'text-[#D7EEFC]/60'}`}>
                          {item.action}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Card footer */}
                  <div className="mt-6 pt-4 border-t border-[#1861C8]/20 flex items-center justify-between">
                    <span className="text-[#D7EEFC]/40 text-xs">Auto-saving to cloud</span>
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                      <span className="text-green-400 text-xs font-medium">Live</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}

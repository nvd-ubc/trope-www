import { CONTACT_EMAIL } from '@/lib/constants'

export default function Hero() {
  return (
    <section className="relative overflow-hidden min-h-[90vh] flex items-center">
      {/* Dark gradient background with brand colors */}
      <div className="absolute inset-0 -z-10 bg-black">
        {/* Base gradient - diamond gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#00050F] via-[#000E2E] to-[#010329]" />

        {/* Animated aurora blobs with brand blues */}
        <div
          className="absolute top-0 left-1/4 w-[800px] h-[600px] rounded-full blur-[120px] animate-[aurora_15s_ease-in-out_infinite]"
          style={{ background: 'radial-gradient(ellipse, rgba(24, 97, 200, 0.2) 0%, transparent 70%)' }}
        />
        <div
          className="absolute top-1/4 right-0 w-[600px] h-[600px] rounded-full blur-[100px] animate-[aurora-reverse_18s_ease-in-out_infinite]"
          style={{ background: 'radial-gradient(ellipse, rgba(3, 22, 99, 0.25) 0%, transparent 70%)' }}
        />
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1200px] h-[500px] rounded-full blur-[120px] animate-[aurora_20s_ease-in-out_infinite]"
          style={{ background: 'radial-gradient(ellipse at center bottom, rgba(97, 175, 249, 0.15) 0%, rgba(24, 97, 200, 0.08) 40%, transparent 70%)' }}
        />

        {/* Subtle noise texture overlay */}
        <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")' }} />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 w-full">
        <div className="pt-32 pb-32 md:pt-44 md:pb-44">

          {/* Hero content */}
          <div className="max-w-4xl mx-auto text-center">
            {/* Subtitle */}
            <p className="text-[#61AFF9] text-sm md:text-base mb-6 tracking-wide" data-aos="fade-down">
              A workflow automation platform for teams
            </p>

            {/* Main headline */}
            <h1
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 text-white"
              data-aos="fade-down"
              data-aos-delay="100"
            >
              Record once, guide forever
            </h1>

            {/* Description */}
            <p className="text-lg md:text-xl text-[#D7EEFC]/70 max-w-2xl mx-auto mb-10" data-aos="fade-down" data-aos-delay="200">
              Trope records any workflow once—across desktop apps and the web—then delivers living guides and safe one-click automations.
            </p>

            {/* CTA Button */}
            <div data-aos="fade-down" data-aos-delay="300">
              <a
                className="group relative inline-flex items-center justify-center px-8 py-4 text-base font-medium text-white rounded-full transition-all duration-300 hover:-translate-y-0.5 overflow-hidden"
                href={`mailto:${CONTACT_EMAIL}`}
              >
                {/* Button gradient background - brand blues only */}
                <span className="absolute inset-0 bg-gradient-to-r from-[#1861C8] via-[#61AFF9] to-[#1861C8] bg-[length:200%_100%] animate-[gradient-shift_3s_ease-in-out_infinite]" />
                {/* Button glow effect */}
                <span className="absolute inset-0 bg-[#1861C8] blur-xl opacity-50 group-hover:opacity-70 transition-opacity" />
                {/* Button content */}
                <span className="relative">Talk to Sales</span>
              </a>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}

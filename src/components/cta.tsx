import { CONTACT_EMAIL } from '@/lib/constants'

export default function Cta() {
  return (
    <section className="py-20 md:py-28 relative overflow-hidden bg-[#00050F]">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#000E2E] via-[#010329] to-[#00050F]">
        {/* Animated aurora effects */}
        <div
          className="absolute top-0 left-1/4 w-[600px] h-[400px] rounded-full blur-[100px] animate-[aurora_12s_ease-in-out_infinite]"
          style={{ background: 'radial-gradient(ellipse, rgba(24, 97, 200, 0.2) 0%, transparent 70%)' }}
        />
        <div
          className="absolute bottom-0 right-1/4 w-[500px] h-[400px] rounded-full blur-[100px] animate-[aurora-reverse_15s_ease-in-out_infinite]"
          style={{ background: 'radial-gradient(ellipse, rgba(97, 175, 249, 0.15) 0%, transparent 70%)' }}
        />

        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(rgba(97, 175, 249, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(97, 175, 249, 0.3) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}
        />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative">
        <div className="max-w-3xl mx-auto text-center" data-aos="fade-up">
          <h2 className="text-3xl md:text-5xl font-medium text-white mb-4">
            Ready to transform<br />
            <span className="bg-gradient-to-r from-[#61AFF9] via-[#D7EEFC] to-[#61AFF9] bg-clip-text text-transparent">
              how your team works?
            </span>
          </h2>
          <p className="text-lg text-[#D7EEFC]/60 mb-8 max-w-xl mx-auto">
            Join teams who have turned tribal knowledge into living documentation that scales.
          </p>
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
    </section>
  )
}

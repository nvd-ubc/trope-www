import Particles from './particles'

export default function Clients() {
  const stats = [
    { value: '100K+', label: 'Workflows automated' },
    { value: '3 weeks', label: 'Saved per employee annually' },
    { value: '99.9%', label: 'Accuracy with drift detection' },
  ]

  return (
    <section>
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6">

        {/* Particles animation */}
        <div className="absolute inset-0 max-w-6xl mx-auto px-4 sm:px-6">
          <Particles className="absolute inset-0 -z-10" quantity={5} />
        </div>

        <div className="py-12 md:py-16">
          <div className="grid grid-cols-3 md:grid-cols-3 md:gap-12">
            {stats.map((stat, index) => (
              <div key={index} className="text-center" data-aos="fade-up" data-aos-delay={index * 100}>
                <div className="text-2xl md:text-4xl font-bold text-slate-200 mb-1 md:mb-2">
                  {stat.value}
                </div>
                <div className="text-slate-400 text-xs md:text-sm">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
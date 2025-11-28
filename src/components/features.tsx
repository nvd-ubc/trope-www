export default function Features() {
  const features = [
    {
      title: 'Record workflows',
      description: 'Capture any workflow across desktop apps and the web with a single click. Works natively with Excel, QuickBooks, and more.',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="3" fill="currentColor" />
        </svg>
      ),
    },
    {
      title: 'Just-in-time guidance',
      description: 'Deliver contextual help right where your team works. Interactive overlays guide users through each step.',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
        </svg>
      ),
    },
    {
      title: 'Safe automation',
      description: 'Graduate repetitive steps to one-click automations. Critical actions require approval, every step is logged.',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
        </svg>
      ),
    },
  ]

  return (
    <section id="features" className="py-16 md:py-24 lg:py-28 bg-[#000E2E]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Section header */}
        <div className="max-w-3xl mx-auto text-center mb-12 md:mb-16">
          <p className="text-[#61AFF9] text-sm font-medium mb-3 tracking-wide uppercase">How it works</p>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">
            From manual to magical
          </h2>
          <p className="text-base md:text-lg text-[#D7EEFC]/60">
            Three simple steps to transform tribal knowledge into living documentation.
          </p>
        </div>

        {/* Features grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group p-6 md:p-8 rounded-2xl bg-[#000E2E]/60 border border-[#1861C8]/20 hover:border-[#1861C8]/40 transition-colors duration-200"
            >
              <div className="w-12 h-12 rounded-xl bg-[#031663] text-[#61AFF9] flex items-center justify-center mb-5">
                {feature.icon}
              </div>
              <h3 className="text-lg md:text-xl font-semibold text-white mb-3">
                {feature.title}
              </h3>
              <p className="text-[#D7EEFC]/60 text-sm md:text-base leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

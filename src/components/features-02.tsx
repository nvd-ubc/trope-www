export default function Features02() {
  const capabilities = [
    {
      title: 'Desktop-first',
      description: 'Works natively with Excel, QuickBooks, and desktop apps—not just browsers.',
    },
    {
      title: 'Drift detection',
      description: 'Automatically flags when apps change and workflows become outdated.',
    },
    {
      title: 'Audit trails',
      description: 'Every action logged with full lineage for compliance and coaching.',
    },
    {
      title: 'Role-based access',
      description: 'Scope workflows and permissions by team role.',
    },
  ]

  return (
    <section className="py-16 md:py-24 lg:py-28 bg-[#010329]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Section header */}
        <div className="max-w-3xl mx-auto text-center mb-12 md:mb-16">
          <p className="text-[#61AFF9] text-sm font-medium mb-3 tracking-wide uppercase">Capabilities</p>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">
            Built for real workflows
          </h2>
          <p className="text-base md:text-lg text-[#D7EEFC]/60">
            Unlike browser-only tools, Trope works where your team actually works.
          </p>
        </div>

        {/* Capabilities grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {capabilities.map((capability, index) => (
            <div
              key={index}
              className="bg-[#000E2E] rounded-xl p-5 md:p-6 border border-[#1861C8]/20 hover:border-[#1861C8]/40 transition-colors duration-200"
            >
              <h3 className="text-base md:text-lg font-semibold text-white mb-2">
                {capability.title}
              </h3>
              <p className="text-[#D7EEFC]/60 text-sm leading-relaxed">
                {capability.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

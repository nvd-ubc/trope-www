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
    <section className="py-20 md:py-28 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Section header */}
        <div className="max-w-3xl mx-auto text-center mb-16" data-aos="fade-up">
          <h2 className="text-3xl md:text-4xl font-medium text-gray-900 mb-4">
            Built for real workflows
          </h2>
          <p className="text-lg text-gray-600">
            Unlike browser-only tools, Trope works where your team actually works.
          </p>
        </div>

        {/* Capabilities grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {capabilities.map((capability, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-6 border border-gray-100"
              data-aos="fade-up"
              data-aos-delay={index * 50}
            >
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {capability.title}
              </h3>
              <p className="text-gray-600 text-sm">
                {capability.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
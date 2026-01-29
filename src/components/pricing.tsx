import { CONTACT_EMAIL, SALES_CALL_URL } from '@/lib/constants'

export default function Pricing() {
  const salesHref = SALES_CALL_URL || `mailto:${CONTACT_EMAIL}`

  const plans = [
    {
      name: 'Pilot',
      description: 'Launch a closed beta with one team and prove value fast.',
      price: 'Request access',
      features: [
        'Guided workflow capture + run',
        'Invite-only workspace access',
        'Shared workflow library',
        'Run history summaries',
        'Desktop + web coverage',
      ],
      cta: 'Request access',
      href: '/request-access',
      highlighted: false,
    },
    {
      name: 'Growth',
      description: 'Scale guidance across departments with admin visibility.',
      price: 'Talk to sales',
      features: [
        'Workspace admin roles',
        'Workflow owners + review cadence',
        'Run quality feedback loops',
        'Shareable workflow links',
        'Onboarding + enablement support',
      ],
      cta: 'Book a call',
      href: salesHref,
      highlighted: true,
    },
    {
      name: 'Enterprise',
      description: 'Governance, compliance, and rollout support at scale.',
      price: 'Talk to sales',
      features: [
        'Custom workflow governance',
        'Audit exports and reporting',
        'Advanced onboarding planning',
        'Priority support & SLAs',
        'Dedicated success team',
      ],
      cta: 'Talk to sales',
      href: salesHref,
      highlighted: false,
    },
  ]

  return (
    <div>
      {/* Pricing cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {plans.map((plan, index) => (
          <div
            key={index}
            className={`relative rounded-2xl p-6 transition-colors duration-200 ${
              plan.highlighted
                ? 'bg-gradient-to-b from-[#1861C8] to-[#0d4a9e] border border-[#61AFF9]/40'
                : 'bg-slate-50 border border-slate-200 hover:border-slate-300'
            }`}
          >
            {/* Popular badge */}
            {plan.highlighted && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="inline-flex items-center px-3 py-1 text-xs font-medium text-white bg-[#61AFF9] rounded-full">
                  Most Popular
                </span>
              </div>
            )}

            <div className="mb-5">
              <h3 className={`text-lg font-semibold mb-1 ${plan.highlighted ? 'text-white' : 'text-slate-900'}`}>
                {plan.name}
              </h3>
              <p className={`text-sm ${plan.highlighted ? 'text-white/70' : 'text-slate-600'}`}>
                {plan.description}
              </p>
            </div>

            <div className="mb-6">
              <div className={`text-xl md:text-2xl font-semibold ${plan.highlighted ? 'text-white' : 'text-slate-900'}`}>
                {plan.price}
              </div>
            </div>

            <a
              href={plan.href}
              className={`block w-full py-3 px-4 text-center text-sm font-medium rounded-full transition-colors duration-200 mb-6 ${
                plan.highlighted
                  ? 'bg-white text-[#1861C8] hover:bg-slate-100'
                  : 'bg-[#1861C8] text-white hover:bg-[#2171d8]'
              }`}
            >
              {plan.cta}
            </a>

            <ul className="space-y-3">
              {plan.features.map((feature, featureIndex) => (
                <li key={featureIndex} className="flex items-start gap-3">
                  <svg
                    className={`w-5 h-5 shrink-0 mt-0.5 ${plan.highlighted ? 'text-white' : 'text-[#1861C8]'}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className={`text-sm ${plan.highlighted ? 'text-white/80' : 'text-slate-700'}`}>
                    {feature}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}

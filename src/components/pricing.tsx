'use client'

import { useState } from 'react'
import { CONTACT_EMAIL } from '@/lib/constants'

export default function Pricing() {
  const [annual, setAnnual] = useState<boolean>(true)

  const plans = [
    {
      name: 'Starter',
      description: 'Perfect for small teams getting started.',
      price: annual ? 20 : 25,
      features: [
        '10 workflows',
        '5 team members',
        '1,000 automated steps/mo',
        'Drift detection',
        'In-app overlays',
        'Desktop support',
      ],
      cta: 'Talk to Sales',
      highlighted: false,
    },
    {
      name: 'Growth',
      description: 'Scale with your growing team.',
      price: annual ? 24 : 30,
      features: [
        '50 workflows',
        '25 team members',
        '10,000 automated steps/mo',
        'Everything in Starter',
        'Role-based permissions',
        'Premium support',
      ],
      cta: 'Talk to Sales',
      highlighted: true,
    },
    {
      name: 'Enterprise',
      description: 'For large organizations.',
      price: null,
      features: [
        'Unlimited workflows',
        'Unlimited team members',
        'Custom automation limits',
        'Everything in Growth',
        'SSO & SCIM',
        'Data residency',
      ],
      cta: 'Talk to Sales',
      highlighted: false,
    },
  ]

  return (
    <div>
      {/* Toggle */}
      <div className="flex justify-center mb-12" data-aos="fade-up">
        <div className="inline-flex items-center gap-1 bg-[#031663]/50 rounded-full p-1 border border-[#1861C8]/20">
          <button
            className={`px-5 py-2.5 text-sm font-medium rounded-full transition-all duration-300 ${
              !annual ? 'bg-[#1861C8] text-white shadow-sm' : 'text-[#D7EEFC]/60 hover:text-white'
            }`}
            onClick={() => setAnnual(false)}
          >
            Monthly
          </button>
          <button
            className={`px-5 py-2.5 text-sm font-medium rounded-full transition-all duration-300 ${
              annual ? 'bg-[#1861C8] text-white shadow-sm' : 'text-[#D7EEFC]/60 hover:text-white'
            }`}
            onClick={() => setAnnual(true)}
          >
            Yearly <span className="text-[#61AFF9] font-medium ml-1">-20%</span>
          </button>
        </div>
      </div>

      {/* Pricing cards */}
      <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {plans.map((plan, index) => (
          <div
            key={index}
            className={`group relative rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 ${
              plan.highlighted
                ? 'bg-gradient-to-b from-[#1861C8] to-[#031663] text-white shadow-2xl shadow-[#1861C8]/20 border border-[#61AFF9]/30'
                : 'bg-[#000E2E]/50 border border-[#1861C8]/20 hover:border-[#1861C8]/40'
            }`}
            data-aos="fade-up"
            data-aos-delay={index * 100}
          >
            {/* Popular badge for highlighted plan */}
            {plan.highlighted && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="inline-flex items-center px-3 py-1 text-xs font-medium text-white bg-[#61AFF9] rounded-full shadow-lg">
                  Most Popular
                </span>
              </div>
            )}

            <div className="mb-6">
              <h3 className={`text-lg font-medium mb-1 ${plan.highlighted ? 'text-white' : 'text-white'}`}>
                {plan.name}
              </h3>
              <p className={`text-sm ${plan.highlighted ? 'text-[#D7EEFC]/80' : 'text-[#D7EEFC]/60'}`}>
                {plan.description}
              </p>
            </div>

            <div className="mb-6">
              {plan.price !== null ? (
                <div className="flex items-baseline">
                  <span className="text-4xl font-medium text-white">
                    ${plan.price}
                  </span>
                  <span className={`ml-1 ${plan.highlighted ? 'text-[#D7EEFC]/80' : 'text-[#D7EEFC]/60'}`}>
                    /user/mo
                  </span>
                </div>
              ) : (
                <div className="text-4xl font-medium text-white">
                  Custom
                </div>
              )}
            </div>

            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className={`group/btn relative block w-full py-3 px-4 text-center text-sm font-medium rounded-full transition-all duration-300 mb-6 overflow-hidden ${
                plan.highlighted
                  ? 'text-[#031663]'
                  : 'text-white'
              }`}
            >
              {plan.highlighted ? (
                <span className="absolute inset-0 bg-white group-hover/btn:bg-[#D7EEFC] transition-colors" />
              ) : (
                <span className="absolute inset-0 bg-gradient-to-r from-[#1861C8] to-[#61AFF9] group-hover/btn:from-[#61AFF9] group-hover/btn:to-[#1861C8] transition-all" />
              )}
              <span className="relative">{plan.cta}</span>
            </a>

            <ul className="space-y-3">
              {plan.features.map((feature, featureIndex) => (
                <li key={featureIndex} className="flex items-start gap-3">
                  <svg
                    className="w-5 h-5 shrink-0 mt-0.5 text-[#61AFF9]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className={`text-sm ${plan.highlighted ? 'text-[#D7EEFC]/90' : 'text-[#D7EEFC]/60'}`}>
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

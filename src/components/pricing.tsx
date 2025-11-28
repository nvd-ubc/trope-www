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
      <div className="flex justify-center mb-10 md:mb-12">
        <div className="inline-flex items-center bg-[#031663]/50 rounded-full p-1 border border-[#1861C8]/20">
          <button
            className={`px-4 sm:px-5 py-2.5 text-sm font-medium rounded-full transition-colors duration-200 ${
              !annual ? 'bg-[#1861C8] text-white' : 'text-[#D7EEFC]/60 hover:text-white'
            }`}
            onClick={() => setAnnual(false)}
          >
            Monthly
          </button>
          <button
            className={`px-4 sm:px-5 py-2.5 text-sm font-medium rounded-full transition-colors duration-200 ${
              annual ? 'bg-[#1861C8] text-white' : 'text-[#D7EEFC]/60 hover:text-white'
            }`}
            onClick={() => setAnnual(true)}
          >
            Yearly <span className="text-[#61AFF9] font-medium ml-1 hidden sm:inline">-20%</span>
          </button>
        </div>
      </div>

      {/* Pricing cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {plans.map((plan, index) => (
          <div
            key={index}
            className={`relative rounded-2xl p-6 transition-colors duration-200 ${
              plan.highlighted
                ? 'bg-gradient-to-b from-[#1861C8]/80 to-[#031663] border border-[#61AFF9]/40'
                : 'bg-[#000E2E]/60 border border-[#1861C8]/20 hover:border-[#1861C8]/40'
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
              <h3 className="text-lg font-semibold text-white mb-1">
                {plan.name}
              </h3>
              <p className="text-sm text-[#D7EEFC]/60">
                {plan.description}
              </p>
            </div>

            <div className="mb-6">
              {plan.price !== null ? (
                <div className="flex items-baseline">
                  <span className="text-3xl md:text-4xl font-bold text-white">
                    ${plan.price}
                  </span>
                  <span className="ml-1 text-[#D7EEFC]/60">
                    /user/mo
                  </span>
                </div>
              ) : (
                <div className="text-3xl md:text-4xl font-bold text-white">
                  Custom
                </div>
              )}
            </div>

            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className={`block w-full py-3 px-4 text-center text-sm font-medium rounded-full transition-colors duration-200 mb-6 ${
                plan.highlighted
                  ? 'bg-white text-[#031663] hover:bg-[#D7EEFC]'
                  : 'bg-[#1861C8] text-white hover:bg-[#61AFF9]'
              }`}
            >
              {plan.cta}
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
                  <span className="text-sm text-[#D7EEFC]/70">
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

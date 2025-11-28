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
        <div className="inline-flex items-center gap-3 bg-gray-100 rounded-full p-1">
          <button
            className={`px-4 py-2 text-sm font-medium rounded-full transition-all ${
              !annual ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
            }`}
            onClick={() => setAnnual(false)}
          >
            Monthly
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium rounded-full transition-all ${
              annual ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
            }`}
            onClick={() => setAnnual(true)}
          >
            Yearly <span className="text-emerald-600 ml-1">-20%</span>
          </button>
        </div>
      </div>

      {/* Pricing cards */}
      <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {plans.map((plan, index) => (
          <div
            key={index}
            className={`rounded-2xl p-6 ${
              plan.highlighted
                ? 'bg-gray-900 text-white ring-2 ring-gray-900'
                : 'bg-white border border-gray-200'
            }`}
            data-aos="fade-up"
            data-aos-delay={index * 100}
          >
            <div className="mb-6">
              <h3 className={`text-lg font-medium mb-1 ${plan.highlighted ? 'text-white' : 'text-gray-900'}`}>
                {plan.name}
              </h3>
              <p className={`text-sm ${plan.highlighted ? 'text-gray-400' : 'text-gray-600'}`}>
                {plan.description}
              </p>
            </div>

            <div className="mb-6">
              {plan.price !== null ? (
                <div className="flex items-baseline">
                  <span className={`text-4xl font-medium ${plan.highlighted ? 'text-white' : 'text-gray-900'}`}>
                    ${plan.price}
                  </span>
                  <span className={`ml-1 ${plan.highlighted ? 'text-gray-400' : 'text-gray-600'}`}>
                    /user/mo
                  </span>
                </div>
              ) : (
                <div className={`text-4xl font-medium ${plan.highlighted ? 'text-white' : 'text-gray-900'}`}>
                  Custom
                </div>
              )}
            </div>

            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className={`block w-full py-3 px-4 text-center text-sm font-medium rounded-full transition-all mb-6 ${
                plan.highlighted
                  ? 'bg-white text-gray-900 hover:bg-gray-100'
                  : 'bg-gray-900 text-white hover:bg-gray-800'
              }`}
            >
              {plan.cta}
            </a>

            <ul className="space-y-3">
              {plan.features.map((feature, featureIndex) => (
                <li key={featureIndex} className="flex items-start gap-3">
                  <svg
                    className={`w-5 h-5 shrink-0 mt-0.5 ${plan.highlighted ? 'text-emerald-400' : 'text-emerald-600'}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className={`text-sm ${plan.highlighted ? 'text-gray-300' : 'text-gray-600'}`}>
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

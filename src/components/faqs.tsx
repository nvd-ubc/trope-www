'use client'

import { useState } from 'react'

export default function Faqs() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  const faqs = [
    {
      question: "Does Trope work with desktop apps like Excel?",
      answer: "Yes! Unlike browser-only tools, Trope is desktop-first. It works natively with Excel, QuickBooks, and other desktop applications on both macOS and Windows—plus all your web apps."
    },
    {
      question: "How is Trope different from Scribe or Tango?",
      answer: "While Scribe and Tango create static guides, Trope creates living workflows that stay fresh. We detect when apps change, provide just-in-time guidance, and let you graduate safe steps into one-click automations."
    },
    {
      question: "What is drift detection?",
      answer: "Drift detection automatically identifies when applications or documents change—like a UI update or a moved spreadsheet column—and flags outdated workflow steps before they cause errors."
    },
    {
      question: "Is my data secure?",
      answer: (
        <>
          Absolutely. Trope uses end-to-end encryption for all workflow data. We're in the process of obtaining SOC2 compliance. Review our{' '}
          <a href="/subprocessors" className="text-gray-900 underline hover:no-underline">
            subprocessors page
          </a>{' '}
          for details.
        </>
      )
    },
    {
      question: "Who is Trope built for?",
      answer: "Trope is ideal for teams with repeatable workflows—finance teams doing monthly closes, support teams handling data entry, IT help desks, and RevOps teams."
    },
    {
      question: "How does automation work?",
      answer: "Trope takes a human-in-the-loop approach. Record a workflow, guide your team with overlays, then promote low-risk steps to one-click automations. Critical steps always require approval."
    }
  ]

  return (
    <section className="py-20 md:py-28 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Section header */}
        <div className="max-w-3xl mx-auto text-center mb-12" data-aos="fade-up">
          <h2 className="text-3xl md:text-4xl font-medium text-gray-900 mb-4">
            Questions & Answers
          </h2>
        </div>

        {/* FAQ Accordion */}
        <div className="max-w-3xl mx-auto space-y-3">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden"
              data-aos="fade-up"
              data-aos-delay={index * 50}
            >
              <button
                onClick={() => toggleFaq(index)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors"
                aria-expanded={openIndex === index}
              >
                <h4 className="font-medium text-gray-900 pr-4">{faq.question}</h4>
                <svg
                  className={`shrink-0 w-5 h-5 text-gray-400 transition-transform duration-200 ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="px-5 pb-5 text-gray-600">
                  {typeof faq.answer === 'string' ? <p>{faq.answer}</p> : <div>{faq.answer}</div>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
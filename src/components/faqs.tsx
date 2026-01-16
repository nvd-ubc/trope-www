'use client'

import { useState } from 'react'

// Individual FAQ item with smooth animation
function FaqItem({
  question,
  answer,
  isOpen,
  onToggle
}: {
  question: string
  answer: React.ReactNode
  isOpen: boolean
  onToggle: () => void
}) {
  return (
    <div className="border-b border-slate-200">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-5 md:py-6 text-left group"
        aria-expanded={isOpen}
      >
        <h4 className="font-semibold text-slate-900 pr-4 text-base md:text-lg">{question}</h4>
        <svg
          className={`shrink-0 w-5 h-5 text-slate-400 transition-transform duration-300 ease-out ${
            isOpen ? 'rotate-180' : ''
          }`}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 7.5L10 12.5L15 7.5"
          />
        </svg>
      </button>
      {/* Grid-based animation for smooth height transitions */}
      <div
        className="grid transition-all duration-300 ease-out"
        style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
      >
        <div className="overflow-hidden">
          <div className="pb-5 md:pb-6 text-slate-600 text-base md:text-lg leading-relaxed max-w-[90%]">
            {typeof answer === 'string' ? <p>{answer}</p> : <div>{answer}</div>}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Faqs() {
  const [openIndex, setOpenIndex] = useState<number | null>(0) // First one open by default

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
          <a href="/subprocessors" className="text-[#1861C8] hover:underline">
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
    <section className="py-16 md:py-24 lg:py-28 bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Section header */}
        <div className="mb-10 md:mb-14">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900">
            Frequently asked questions
          </h2>
        </div>

        {/* FAQ Accordion - clean minimal style */}
        <div className="border-t border-slate-200">
          {faqs.map((faq, index) => (
            <FaqItem
              key={index}
              question={faq.question}
              answer={faq.answer}
              isOpen={openIndex === index}
              onToggle={() => toggleFaq(index)}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

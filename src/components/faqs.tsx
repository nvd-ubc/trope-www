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
      question: "Which apps does Trope support?",
      answer: "Trope is desktop-first and works with macOS and Windows apps like Excel and QuickBooks, plus web-based tools. It’s built for the real mix of systems your teams already use."
    },
    {
      question: "Is Trope available publicly?",
      answer: "Not yet. Trope is in closed beta for operations teams. Request access or use an invite link to join a workspace."
    },
    {
      question: "How does workflow guidance work?",
      answer: "You record a real workflow, Trope generates a guided playbook, and your team follows in-app overlays during each run. Every run is logged for visibility and improvement."
    },
    {
      question: "Is my data secure?",
      answer: (
        <>
          Trope captures workflow context only with explicit permissions and stores artifacts per workspace. Review our{' '}
          <a href="/security" className="text-[#1861C8] hover:underline">
            Security page
          </a>{' '}
          and our{' '}
          <a href="/subprocessors" className="text-[#1861C8] hover:underline">
            subprocessors page
          </a>{' '}
          for details and reach out with any security questions.
        </>
      )
    },
    {
      question: "Can teams share workflows with each other?",
      answer: "Yes. Workflows live in shared workspaces and can be distributed via run links when needed. Admins control who can access each workflow."
    },
    {
      question: "What does onboarding look like?",
      answer: "We help you pick pilot workflows, capture them with your SMEs, then roll out guided runs to the team. Most pilots take a few weeks to validate impact."
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

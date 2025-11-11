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
      answer: "Yes! Unlike browser-only tools, Trope is desktop-first. It works natively with Excel, QuickBooks, and other desktop applications on both macOS and Windows—plus all your web apps. This means you can capture and automate workflows that other tools simply can't reach."
    },
    {
      question: "How is Trope different from Scribe or Tango?",
      answer: "While Scribe and Tango create static guides, Trope creates living workflows that stay fresh. We detect when apps change (drift detection), provide just-in-time guidance right where you work, and let you graduate safe steps into one-click automations with full audit trails. Plus, we work on desktop apps, not just browsers."
    },
    {
      question: "What is drift detection?",
      answer: "Drift detection automatically identifies when applications or documents change—like a UI update or a moved spreadsheet column—and flags outdated workflow steps. Instead of breaking silently, Trope alerts you and proposes fixes to keep your guides accurate and trustworthy."
    },
    {
      question: "Is my data secure?",
      answer: (
        <>
          Absolutely. Trope uses end-to-end encryption for all workflow data during cloud processing. We're currently in the process of obtaining SOC2 compliance to ensure the highest security standards. You can review our list of third-party subprocessors and their security practices on our{' '}
          <a href="/subprocessors" className="text-purple-400 hover:text-purple-300 underline">
            subprocessors page
          </a>
          .
        </>
      )
    },
    {
      question: "Who is Trope built for?",
      answer: "Trope is ideal for SMB teams, mid-market operations, and Enterprise organizations with repeatable workflows—finance and accounting teams doing monthly closes, support teams handling data entry, IT help desks, property managers, and RevOps teams. If your work involves desktop apps and repeated processes, Trope can help."
    },
    {
      question: "How does automation work?",
      answer: "Trope takes a human-in-the-loop approach. You start by recording a workflow, then guide your team with overlays. For low-risk, repetitive steps (like opening a file or filling a field), you can promote them to one-click automations. Critical steps always require approval, and every action is logged for compliance."
    }
  ]

  return (
  <section className="relative">

    {/* Blurred shape */}
    <div className="absolute top-0 -translate-y-1/3 left-1/2 -translate-x-1/2 ml-24 blur-2xl opacity-50 pointer-events-none -z-10" aria-hidden="true">
      <svg xmlns="http://www.w3.org/2000/svg" width="434" height="427">
        <defs>
          <linearGradient id="bs3-a" x1="19.609%" x2="50%" y1="14.544%" y2="100%">
            <stop offset="0%" stopColor="#6366F1" />
            <stop offset="100%" stopColor="#6366F1" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path fill="url(#bs3-a)" fillRule="evenodd" d="m410 0 461 369-284 58z" transform="matrix(1 0 0 -1 -410 427)" />
      </svg>
    </div>

    <div className="max-w-6xl mx-auto px-4 sm:px-6">
      <div className="py-12 md:py-20 border-t [border-image:linear-gradient(to_right,transparent,var(--color-slate-800),transparent)1]">

        {/* Section header */}
        <div className="max-w-3xl mx-auto text-center pb-12 md:pb-20">
          <div>
            <div className="inline-flex font-medium bg-clip-text text-transparent bg-linear-to-r from-purple-500 to-purple-200 pb-3">Common questions</div>
          </div>
          <h2 className="h2 bg-clip-text text-transparent bg-linear-to-r from-slate-200/60 via-slate-200 to-slate-200/60 pb-4">Frequently Asked Questions</h2>
        </div>

        {/* FAQ Accordion */}
        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border border-slate-800 rounded-lg bg-slate-900/50 hover:bg-slate-900/70 transition-colors duration-200"
            >
              <button
                onClick={() => toggleFaq(index)}
                className="w-full flex items-center justify-between p-5 text-left"
                aria-expanded={openIndex === index}
              >
                <h4 className="font-semibold text-slate-50 pr-4">{faq.question}</h4>
                <svg
                  className={`shrink-0 w-5 h-5 text-purple-500 transition-transform duration-200 ${
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
                <div className="px-5 pb-5 text-slate-400">
                  {typeof faq.answer === 'string' ? <p>{faq.answer}</p> : <div>{faq.answer}</div>}
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  </section>
  )
}
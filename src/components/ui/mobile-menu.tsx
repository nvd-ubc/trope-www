'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { CONTACT_EMAIL, SALES_CALL_URL } from '@/lib/constants'
import AuthLink from './header-auth-link'

export default function MobileMenu() {
  const [mobileNavOpen, setMobileNavOpen] = useState<boolean>(false)
  const salesHref = SALES_CALL_URL || `mailto:${CONTACT_EMAIL}`

  const trigger = useRef<HTMLButtonElement>(null)
  const mobileNav = useRef<HTMLDivElement>(null)

  // close the mobile menu on click outside
  useEffect(() => {
    const clickHandler = ({ target }: { target: EventTarget | null }): void => {
      if (!mobileNav.current || !trigger.current) return;
      if (!mobileNavOpen || mobileNav.current.contains(target as Node) || trigger.current.contains(target as Node)) return;
      setMobileNavOpen(false)
    };
    document.addEventListener('click', clickHandler)
    return () => document.removeEventListener('click', clickHandler)
  })

  // close the mobile menu if the esc key is pressed
  useEffect(() => {
    const keyHandler = ({ keyCode }: { keyCode: number }): void => {
      if (!mobileNavOpen || keyCode !== 27) return;
      setMobileNavOpen(false)
    };
    document.addEventListener('keydown', keyHandler)
    return () => document.removeEventListener('keydown', keyHandler)
  })

  const closeNav = () => setMobileNavOpen(false)

  return (
    <div className="md:hidden flex items-center ml-4">
      {/* Hamburger button */}
      <button
        ref={trigger}
        className={`group inline-flex w-8 h-8 text-slate-600 hover:text-slate-900 text-center items-center justify-center transition`}
        aria-controls="mobile-nav"
        aria-expanded={mobileNavOpen}
        onClick={() => setMobileNavOpen(!mobileNavOpen)}
      >
        <span className="sr-only">Menu</span>
        <svg className="w-4 h-4 fill-current pointer-events-none" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
          <rect
            className="origin-center transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.1)] -translate-y-[5px] group-aria-expanded:rotate-[315deg] group-aria-expanded:translate-y-0"
            y="7"
            width="16"
            height="2"
            rx="1"
          />
          <rect
            className="origin-center group-aria-expanded:rotate-45 transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.8)]"
            y="7"
            width="16"
            height="2"
            rx="1"
          />
          <rect
            className="origin-center transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.1)] translate-y-[5px] group-aria-expanded:rotate-[135deg] group-aria-expanded:translate-y-0"
            y="7"
            width="16"
            height="2"
            rx="1"
          />
        </svg>
      </button>

      {/*Mobile navigation */}
      <nav
        id="mobile-nav"
        ref={mobileNav}
        className="absolute top-full z-20 left-0 w-full px-4 sm:px-6 overflow-hidden transition-all duration-300 ease-in-out"
        style={mobileNavOpen ? { maxHeight: mobileNav.current?.scrollHeight, opacity: 1 } : { maxHeight: 0, opacity: 0.8 }}
      >
        <ul className="bg-white border border-slate-200 rounded-xl shadow-lg px-4 py-2">
          <li>
            <Link className="flex font-medium text-sm text-slate-600 hover:text-slate-900 py-2" href="/#features" onClick={closeNav}>
              Product
            </Link>
          </li>
          <li>
            <Link className="flex font-medium text-sm text-slate-600 hover:text-slate-900 py-2" href="/use-cases" onClick={closeNav}>
              Use cases
            </Link>
          </li>
          <li>
            <Link className="flex font-medium text-sm text-slate-600 hover:text-slate-900 py-2" href="/security" onClick={closeNav}>
              Security
            </Link>
          </li>
          <li>
            <Link className="flex font-medium text-sm text-slate-600 hover:text-slate-900 py-2" href="/resources" onClick={closeNav}>
              Resources
            </Link>
          </li>
          <li>
            <Link className="flex font-medium text-sm text-slate-600 hover:text-slate-900 py-2" href="/pricing" onClick={closeNav}>
              Pricing
            </Link>
          </li>
          <li>
            <Link className="flex font-medium text-sm text-slate-600 hover:text-slate-900 py-2" href="/roi" onClick={closeNav}>
              ROI calculator
            </Link>
          </li>
          <li>
            <Link className="flex font-medium text-sm text-slate-600 hover:text-slate-900 py-2" href="/download" onClick={closeNav}>
              Download
            </Link>
          </li>
          <li>
            <Link className="flex font-medium text-sm text-slate-600 hover:text-slate-900 py-2" href="/request-access" onClick={closeNav}>
              Request access
            </Link>
          </li>
          <li>
            <AuthLink className="flex font-medium text-sm text-slate-600 hover:text-slate-900 py-2" onClick={closeNav} />
          </li>
          <li>
            <a className="flex font-medium text-sm text-[#1861C8] hover:text-[#1861C8]/80 py-2" href={salesHref} onClick={closeNav}>
              Talk to sales
            </a>
          </li>
          <li className="border-t border-slate-200 mt-2 pt-2">
            <Link
              className="flex font-semibold text-sm text-white bg-[#1861C8] hover:bg-[#2171d8] py-2 px-4 rounded-full justify-center whitespace-nowrap"
              href="/get-started"
              onClick={closeNav}
            >
              Get started
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  )
}

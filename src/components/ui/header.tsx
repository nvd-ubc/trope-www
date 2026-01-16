import Link from 'next/link'
import Logo from './logo'
import MobileMenu from './mobile-menu'
import { CONTACT_EMAIL } from '@/lib/constants'

export default function Header() {
  return (
    <header className="absolute w-full z-30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 md:h-20">

          {/* Site branding */}
          <div className="flex-1">
            <Logo />
          </div>

          {/* Desktop navigation */}
          <nav className="hidden md:flex md:grow">
            <ul className="flex grow justify-center flex-wrap items-center">
              <li>
                <Link className="font-medium text-sm text-slate-600 hover:text-slate-900 mx-4 lg:mx-5 transition duration-150 ease-in-out" href="/#features">Features</Link>
              </li>
              <li>
                <Link className="font-medium text-sm text-slate-600 hover:text-slate-900 mx-4 lg:mx-5 transition duration-150 ease-in-out" href="/#pricing">Pricing</Link>
              </li>
            </ul>
          </nav>

          {/* Desktop CTA */}
          <ul className="flex-1 flex justify-end items-center">
            <li>
              <Link className="font-medium text-sm text-slate-600 hover:text-slate-900 whitespace-nowrap transition duration-150 ease-in-out" href="/signin">Sign in</Link>
            </li>
            <li className="ml-6">
              <a
                className="group relative inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white rounded-full transition-all duration-300 overflow-hidden hover:-translate-y-0.5"
                href={`mailto:${CONTACT_EMAIL}`}
              >
                <span className="absolute inset-0 bg-gradient-to-r from-[#1861C8] to-[#61AFF9] opacity-90 group-hover:opacity-100 transition-opacity" />
                <span className="relative">Talk to Sales</span>
              </a>
            </li>
          </ul>

          <MobileMenu />

        </div>
      </div>
    </header>
  )
}

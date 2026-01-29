import Link from 'next/link'
import Logo from './logo'
import MobileMenu from './mobile-menu'
import AuthLink from './header-auth-link'

export default function Header() {
  return (
    <header className="absolute w-full z-30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 md:h-20">
          <div className="flex-1">
            <Logo />
          </div>

          <nav className="hidden md:flex md:grow">
            <ul className="flex grow justify-center flex-wrap items-center">
              <li>
                <Link className="font-medium text-sm text-slate-600 hover:text-slate-900 mx-4 lg:mx-5 transition duration-150 ease-in-out" href="/#features">
                  Product
                </Link>
              </li>
              <li>
                <Link className="font-medium text-sm text-slate-600 hover:text-slate-900 mx-4 lg:mx-5 transition duration-150 ease-in-out" href="/use-cases">
                  Use cases
                </Link>
              </li>
              <li>
                <Link className="font-medium text-sm text-slate-600 hover:text-slate-900 mx-4 lg:mx-5 transition duration-150 ease-in-out" href="/security">
                  Security
                </Link>
              </li>
              <li>
                <Link className="font-medium text-sm text-slate-600 hover:text-slate-900 mx-4 lg:mx-5 transition duration-150 ease-in-out" href="/resources">
                  Resources
                </Link>
              </li>
              <li>
                <Link className="font-medium text-sm text-slate-600 hover:text-slate-900 mx-4 lg:mx-5 transition duration-150 ease-in-out" href="/pricing">
                  Pricing
                </Link>
              </li>
            </ul>
          </nav>

          <ul className="flex-1 flex justify-end items-center">
            <li className="hidden lg:block mr-4">
              <Link
                className="font-medium text-sm text-slate-600 hover:text-slate-900 whitespace-nowrap transition duration-150 ease-in-out"
                href="/download"
              >
                Download
              </Link>
            </li>
            <li className="mr-4">
              <AuthLink className="font-medium text-sm text-slate-600 hover:text-slate-900 whitespace-nowrap transition duration-150 ease-in-out" />
            </li>
            <li>
              <Link
                className="group relative inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white rounded-full transition-all duration-300 overflow-hidden hover:-translate-y-0.5"
                href="/get-started"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-[#1861C8] to-[#61AFF9] opacity-90 group-hover:opacity-100 transition-opacity" />
                <span className="relative">Get started</span>
              </Link>
            </li>
          </ul>

          <MobileMenu />
        </div>
      </div>
    </header>
  )
}

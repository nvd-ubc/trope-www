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
                <Link className="font-medium text-sm text-gray-600 hover:text-gray-900 mx-4 lg:mx-5 transition duration-150 ease-in-out" href="/#features">Features</Link>
              </li>
              <li>
                <Link className="font-medium text-sm text-gray-600 hover:text-gray-900 mx-4 lg:mx-5 transition duration-150 ease-in-out" href="/#pricing">Pricing</Link>
              </li>
            </ul>
          </nav>

          {/* Desktop CTA */}
          <ul className="flex-1 flex justify-end items-center">
            <li>
              <Link className="font-medium text-sm text-gray-600 hover:text-gray-900 whitespace-nowrap transition duration-150 ease-in-out" href="/signin">Sign in</Link>
            </li>
            <li className="ml-6">
              <a
                className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-full hover:bg-gray-800 transition duration-150 ease-in-out"
                href={`mailto:${CONTACT_EMAIL}`}
              >
                Talk to Sales
              </a>
            </li>
          </ul>

          <MobileMenu />

        </div>
      </div>
    </header>
  )
}

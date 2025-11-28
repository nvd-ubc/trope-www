import Link from 'next/link'
import Logo from './logo'
import { CONTACT_EMAIL } from '@/lib/constants'

export default function Footer() {
  return (
    <footer className="border-t border-gray-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="py-12 md:py-16">
          {/* Top section */}
          <div className="grid sm:grid-cols-12 gap-8 mb-8">
            {/* Logo and copyright */}
            <div className="sm:col-span-12 lg:col-span-4">
              <div className="mb-4">
                <Logo />
              </div>
              <p className="text-sm text-gray-500">
                Record once, guide forever.
              </p>
            </div>

            {/* Links */}
            <div className="sm:col-span-6 md:col-span-3 lg:col-span-2">
              <h6 className="text-sm text-gray-900 font-medium mb-3">Product</h6>
              <ul className="text-sm space-y-2">
                <li>
                  <Link className="text-gray-600 hover:text-gray-900 transition" href="/#features">Features</Link>
                </li>
                <li>
                  <Link className="text-gray-600 hover:text-gray-900 transition" href="/#pricing">Pricing</Link>
                </li>
              </ul>
            </div>

            <div className="sm:col-span-6 md:col-span-3 lg:col-span-2">
              <h6 className="text-sm text-gray-900 font-medium mb-3">Company</h6>
              <ul className="text-sm space-y-2">
                <li>
                  <a className="text-gray-600 hover:text-gray-900 transition" href={`mailto:${CONTACT_EMAIL}`}>Contact</a>
                </li>
              </ul>
            </div>

            <div className="sm:col-span-6 md:col-span-3 lg:col-span-2">
              <h6 className="text-sm text-gray-900 font-medium mb-3">Legal</h6>
              <ul className="text-sm space-y-2">
                <li>
                  <Link className="text-gray-600 hover:text-gray-900 transition" href="/privacy">Privacy</Link>
                </li>
                <li>
                  <Link className="text-gray-600 hover:text-gray-900 transition" href="/subprocessors">Subprocessors</Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom section */}
          <div className="pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} Trope.ai. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

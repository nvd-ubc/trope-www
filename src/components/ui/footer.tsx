import Link from 'next/link'
import Image from 'next/image'
import { CONTACT_EMAIL } from '@/lib/constants'

export default function Footer() {
  return (
    <footer className="bg-slate-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="py-10 md:py-12">
          {/* Top section */}
          <div className="grid grid-cols-2 sm:grid-cols-12 gap-8 mb-8">
            {/* Logo and tagline */}
            <div className="col-span-2 sm:col-span-12 lg:col-span-4 mb-4 lg:mb-0">
              <div className="mb-3">
                <Link className="inline-flex items-center gap-1" href="/" aria-label="Trope">
                  <Image
                    src="/logo/trope_logomark_dark.svg"
                    alt=""
                    width={24}
                    height={17}
                    className="h-[17px] w-auto"
                  />
                  <Image
                    src="/logo/trope_logotype_dark.svg"
                    alt="Trope"
                    width={80}
                    height={29}
                    className="h-[18px] w-auto"
                  />
                </Link>
              </div>
              <p className="text-sm text-slate-500">
                Record once, guide forever.
              </p>
            </div>

            {/* Links - Product */}
            <div className="col-span-1 sm:col-span-4 lg:col-span-2">
              <h6 className="text-sm text-slate-700 font-medium mb-3">Product</h6>
              <ul className="text-sm space-y-2">
                <li>
                  <Link className="text-slate-500 hover:text-[#1861C8] transition-colors duration-200" href="/#features">Features</Link>
                </li>
                <li>
                  <Link className="text-slate-500 hover:text-[#1861C8] transition-colors duration-200" href="/#pricing">Pricing</Link>
                </li>
              </ul>
            </div>

            {/* Links - Company */}
            <div className="col-span-1 sm:col-span-4 lg:col-span-2">
              <h6 className="text-sm text-slate-700 font-medium mb-3">Company</h6>
              <ul className="text-sm space-y-2">
                <li>
                  <a className="text-slate-500 hover:text-[#1861C8] transition-colors duration-200" href={`mailto:${CONTACT_EMAIL}`}>Contact</a>
                </li>
              </ul>
            </div>

            {/* Links - Legal */}
            <div className="col-span-1 sm:col-span-4 lg:col-span-2">
              <h6 className="text-sm text-slate-700 font-medium mb-3">Legal</h6>
              <ul className="text-sm space-y-2">
                <li>
                  <Link className="text-slate-500 hover:text-[#1861C8] transition-colors duration-200" href="/privacy">Privacy</Link>
                </li>
                <li>
                  <Link className="text-slate-500 hover:text-[#1861C8] transition-colors duration-200" href="/subprocessors">Subprocessors</Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom section */}
          <div className="pt-6 border-t border-slate-200">
            <p className="text-sm text-slate-400">
              © {new Date().getFullYear()} Trope. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

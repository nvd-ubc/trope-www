import Link from 'next/link'
import Image from 'next/image'
import { CONTACT_EMAIL } from '@/lib/constants'

export default function Footer() {
  return (
    <footer className="bg-[#00050F] border-t border-[#1861C8]/10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="py-12 md:py-16">
          {/* Top section */}
          <div className="grid sm:grid-cols-12 gap-8 mb-8">
            {/* Logo and copyright */}
            <div className="sm:col-span-12 lg:col-span-4">
              <div className="mb-4">
                <Link className="inline-flex items-center gap-1" href="/" aria-label="Trope">
                  <Image
                    src="/logo/trope_logomark.svg"
                    alt=""
                    width={24}
                    height={17}
                    className="h-[17px] w-auto"
                  />
                  <Image
                    src="/logo/trope_logotype.svg"
                    alt="Trope"
                    width={80}
                    height={29}
                    className="h-[18px] w-auto"
                  />
                </Link>
              </div>
              <p className="text-sm text-[#D7EEFC]/40">
                Record once, guide forever.
              </p>
            </div>

            {/* Links */}
            <div className="sm:col-span-6 md:col-span-3 lg:col-span-2">
              <h6 className="text-sm text-[#D7EEFC]/80 font-medium mb-3">Product</h6>
              <ul className="text-sm space-y-2">
                <li>
                  <Link className="text-[#D7EEFC]/40 hover:text-[#61AFF9] transition" href="/#features">Features</Link>
                </li>
                <li>
                  <Link className="text-[#D7EEFC]/40 hover:text-[#61AFF9] transition" href="/#pricing">Pricing</Link>
                </li>
              </ul>
            </div>

            <div className="sm:col-span-6 md:col-span-3 lg:col-span-2">
              <h6 className="text-sm text-[#D7EEFC]/80 font-medium mb-3">Company</h6>
              <ul className="text-sm space-y-2">
                <li>
                  <a className="text-[#D7EEFC]/40 hover:text-[#61AFF9] transition" href={`mailto:${CONTACT_EMAIL}`}>Contact</a>
                </li>
              </ul>
            </div>

            <div className="sm:col-span-6 md:col-span-3 lg:col-span-2">
              <h6 className="text-sm text-[#D7EEFC]/80 font-medium mb-3">Legal</h6>
              <ul className="text-sm space-y-2">
                <li>
                  <Link className="text-[#D7EEFC]/40 hover:text-[#61AFF9] transition" href="/privacy">Privacy</Link>
                </li>
                <li>
                  <Link className="text-[#D7EEFC]/40 hover:text-[#61AFF9] transition" href="/subprocessors">Subprocessors</Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom section */}
          <div className="pt-8 border-t border-[#1861C8]/10">
            <p className="text-sm text-[#D7EEFC]/30">
              © {new Date().getFullYear()} Trope.ai. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

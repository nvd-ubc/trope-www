import Logo from './logo'

export default function Footer() {
  return (
    <footer>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">

        {/* Blocks */}
        <div className="grid sm:grid-cols-12 gap-8 py-8 md:py-12">

          {/* 1st block */}
          <div className="sm:col-span-12 lg:col-span-4 order-1 lg:order-none">
            <div className="h-full flex flex-col sm:flex-row lg:flex-col justify-between">
              <div className="mb-4 sm:mb-0">
                <div className="mb-4">
                  <Logo />
                </div>
                <div className="text-sm text-slate-300">© Trope.ai <span className="text-slate-500">-</span> All rights reserved.</div>
                <div className="mt-3 flex items-center gap-2">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 border border-green-500/20">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className="text-xs text-green-400 font-medium">All systems operational</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 2nd block */}
          <div className="sm:col-span-6 md:col-span-3 lg:col-span-2">
            <h6 className="text-sm text-slate-50 font-medium mb-2">Product</h6>
            <ul className="text-sm space-y-2">
              <li>
                <a className="text-slate-400 hover:text-slate-200 transition duration-150 ease-in-out" href="/#features">Features</a>
              </li>
              <li>
                <a className="text-slate-400 hover:text-slate-200 transition duration-150 ease-in-out" href="/#pricing">Pricing</a>
              </li>
              <li>
                <a className="text-slate-400 hover:text-slate-200 transition duration-150 ease-in-out" href="#0">Documentation</a>
              </li>
            </ul>
          </div>

          {/* 3rd block */}
          <div className="sm:col-span-6 md:col-span-3 lg:col-span-2">
            <h6 className="text-sm text-slate-50 font-medium mb-2">Company</h6>
            <ul className="text-sm space-y-2">
              <li>
                <a className="text-slate-400 hover:text-slate-200 transition duration-150 ease-in-out" href="mailto:hello@trope.ai">Contact</a>
              </li>
            </ul>
          </div>

          {/* 4th block */}
          <div className="sm:col-span-6 md:col-span-3 lg:col-span-2">
            <h6 className="text-sm text-slate-50 font-medium mb-2">Resources</h6>
            <ul className="text-sm space-y-2">
              <li>
                <a className="text-slate-400 hover:text-slate-200 transition duration-150 ease-in-out" href="mailto:hello@trope.ai?subject=Help Request">Help Center</a>
              </li>
            </ul>
          </div>

          {/* 5th block */}
          <div className="sm:col-span-6 md:col-span-3 lg:col-span-2">
            <h6 className="text-sm text-slate-50 font-medium mb-2">Legal</h6>
            <ul className="text-sm space-y-2">
              <li>
                <a className="text-slate-400 hover:text-slate-200 transition duration-150 ease-in-out" href="/privacy">Privacy Policy</a>
              </li>
              <li>
                <a className="text-slate-400 hover:text-slate-200 transition duration-150 ease-in-out" href="/subprocessors">Subprocessors</a>
              </li>
            </ul>
          </div>

        </div>

      </div>
    </footer>
  )
}

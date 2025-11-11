export default function Features04() {
  return (
    <section className="relative">
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6">

        {/* Blurred shape */}
        <div className="absolute top-0 -mt-24 left-0 -ml-16 blur-2xl opacity-70 pointer-events-none -z-10" aria-hidden="true">
          <svg xmlns="http://www.w3.org/2000/svg" width="434" height="427">
            <defs>
              <linearGradient id="bs4-a" x1="19.609%" x2="50%" y1="14.544%" y2="100%">
                <stop offset="0%" stopColor="#A855F7" />
                <stop offset="100%" stopColor="#6366F1" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path fill="url(#bs4-a)" fillRule="evenodd" d="m0 0 461 369-284 58z" transform="matrix(1 0 0 -1 0 427)" />
          </svg>
        </div>

        <div className="pt-16 pb-12 md:pt-32 md:pb-20">

          {/* Section header */}
          <div className="max-w-3xl pb-12 md:pb-20">
            <h2 className="h2 bg-clip-text text-transparent bg-linear-to-r from-slate-200/60 via-slate-200 to-slate-200/60 pb-4">Everything you need to scale knowledge</h2>
            <p className="text-lg text-slate-400">From capture to guidance to automation—Trope gives you the full toolkit to eliminate tribal knowledge and keep your team aligned as you grow.</p>
          </div>

          {/* Rows */}
          <div className="divide-y divide-slate-800">
            {/* Row */}
            <div className="py-8 first-of-type:pt-0 last-of-type:pb-0">
              <div>
                <div className="inline-flex font-medium bg-clip-text text-transparent bg-linear-to-r from-purple-500 to-purple-200 pb-6">Capture & Record</div>
              </div>
              <div className="grid md:grid-cols-3 gap-8 md:gap-12 mb-2">
                {/* Feature */}
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <svg className="shrink-0 fill-slate-300" xmlns="http://www.w3.org/2000/svg" width="16" height="16">
                      <path d="M15 2h-2V0h-2v2H9V0H7v2H5V0H3v2H1a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1ZM2 14V6h12v8H2Z" />
                    </svg>
                    <h4 className="font-medium text-slate-50">Browser Recording</h4>
                  </div>
                  <p className="text-sm text-slate-400">Capture clicks, fields, menus, and selections with our Chrome/Edge extension.</p>
                </div>
                {/* Feature */}
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <svg className="shrink-0 fill-slate-300" xmlns="http://www.w3.org/2000/svg" width="16" height="16">
                      <path d="M14 0H2C.9 0 0 .9 0 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V2c0-1.1-.9-2-2-2ZM5 12H3V5h2v7Zm4 0H7V5h2v7Zm4 0h-2V5h2v7Z" />
                    </svg>
                    <h4 className="font-medium text-slate-50">Desktop Capture</h4>
                  </div>
                  <p className="text-sm text-slate-400">Record Excel, desktop apps, window focus, and file operations seamlessly.</p>
                </div>
                {/* Feature */}
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <svg className="shrink-0 fill-slate-300" xmlns="http://www.w3.org/2000/svg" width="16" height="16">
                      <path d="M8 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm0 6a2 2 0 1 1 0-4 2 2 0 0 1 0 4Z" /><path d="M14 0H2C.9 0 0 .9 0 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V2c0-1.1-.9-2-2-2Zm0 14H2V2h12v12Z" />
                    </svg>
                    <h4 className="font-medium text-slate-50">Screenshots</h4>
                  </div>
                  <p className="text-sm text-slate-400">Automatic screenshots at each step for visual reference and verification.</p>
                </div>
              </div>
            </div>
            {/* Row */}
            <div className="py-8">
              <div>
                <div className="inline-flex font-medium bg-clip-text text-transparent bg-linear-to-r from-purple-500 to-purple-200 pb-6">Guide & Train</div>
              </div>
              <div className="grid md:grid-cols-3 gap-8 md:gap-12 mb-2">
                {/* Feature */}
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <svg className="shrink-0 fill-slate-300" xmlns="http://www.w3.org/2000/svg" width="16" height="16">
                      <path d="M2 6H0V2a2 2 0 0 1 2-2h4v2H2v4ZM16 6h-2V2h-4V0h4a2 2 0 0 1 2 2v4ZM14 16h-4v-2h4v-4h2v4a2 2 0 0 1-2 2ZM6 16H2a2 2 0 0 1-2-2v-4h2v4h4v2Z" />
                    </svg>
                    <h4 className="font-medium text-slate-50">In-App Overlays</h4>
                  </div>
                  <p className="text-sm text-slate-400">Show hints and checklists right where users work—no portal switching required.</p>
                </div>
                {/* Feature */}
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <svg className="shrink-0 fill-slate-300" xmlns="http://www.w3.org/2000/svg" width="16" height="16">
                      <path d="M6.974 14c-.3 0-.7-.2-.9-.5l-2.2-3.7-2.1 2.8c-.3.4-1 .5-1.4.2-.4-.3-.5-1-.2-1.4l3-4c.2-.3.5-.4.9-.4.3 0 .6.2.8.5l2 3.3 3.3-8.1c0-.4.4-.7.8-.7s.8.2.9.6l4 8c.2.5 0 1.1-.4 1.3-.5.2-1.1 0-1.3-.4l-3-6-3.2 7.9c-.2.4-.6.6-1 .6Z" />
                    </svg>
                    <h4 className="font-medium text-slate-50">Step-by-Step Guidance</h4>
                  </div>
                  <p className="text-sm text-slate-400">Walk users through complex workflows with contextual help at each step.</p>
                </div>
                {/* Feature */}
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <svg className="shrink-0 fill-slate-300" xmlns="http://www.w3.org/2000/svg" width="16" height="16">
                      <path d="M14 0H2c-.6 0-1 .4-1 1v14c0 .6.4 1 1 1h8l5-5V1c0-.6-.4-1-1-1ZM3 2h10v8H9v4H3V2Z" />
                    </svg>
                    <h4 className="font-medium text-slate-50">Micro-Reviews</h4>
                  </div>
                  <p className="text-sm text-slate-400">15-20 second reviews reinforce learning for changed or error-prone steps.</p>
                </div>
              </div>
            </div>
            {/* Row */}
            <div className="py-8">
              <div>
                <div className="inline-flex font-medium bg-clip-text text-transparent bg-linear-to-r from-purple-500 to-purple-200 pb-6">Automate & Scale</div>
              </div>
              <div className="grid md:grid-cols-3 gap-8 md:gap-12 mb-2">
                {/* Feature */}
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <svg className="shrink-0 fill-slate-300" xmlns="http://www.w3.org/2000/svg" width="16" height="16">
                      <path d="M15.5 11H13a5.022 5.022 0 0 1-3.453-1.4l-1.2 1.607A7.065 7.065 0 0 0 12 12.92v1.586a.5.5 0 0 0 .853.349l3-3A.5.5 0 0 0 15.5 11ZM1 5a5.022 5.022 0 0 1 3.453 1.4l1.205-1.61A7.028 7.028 0 0 0 1 3a1 1 0 1 0 0 2ZM13 5h2.5a.5.5 0 0 0 .354-.853l-3-3A.5.5 0 0 0 12 1.5v1.58a7.032 7.032 0 0 0-4.6 2.72L5 9a5.025 5.025 0 0 1-4 2 1 1 0 0 0 0 2 7.034 7.034 0 0 0 5.6-2.8L9 7a5.025 5.025 0 0 1 4-2Z" />
                    </svg>
                    <h4 className="font-medium text-slate-50">One-Click Actions</h4>
                  </div>
                  <p className="text-sm text-slate-400">Convert safe, repetitive steps into automated actions with a single click.</p>
                </div>
                {/* Feature */}
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <svg className="shrink-0 fill-slate-300" xmlns="http://www.w3.org/2000/svg" width="16" height="16">
                      <path d="M8 0C3.6 0 0 3.6 0 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8Zm0 14c-3.3 0-6-2.7-6-6s2.7-6 6-6 6 2.7 6 6-2.7 6-6 6Zm1-9H7v5h2V5Zm0 6H7v2h2v-2Z" />
                    </svg>
                    <h4 className="font-medium text-slate-50">Human-in-the-Loop</h4>
                  </div>
                  <p className="text-sm text-slate-400">Require approval for risky actions while automating the routine steps.</p>
                </div>
                {/* Feature */}
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <svg className="shrink-0 fill-slate-300" xmlns="http://www.w3.org/2000/svg" width="16" height="16">
                      <path d="M14.6.085 8 2.885 1.4.085c-.5-.2-1.4-.1-1.4.9v11c0 .4.2.8.6.9l7 3c.3.1.5.1.8 0l7-3c.4-.2.6-.5.6-.9v-11c0-1-.9-1.1-1.4-.9ZM2 2.485l5 2.1v8.8l-5-2.1v-8.8Zm12 8.8-5 2.1v-8.7l5-2.1v8.7Z" />
                    </svg>
                    <h4 className="font-medium text-slate-50">Audit Trail</h4>
                  </div>
                  <p className="text-sm text-slate-400">Every automation run is logged with artifacts for compliance and troubleshooting.</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
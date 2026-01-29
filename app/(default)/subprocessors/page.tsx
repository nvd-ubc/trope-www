export const metadata = {
  title: 'Subprocessors - Trope',
  description: 'List of third-party subprocessors used by Trope to provide our services.',
}

export default function Subprocessors() {
  return (
    <section className="relative bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="pt-32 pb-12 md:pt-40 md:pb-20">
          <div className="max-w-3xl mx-auto">
            <article>
              <header className="mb-8 text-center">
                <h1 className="text-4xl md:text-5xl font-bold text-slate-900 pb-4">Trope Subprocessors</h1>
                <p className="text-slate-500">Current as of January 29, 2026</p>
              </header>

              <div className="prose max-w-none">
                <p className="text-lg text-slate-600 mb-8 text-center">
                  Trope uses the following third-party subprocessors to provide our services
                </p>

                <div className="overflow-x-auto">
                  <table className="w-full text-slate-600">
                    <thead>
                      <tr className="border-b border-slate-300">
                        <th className="text-left py-3 px-4 text-slate-900 font-semibold">Name</th>
                        <th className="text-left py-3 px-4 text-slate-900 font-semibold">Purpose</th>
                        <th className="text-left py-3 px-4 text-slate-900 font-semibold">Location</th>
                        <th className="text-left py-3 px-4 text-slate-900 font-semibold">Website</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-slate-200">
                        <td className="py-3 px-4">AWS</td>
                        <td className="py-3 px-4">Cloud infrastructure and hosting services</td>
                        <td className="py-3 px-4">United States, Canada</td>
                        <td className="py-3 px-4">
                          <a href="https://aws.amazon.com" target="_blank" rel="noopener noreferrer" className="text-[#1861C8] hover:underline">
                            aws.amazon.com
                          </a>
                        </td>
                      </tr>
                      <tr className="border-b border-slate-200">
                        <td className="py-3 px-4">Google</td>
                        <td className="py-3 px-4">AI video model services</td>
                        <td className="py-3 px-4">United States, Canada</td>
                        <td className="py-3 px-4">
                          <a href="https://google.com" target="_blank" rel="noopener noreferrer" className="text-[#1861C8] hover:underline">
                            google.com
                          </a>
                        </td>
                      </tr>
                      <tr className="border-b border-slate-200">
                        <td className="py-3 px-4">Vercel</td>
                        <td className="py-3 px-4">Frontend hosting and deployment</td>
                        <td className="py-3 px-4">United States, Canada</td>
                        <td className="py-3 px-4">
                          <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="text-[#1861C8] hover:underline">
                            vercel.com
                          </a>
                        </td>
                      </tr>
                      <tr className="border-b border-slate-200">
                        <td className="py-3 px-4">Cloudflare</td>
                        <td className="py-3 px-4">CDN and security services</td>
                        <td className="py-3 px-4">United States</td>
                        <td className="py-3 px-4">
                          <a href="https://cloudflare.com" target="_blank" rel="noopener noreferrer" className="text-[#1861C8] hover:underline">
                            cloudflare.com
                          </a>
                        </td>
                      </tr>
                      <tr className="border-b border-slate-200">
                        <td className="py-3 px-4">WorkOS</td>
                        <td className="py-3 px-4">Enterprise authentication and SSO</td>
                        <td className="py-3 px-4">United States</td>
                        <td className="py-3 px-4">
                          <a href="https://workos.com" target="_blank" rel="noopener noreferrer" className="text-[#1861C8] hover:underline">
                            workos.com
                          </a>
                        </td>
                      </tr>
                      <tr className="border-b border-slate-200">
                        <td className="py-3 px-4">Sentry</td>
                        <td className="py-3 px-4">Application monitoring and error tracking</td>
                        <td className="py-3 px-4">United States</td>
                        <td className="py-3 px-4">
                          <a href="https://sentry.io" target="_blank" rel="noopener noreferrer" className="text-[#1861C8] hover:underline">
                            sentry.io
                          </a>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </article>
          </div>
        </div>
      </div>
    </section>
  )
}

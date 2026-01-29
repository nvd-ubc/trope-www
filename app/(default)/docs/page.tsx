export const metadata = {
  title: 'Docs - Trope',
  description: 'Documentation for capturing workflows, running guides, and managing workspaces in Trope.',
}

import Link from 'next/link'

const docSections = [
  {
    title: 'Getting started',
    items: [
      'Install the desktop app',
      'Join a workspace',
      'Record your first workflow',
    ],
  },
  {
    title: 'Workflow guidance',
    items: [
      'Generate guides from recordings',
      'Run workflows with overlays',
      'Share a workflow run',
    ],
  },
  {
    title: 'Administration',
    items: [
      'Invite and manage members',
      'Set workflow owners',
      'Review run history',
    ],
  },
  {
    title: 'Best practices',
    items: [
      'Choose pilot workflows',
      'Set review cadences',
      'Maintain workflow health',
    ],
  },
]

export default function DocsPage() {
  return (
    <section className="bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="pt-28 pb-16 md:pt-36 md:pb-20">
          <div className="max-w-3xl">
            <p className="text-[#1861C8] text-sm font-medium mb-4 tracking-wide uppercase">Docs</p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 mb-6">
              Trope documentation
            </h1>
            <p className="text-lg text-slate-600">
              Learn how to capture workflows, publish guidance, and manage your workspace.
            </p>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            {docSections.map((section) => (
              <div key={section.title} className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                <h2 className="text-lg font-semibold text-slate-900">{section.title}</h2>
                <ul className="mt-4 space-y-2 text-sm text-slate-600">
                  {section.items.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#1861C8]" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-12 rounded-3xl border border-slate-200 bg-white px-6 py-8 md:px-10">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-xl font-semibold text-slate-900">Need hands-on guidance?</h3>
                <p className="mt-2 text-sm text-slate-600">
                  We can walk your team through capture and guide design in a live session.
                </p>
              </div>
              <Link
                className="inline-flex items-center justify-center rounded-full bg-[#1861C8] px-5 py-2 text-sm font-semibold text-white hover:bg-[#2171d8]"
                href="/support"
              >
                Contact support
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

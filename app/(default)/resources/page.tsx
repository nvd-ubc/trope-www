export const metadata = {
  title: 'Resources - Trope',
  description:
    'Guides, templates, and playbooks to help teams scale workflow guidance across desktop and web applications.',
}

import Link from 'next/link'
import { RESOURCES } from '@/lib/marketing-content'

export default function ResourcesPage() {
  return (
    <section className="bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="pt-28 pb-16 md:pt-36 md:pb-20">
          <div className="max-w-3xl">
            <p className="text-[#1861C8] text-sm font-medium mb-4 tracking-wide uppercase">Resources</p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 mb-6">
              Guidance for scaling workflow knowledge
            </h1>
            <p className="text-lg text-slate-600">
              Use these playbooks, templates, and briefs to roll out Trope in your organization and keep workflows
              current.
            </p>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            {RESOURCES.map((resource) => (
              <Link
                key={resource.slug}
                href={`/resources/${resource.slug}`}
                className="group rounded-3xl border border-slate-200 bg-slate-50 p-6 transition hover:border-slate-300 hover:bg-white"
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs uppercase tracking-wide text-slate-400">{resource.category}</span>
                  <span className="text-xs text-slate-400">{resource.readTime}</span>
                </div>
                <h2 className="mt-4 text-xl font-semibold text-slate-900 group-hover:text-[#1861C8]">
                  {resource.title}
                </h2>
                <p className="mt-2 text-sm text-slate-600">{resource.summary}</p>
                <div className="mt-4 text-xs text-slate-500">Audience: {resource.audience}</div>
              </Link>
            ))}
          </div>

          <div className="mt-12 rounded-3xl border border-slate-200 bg-slate-50 p-6 md:p-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-xl font-semibold text-slate-900">Need a custom rollout plan?</h3>
                <p className="mt-2 text-sm text-slate-600">
                  We can co-design a pilot, training plan, and change management strategy.
                </p>
              </div>
              <Link
                className="inline-flex items-center justify-center rounded-full bg-[#1861C8] px-5 py-2 text-sm font-semibold text-white hover:bg-[#2171d8]"
                href="/get-started"
              >
                Talk to us
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

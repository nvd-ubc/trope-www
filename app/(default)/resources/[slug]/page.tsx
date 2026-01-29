import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { RESOURCES } from '@/lib/marketing-content'

type Params = {
  slug: string
}

export async function generateStaticParams() {
  return RESOURCES.map((resource) => ({ slug: resource.slug }))
}

export function generateMetadata({ params }: { params: Params }): Metadata {
  const resource = RESOURCES.find((item) => item.slug === params.slug)
  if (!resource) {
    return {
      title: 'Resource - Trope',
      description: 'Explore Trope resources for scaling workflow guidance.',
    }
  }

  return {
    title: `${resource.title} - Trope`,
    description: resource.summary,
  }
}

export default function ResourceDetail({ params }: { params: Params }) {
  const resource = RESOURCES.find((item) => item.slug === params.slug)
  if (!resource) {
    notFound()
  }

  return (
    <section className="bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="pt-28 pb-16 md:pt-36 md:pb-20">
          <Link className="text-sm text-slate-500 hover:text-slate-700" href="/resources">
            ← Back to resources
          </Link>

          <div className="mt-6">
            <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-wide text-slate-400">
              <span>{resource.category}</span>
              <span>•</span>
              <span>{resource.readTime}</span>
              <span>•</span>
              <span>Audience: {resource.audience}</span>
            </div>
            <h1 className="mt-4 text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900">
              {resource.title}
            </h1>
            <p className="mt-4 text-lg text-slate-600">{resource.summary}</p>
          </div>

          <div className="mt-10 space-y-8">
            {resource.sections.map((section) => (
              <div key={section.heading} className="rounded-3xl border border-slate-200 bg-white p-6">
                <h2 className="text-xl font-semibold text-slate-900">{section.heading}</h2>
                <p className="mt-3 text-sm text-slate-600">{section.body}</p>
                {section.bullets && (
                  <ul className="mt-4 space-y-2 text-sm text-slate-600">
                    {section.bullets.map((bullet) => (
                      <li key={bullet} className="flex items-start gap-2">
                        <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#1861C8]" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>

          <div className="mt-12 rounded-3xl border border-slate-200 bg-white px-6 py-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-xl font-semibold text-slate-900">Want help applying this?</h3>
                <p className="mt-2 text-sm text-slate-600">
                  We can adapt this resource to your workflows and rollout plan.
                </p>
              </div>
              <Link
                className="inline-flex items-center justify-center rounded-full bg-[#1861C8] px-5 py-2 text-sm font-semibold text-white hover:bg-[#2171d8]"
                href="/request-access"
              >
                Request access
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

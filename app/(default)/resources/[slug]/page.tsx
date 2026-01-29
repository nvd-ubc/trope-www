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

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params
  const resource = RESOURCES.find((item) => item.slug === slug)
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

export default async function ResourceDetail({ params }: { params: Promise<Params> }) {
  const { slug } = await params
  const resource = RESOURCES.find((item) => item.slug === slug)
  if (!resource) {
    notFound()
  }

  return (
    <section className="relative overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 140% 70% at 50% 0%, rgba(24, 97, 200, 0.10), transparent 62%),
            radial-gradient(ellipse 120% 70% at 15% 65%, rgba(97, 175, 249, 0.10), transparent 60%),
            linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 60%, #F1F5F9 100%)
          `,
        }}
        aria-hidden="true"
      />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6">
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

          {resource.slug === 'roi-model' && (
            <div className="mt-8 rounded-3xl border border-slate-200 bg-white/70 p-6 shadow-sm backdrop-blur-sm">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Try the ROI calculator</h2>
                  <p className="mt-2 text-sm text-slate-600">
                    Prefer to plug in your own numbers? Use the ROI calculator to estimate time savings, faster onboarding,
                    and reduced rework.
                  </p>
                </div>
                <Link
                  className="inline-flex items-center justify-center rounded-full bg-[#1861C8] px-5 py-2 text-sm font-semibold text-white hover:bg-[#2171d8]"
                  href="/roi"
                >
                  Open ROI calculator →
                </Link>
              </div>
            </div>
          )}

          <div className="mt-10 space-y-10">
            {resource.sections.map((section) => (
              <section key={section.heading}>
                <h2 className="text-2xl font-semibold text-slate-900">{section.heading}</h2>
                <ResourceParagraphs body={section.body} />
                {section.bullets && (
                  <ul className="mt-4 space-y-2 text-sm text-slate-600 sm:text-base">
                    {section.bullets.map((bullet) => (
                      <li key={bullet} className="flex items-start gap-3">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#1861C8]" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </div>

          <div className="mt-14 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
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

function ResourceParagraphs({ body }: { body: string }) {
  return (
    <>
      {body
        .split('\n\n')
        .filter(Boolean)
        .map((paragraph, index) => (
          <p
            // eslint-disable-next-line react/no-array-index-key
            key={index}
            className={`text-sm leading-relaxed text-slate-600 sm:text-base ${index === 0 ? 'mt-3' : 'mt-4'}`}
          >
            {paragraph}
          </p>
        ))}
    </>
  )
}

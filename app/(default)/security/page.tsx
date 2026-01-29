export const metadata = {
  title: 'Security - Trope',
  description:
    'Learn how Trope separates on-device capture from cloud processing and keeps workflow access controlled.',
}

import Link from 'next/link'
import { SECURITY_EMAIL } from '@/lib/constants'

export default function SecurityPage() {
  return (
    <section className="relative overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 120% 70% at 10% 0%, rgba(97, 175, 249, 0.18), transparent 55%),
            radial-gradient(ellipse 120% 70% at 90% 70%, rgba(24, 97, 200, 0.10), transparent 60%),
            linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 55%, #F1F5F9 100%)
          `,
        }}
        aria-hidden="true"
      />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
        <div className="pt-28 pb-16 md:pt-36 md:pb-20">
          <div className="max-w-3xl">
            <p className="text-[#1861C8] text-sm font-medium mb-4 tracking-wide uppercase">Security</p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 mb-6">
              Built for trusted, controlled workflows
            </h1>
            <p className="text-lg text-slate-600">
              Trope is designed to keep desktop capture explicit and cloud access scoped to workspaces. We focus on
              permissioned access, clear boundaries, and auditability.
            </p>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
              <h2 className="text-2xl font-semibold text-slate-900">Security at a glance</h2>
              <p className="mt-3 text-sm text-slate-600 sm:text-base">
                Trope supports teams that run sensitive workflows in desktop apps and legacy systems. Our approach starts
                with explicit capture permissions, then scopes access to workspace membership and roles.
              </p>
              <div className="mt-6 grid gap-5">
                <Principle
                  title="Permissioned capture"
                  description="Capture starts when a user starts it and can be stopped at any time."
                  icon={<IconMousePointer className="h-5 w-5" />}
                />
                <Principle
                  title="Workspace isolation"
                  description="Workflow artifacts live in a workspace and access is controlled through membership and invites."
                  icon={<IconUsers className="h-5 w-5" />}
                />
                <Principle
                  title="Auditability"
                  description="Runs produce history and logs to support QA, coaching, and compliance needs."
                  icon={<IconFileCheck className="h-5 w-5" />}
                />
                <Principle
                  title="Data minimization"
                  description="Teams can set capture guidelines and keep highly sensitive moments out of shared workflows."
                  icon={<IconShieldCheck className="h-5 w-5" />}
                />
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
              <h2 className="text-2xl font-semibold text-slate-900">Enterprise readiness</h2>
              <p className="mt-3 text-sm text-slate-600 sm:text-base">
                We support security reviews with documentation and clear answers. For customers with residency requirements,
                we can discuss region posture (including Canada) and any relevant constraints.
              </p>
              <div className="mt-6 space-y-3 text-sm text-slate-600 sm:text-base">
                <div className="flex items-start gap-3">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#1861C8]" />
                  <span>
                    Prefer a narrative overview? Read the{' '}
                    <Link className="text-[#1861C8] hover:text-[#2171d8]" href="/resources/security-overview">
                      Security overview
                    </Link>
                    .
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#1861C8]" />
                  <span>
                    See our{' '}
                    <Link className="text-[#1861C8] hover:text-[#2171d8]" href="/subprocessors">
                      subprocessors
                    </Link>
                    .
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#1861C8]" />
                  <span>
                    We can support vendor questionnaires and share additional security artifacts under NDA during procurement.
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 rounded-3xl border border-slate-200 bg-white px-6 py-8 shadow-sm md:px-10">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Have security questions?</h2>
                <p className="mt-2 text-sm text-slate-600">
                  We can share a security review package and walk through your requirements with your security team.
                </p>
              </div>
              <a
                className="inline-flex items-center justify-center rounded-full bg-[#1861C8] px-5 py-2 text-sm font-semibold text-white hover:bg-[#2171d8]"
                href={`mailto:${SECURITY_EMAIL}`}
              >
                Contact security
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Principle({
  title,
  description,
  icon,
}: {
  title: string
  description: string
  icon: React.ReactNode
}) {
  return (
    <div className="flex items-start gap-4">
      <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#1861C8]/10 ring-1 ring-[#1861C8]/15 text-[#1861C8]">
        {icon}
      </div>
      <div>
        <div className="text-sm font-semibold text-slate-900">{title}</div>
        <div className="mt-1 text-sm text-slate-600">{description}</div>
      </div>
    </div>
  )
}

function IconMousePointer(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 20 4 4l16 8-6 2-2 6Z" />
      <path d="M14 14 20 20" />
    </svg>
  )
}

function IconUsers(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <path d="M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}

function IconFileCheck(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M14 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7l-5-5Z" />
      <path d="M14 2v5h5" />
      <path d="m9.5 13 1.6 1.6 3.9-3.9" />
    </svg>
  )
}

function IconShieldCheck(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 2 19 5v6c0 5-3 9-7 11C8 20 5 16 5 11V5l7-3Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  )
}

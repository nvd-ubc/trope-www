export const metadata = {
  title: 'About Trope',
  description: 'Learn how Trope helps teams turn brittle workflows into reliable, guided operations.',
}

export default function About() {
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
            <p className="text-[#1861C8] text-sm font-medium tracking-wide uppercase mb-4">About Trope</p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 leading-tight">
              We help teams turn brittle workflows into reliable, guided operations.
            </h1>
            <p className="mt-5 text-base md:text-lg text-slate-600">
              Trope is built for the messy, high-stakes work that happens inside desktop apps and legacy systems. We make it
              easy to capture what experts do once, then guide every teammate through the same workflow with confidence.
            </p>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
              <h2 className="text-2xl md:text-3xl font-semibold text-slate-900">Why we exist</h2>
              <p className="mt-4 text-slate-600 leading-relaxed">
                Every team has workflows that are critical but fragile: month-end close, onboarding, audits, claims processing,
                reconciliation, and more. The best knowledge lives in people&apos;s heads, and the cost of mistakes is high. Trope
                captures that expertise and turns it into living guides that evolve as software changes.
              </p>
              <p className="mt-4 text-slate-600 leading-relaxed">
                We believe operational excellence is a competitive advantage, and that the tools used by operations teams
                deserve the same innovation as developer tooling.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
              <h2 className="text-2xl font-semibold text-slate-900">What we optimize for</h2>
              <div className="mt-6 grid gap-5">
                <Principle
                  title="Reliability over hype"
                  description="Guides must keep working as apps change."
                  icon={<IconCheck className="h-5 w-5" />}
                />
                <Principle
                  title="Desktop-first"
                  description="We meet teams inside the software they already use."
                  icon={<IconMonitor className="h-5 w-5" />}
                />
                <Principle
                  title="Governance by default"
                  description="Ownership, audit, and compliance are core."
                  icon={<IconShieldCheck className="h-5 w-5" />}
                />
                <Principle
                  title="Human-in-the-loop"
                  description="We guide, validate, and reduce risk."
                  icon={<IconUserCheck className="h-5 w-5" />}
                />
              </div>
            </div>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#1861C8]/10 ring-1 ring-[#1861C8]/15 text-[#1861C8]">
                <IconUsers className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-slate-900">Built for teams</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Trope is a team platform with workspaces, roles, audit trails, and operational reporting so leaders can scale
                knowledge across the org.
              </p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#1861C8]/10 ring-1 ring-[#1861C8]/15 text-[#1861C8]">
                <IconCloudDesktop className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-slate-900">Desktop + cloud</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Capture and run workflows on macOS and Windows. Manage governance and visibility in the cloud dashboard.
              </p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#1861C8]/10 ring-1 ring-[#1861C8]/15 text-[#1861C8]">
                <IconRocket className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-slate-900">Partner-led pilots</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                We run targeted pilots with teams who have high-volume, high-cost workflows. If you&apos;re exploring a pilot,
                we&apos;ll build the rollout plan together.
              </p>
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

function IconCheck(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}

function IconMonitor(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4 5h16v11H4V5Z" />
      <path d="M8 21h8" />
      <path d="M12 16v5" />
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

function IconUserCheck(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <path d="M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
      <path d="m16 11 2 2 4-4" />
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

function IconCloudDesktop(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M7 18h10a4 4 0 0 0 .8-7.92A6 6 0 0 0 6.2 9.9 3.5 3.5 0 0 0 7 18Z" />
      <path d="M8 21h8" />
      <path d="M12 18v3" />
    </svg>
  )
}

function IconRocket(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M14 4c3.2 0 6 2.8 6 6 0 6-7 10-10 10-1.3 0-3.4-.8-5-2.4S2.6 14 4 12c0-3 4-10 10-10Z" />
      <path d="M9 15l-4 4" />
      <path d="M8 19l-3 1 1-3" />
      <path d="M15 9h.01" />
    </svg>
  )
}

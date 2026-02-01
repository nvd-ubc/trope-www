export const metadata = {
  title: 'Status - Trope',
  description: 'Service status for Trope Cloud and the desktop apps.',
}

const services = [
  { name: 'Trope Cloud API', status: 'Operational' },
  { name: 'Workflow processing', status: 'Operational' },
  { name: 'Share links', status: 'Operational' },
  { name: 'Desktop sync', status: 'Operational' },
]

export default function StatusPage() {
  return (
    <section className="bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="pt-28 pb-16 md:pt-36 md:pb-20">
          <p className="text-[#1861C8] text-sm font-medium mb-4 tracking-wide uppercase">Status</p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            All systems operational
          </h1>
          <p className="text-lg text-slate-600">
            This page summarizes service availability for Trope Cloud and the desktop apps.
          </p>

          <div className="mt-10 space-y-4">
            {services.map((service) => (
              <div key={service.name} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-5 py-4">
                <span className="text-sm font-medium text-slate-900">{service.name}</span>
                <span className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-700">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  {service.status}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
            If you are experiencing an issue, please contact support or your Trope administrator.
          </div>
        </div>
      </div>
    </section>
  )
}

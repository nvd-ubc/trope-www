export const metadata = {
  title: 'Release Notes - Trope',
  description: 'Product updates for Trope desktop workflow guidance.',
}

import { RELEASE_NOTES } from '@/lib/marketing-content'

export default function ReleaseNotesPage() {
  return (
    <section className="bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="pt-28 pb-16 md:pt-36 md:pb-20">
          <p className="text-[#1861C8] text-sm font-medium mb-4 tracking-wide uppercase">Release notes</p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Product updates
          </h1>
          <p className="text-lg text-slate-600">
            The latest improvements across Trope Cloud and the desktop apps.
          </p>

          <div className="mt-10 space-y-6">
            {RELEASE_NOTES.map((note) => (
              <div key={note.title} className="rounded-3xl border border-slate-200 bg-white p-6">
                <div className="text-xs uppercase tracking-wide text-slate-400">{note.date}</div>
                <h2 className="mt-2 text-xl font-semibold text-slate-900">{note.title}</h2>
                <p className="mt-2 text-sm text-slate-600">{note.summary}</p>
                <ul className="mt-4 space-y-2 text-sm text-slate-600">
                  {note.bullets.map((bullet) => (
                    <li key={bullet} className="flex items-start gap-2">
                      <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#1861C8]" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

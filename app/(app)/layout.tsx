import Link from 'next/link'

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/" className="text-lg font-semibold text-slate-900">
            Trope
          </Link>
          <nav className="flex items-center gap-4 text-sm text-slate-600">
            <Link className="hover:text-slate-900" href="/dashboard">
              Dashboard
            </Link>
          </nav>
        </div>
      </header>
      <main className="grow bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          {children}
        </div>
      </main>
    </>
  )
}

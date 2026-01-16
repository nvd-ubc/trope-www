export const metadata = {
  title: 'Returning to Trope…',
  description: 'Finish signing in to Trope Cloud and return to the Trope app.',
}

export const dynamic = 'force-dynamic'

import AuthLogo from '../../auth-logo'
import DesktopCompleteClient from './desktop-complete-client'

type DesktopCompleteSearchParams = {
  callback?: string
}

const toSingle = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value)

export default function DesktopComplete({ searchParams }: { searchParams?: DesktopCompleteSearchParams }) {
  const callback = toSingle(searchParams?.callback) ?? ''

  return (
    <>
      <div className="max-w-3xl mx-auto text-center pb-8">
        <AuthLogo />
        <h1 className="text-2xl md:text-3xl font-medium text-slate-900">Signed in</h1>
        <p className="mt-3 text-sm text-slate-600">
          Trope Cloud sign-in succeeded. We’re sending you back to the Trope app now.
        </p>
      </div>

      <div className="max-w-sm mx-auto">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <DesktopCompleteClient callback={callback} />
        </div>
      </div>
    </>
  )
}


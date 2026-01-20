export const metadata = {
  title: 'Download Trope',
  description: 'Download the Trope desktop apps for macOS and Windows.',
}

const macDownloadUrl = process.env.NEXT_PUBLIC_TROPE_MAC_DOWNLOAD_URL?.trim() || ''
const windowsDownloadUrl = process.env.NEXT_PUBLIC_TROPE_WINDOWS_DOWNLOAD_URL?.trim() || ''

const DownloadCard = ({
  title,
  description,
  href,
}: {
  title: string
  description: string
  href: string
}) => {
  const disabled = !href
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      <p className="mt-2 text-sm text-slate-600">{description}</p>
      {disabled ? (
        <div className="mt-4 rounded-full border border-slate-200 px-4 py-2 text-center text-sm font-semibold text-slate-400">
          Contact support for access
        </div>
      ) : (
        <a
          className="mt-4 inline-flex w-full justify-center rounded-full bg-[#1861C8] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2171d8]"
          href={href}
          rel="noreferrer"
          target="_blank"
        >
          Download
        </a>
      )}
    </div>
  )
}

export default function DownloadPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <div className="text-center">
        <h1 className="text-3xl font-semibold text-slate-900">Download Trope</h1>
        <p className="mt-3 text-sm text-slate-600">
          Choose the installer for your platform. If you don&apos;t see a link yet, your Trope
          admin can share it during onboarding.
        </p>
      </div>
      <div className="mt-10 grid gap-6 md:grid-cols-2">
        <DownloadCard
          title="Trope for macOS"
          description="Best for teams using macOS desktops and browser workflows."
          href={macDownloadUrl}
        />
        <DownloadCard
          title="Trope for Windows"
          description="Install the Windows app to run Trope workflows locally."
          href={windowsDownloadUrl}
        />
      </div>
    </div>
  )
}

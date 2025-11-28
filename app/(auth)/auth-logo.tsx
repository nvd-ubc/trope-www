import Link from 'next/link'

export default function AuthLogo() {
  return (
    <div className="mb-8">
      <Link className="inline-flex items-center gap-2" href="/">
        <div className="relative w-10 h-10 flex items-center justify-center bg-gray-900 rounded-xl">
          <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="currentColor" fillOpacity="0.2"/>
            <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <span className="text-xl font-bold text-gray-900">Trope</span>
      </Link>
    </div>
  )
}
import Link from 'next/link'

export default function Logo() {
  return (
    <Link className="inline-flex items-center gap-2 group" href="/" aria-label="Trope">
      {/* Icon */}
      <div className="relative w-8 h-8 flex items-center justify-center">
        <div className="absolute inset-0 bg-gray-900 rounded-lg" />
        <svg className="relative w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="currentColor" fillOpacity="0.2"/>
          <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      {/* Text */}
      <span className="text-xl font-bold text-gray-900">
        Trope
      </span>
    </Link>
  )
}
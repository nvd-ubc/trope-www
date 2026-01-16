import Link from 'next/link'
import Image from 'next/image'

export default function AuthLogo() {
  return (
    <div className="mb-8">
      <Link className="inline-flex items-center gap-1" href="/">
        {/* Logomark */}
        <Image
          src="/logo/trope_logomark_dark.svg"
          alt=""
          width={28}
          height={20}
          className="h-[20px] w-auto"
        />
        {/* Logotype */}
        <Image
          src="/logo/trope_logotype_dark.svg"
          alt="Trope"
          width={90}
          height={33}
          className="h-[22px] w-auto"
        />
      </Link>
    </div>
  )
}
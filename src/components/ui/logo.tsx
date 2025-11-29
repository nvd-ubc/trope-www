import Link from 'next/link'
import Image from 'next/image'

export default function Logo() {
  return (
    <Link className="inline-flex items-center gap-1" href="/" aria-label="Trope">
      {/* Logomark */}
      <Image
        src="/logo/trope_logomark.svg"
        alt=""
        width={24}
        height={17}
        className="h-[17px] w-auto"
      />
      {/* Logotype */}
      <Image
        src="/logo/trope_logotype.svg"
        alt="Trope"
        width={80}
        height={29}
        className="h-[18px] w-auto"
      />
    </Link>
  )
}
import Image from 'next/image'
import Link from 'next/link'

export function Logo({ light = false }: { light?: boolean }) {
  return <Link href="/" className={`brand-logo ${light ? 'brand-logo-light' : ''}`} aria-label="Bilal Broast home"><Image src="/bilal-broast-brand.png" alt="Bilal Broast" width={160} height={106} className="brand-logo-image" /></Link>
}

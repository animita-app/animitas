'use client'

import Link from 'next/link'

export function TopHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 z-30">
      <div className="w-full flex h-16 items-center justify-between p-4">
        <Link href="/" className="text-sm text-neutral-900">
          [ÁNIMA]
        </Link>
      </div>
    </header>
  )
}

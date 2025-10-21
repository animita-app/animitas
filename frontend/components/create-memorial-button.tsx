'use client'

import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Link from 'next/link';

export function CreateMemorialButton() {
  const pathname = usePathname();

  if (pathname.startsWith("/create-memorial") || pathname.startsWith("/auth")) return null;

  return (
    <Button className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[999] bg-black text-white hover:bg-black/80" asChild>
      <Link href="/create-memorial">
        + Crear Animita
      </Link>
    </Button>
  )
}

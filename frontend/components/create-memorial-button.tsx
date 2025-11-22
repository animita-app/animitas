'use client'

import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus } from 'lucide-react'

export function CreateMemorialButton() {
  const pathname = usePathname()


  if (pathname.startsWith('/create-memorial')) return null

  return (
    <></>
    // <Button
    //   size="icon-lg"
    //   className="!hidden! absolute [&_svg]:!size-8 size-12 bottom-4 right-4 z-[999] bg-black text-white hover:bg-black/80"
    //   asChild
    // >
    //   <Link href="/create-memorial">
    //     <Plus />
    //     <span className="sr-only">Crear Animita</span>
    //   </Link>
    // </Button>
  )
}

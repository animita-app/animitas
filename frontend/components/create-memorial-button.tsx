'use client'

import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'

export function CreateMemorialButton() {
  const pathname = usePathname()
  const { isAuthenticated, loading } = useAuth()

  if (pathname.startsWith('/create-memorial') || pathname.startsWith('/auth')) return null
  if (loading) return null
  if (!isAuthenticated) return null

  return (
    <Button
      size="icon-lg"
      className="absolute [&_svg]:!size-8 size-12 bottom-4 right-4 z-[999] bg-black text-white hover:bg-black/80"
      asChild
    >
      <Link href="/create-memorial">
        <Plus />
        <span className="sr-only">Crear Animita</span>
      </Link>
    </Button>
  )
}

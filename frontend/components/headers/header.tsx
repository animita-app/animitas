"use client"

import Link from 'next/link'
import { usePathname, useSelectedLayoutSegment } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useUser } from '@/contexts/user-context'
import { cn } from '@/lib/utils'
import { UserDropdown } from './user-dropdown'
import { MainHeaderPanel } from './main-header-panel'

export function Header() {
  const { currentUser, isLoading } = useUser()
  const pathname = usePathname()
  const modalSegment = useSelectedLayoutSegment('modal')
  const isAnimitaSheet = modalSegment?.startsWith('(.)animita') ?? false

  if ((pathname.startsWith('/animita') && !isAnimitaSheet) || pathname.startsWith('/explore')) return null

  const isMapRoute = isAnimitaSheet || ['/', '/map', '/list', '/add', '/auth'].includes(pathname)

  return (
    <header className={cn(
      isMapRoute ? "fixed" : "sticky",
      "top-0 left-0 right-0 z-50 pointer-events-none w-full",
    )}>
      <div className="bg-transparent flex items-center justify-between p-4 w-full h-14 pointer-events-auto">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-medium active:scale-100 gap-1 [&_svg]:opacity-50 px-2.5 text-text-strong font-ibm-plex-mono slashed-zero">
            [ÁNIMA]
          </Link>
        </div>

        {isMapRoute && (
          <div className="fixed inset-x-0 bottom-safe flex justify-center md:absolute md:inset-x-auto md:bottom-auto md:left-1/2 md:-translate-x-1/2">
            <MainHeaderPanel />
          </div>
        )}

        <div className="flex items-center gap-3">
          {isLoading ? (
            <div className="w-8 h-8" />
          ) : currentUser ? (
            <UserDropdown />
          ) : (
            <Button size="sm" asChild>
              <Link href="/auth">
                Únete
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}

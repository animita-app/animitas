"use client"

import Link from 'next/link'
import Image from 'next/image'
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

  if (pathname.startsWith('/animita') && !isAnimitaSheet) return null

  const isMapRoute = isAnimitaSheet || ['/', '/map', '/list', '/add', '/auth'].includes(pathname)

  return (
    <header className={cn(
      isMapRoute ? "fixed" : "sticky",
      "top-0 left-0 right-0 z-50 pointer-events-none w-full",
    )}>
      <div className="bg-transparent flex items-center justify-between p-4 w-full h-14 pointer-events-auto">
        <div className="flex items-center gap-6">
          <Link href="/map" className="group flex items-end gap-2 rounded-md font-medium text-text-strong font-ibm-plex-mono slashed-zero outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50">
            <Image src="/cutouts/chapel.png" alt="" width={48} height={84} className="h-10 w-auto drop-shadow-[0_2px_2px_rgb(28_24_20_/_0.35)] transition-transform duration-200 ease-out group-hover:-rotate-3 motion-reduce:transition-none" />
            <span className="pb-0.5">[ÁNIMA]</span>
          </Link>
        </div>

        {isMapRoute && (
          <div className="fixed inset-x-0 bottom-safe flex justify-center">
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

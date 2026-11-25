"use client"

import Link from 'next/link'
import { usePathname, useSelectedLayoutSegment } from 'next/navigation'
import { ShelfObject } from '@/components/shelf-object'
import { RoadSignSearch } from '@/components/search/road-sign-search'
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
  // Adding an animita on its own page is a full-screen form with its own Cancelar; nothing else on top.
  if (pathname === '/add' && !modalSegment) return null

  // The shelf (map, añadir, animitas) is the way around, so it stays on every page that has the header:
  // the profile and credits too, not only the map and the list.
  const isMapRoute = isAnimitaSheet || ['/', '/map', '/list', '/add', '/auth'].includes(pathname)
  const showShelf = isMapRoute || pathname.startsWith('/@') || pathname.startsWith('/profile') || pathname === '/creditos'

  return (
    <header className={cn(
      isMapRoute ? "fixed" : "sticky",
      "top-0 left-0 right-0 z-50 pointer-events-none w-full",
    )}>
      <div className="flex items-start justify-between p-4 w-full pointer-events-none [&>*]:pointer-events-auto">
        <RoadSignSearch />

        {showShelf && (
          <div className="pointer-events-none! fixed inset-x-0 bottom-safe isolate flex justify-center before:pointer-events-none before:absolute before:inset-x-0 before:-top-20 before:-bottom-8 before:-z-10 before:bg-linear-to-t before:from-background before:via-background/85 before:to-transparent">
            <MainHeaderPanel />
          </div>
        )}

        <div className="flex items-center gap-3">
          {isLoading ? (
            <div className="w-8 h-8" />
          ) : currentUser ? (
            <UserDropdown />
          ) : (
            <div className="shelf shelf-top">
              {/* The key hangs in the top right corner, so it grows out of that corner. */}
              <Link href="/auth" aria-label="Entrar" style={{ transformOrigin: '100% 0' }} className="shelf-item relative flex rounded-md outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50">
                <ShelfObject src="/cutouts/key.png" label="entrar" size="h-7 -rotate-12" active orbit={{ radius: 92, angle: 130, clockwise: false }} />
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

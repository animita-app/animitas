"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useUser } from '@/contexts/user-context'
import { cn } from '@/lib/utils'
import { UserDropdown } from './user-dropdown'
import { MainHeaderPanel } from './main-header-panel'

export function Header() {
  const { currentUser, isLoading } = useUser()
  const pathname = usePathname()

  if (pathname.includes("animita")) return null

  const isMapRoute = pathname === '/' || pathname === '/map' || pathname === '/list' || pathname === '/add' || pathname === '/auth'

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
          <div className="absolute left-1/2 -translate-x-1/2">
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

"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { Plus } from 'lucide-react'
import { useUser } from '@/contexts/user-context'
import { cn } from '@/lib/utils'
import { UserDropdown } from './user-dropdown'
import { MainHeaderPanel } from './main-header-panel'

interface HeaderProps {
  className?: string
}

export function Header({ className }: HeaderProps) {
  const { currentUser, isEditor, isSuperadmin, isLoading } = useUser()
  const pathname = usePathname()

  // Hide header on animita detail views
  if (pathname.includes("animita")) return null

  return (
    <header className={cn("fixed top-0 left-0 right-0 z-50 pointer-events-none w-full", className)}>
      <div className="bg-transparent flex items-center justify-between p-4 w-full h-16 pointer-events-auto">
        {/* Left: Logo */}
        <div className="flex items-center gap-6">
          <Link href="/" className="font-medium active:scale-100 gap-1 [&_svg]:opacity-50 px-2.5 text-text-strong font-ibm-plex-mono slashed-zero">
            [ÁNIMA]
          </Link>
        </div>

        {/* Center: Tabs + Filters/Search */}
        <div className="absolute left-1/2 -translate-x-1/2">
          <MainHeaderPanel />
        </div>

        {/* Right: Role links + user actions */}
        <div className="flex items-center gap-3">
          {(isEditor || isSuperadmin) && (
            <NavigationMenu className="hidden md:flex">
              <NavigationMenuList>
                {isEditor && (
                  <NavigationMenuItem>
                    <NavigationMenuLink
                      href="/editor"
                      className={cn(
                        navigationMenuTriggerStyle(),
                        "font-medium bg-transparent hover:bg-transparent focus:bg-transparent active:bg-transparent data-[active]:bg-transparent data-[state=open]:bg-transparent",
                        pathname.startsWith("/editor") && "text-text-strong"
                      )}
                    >
                      Revisión
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                )}

                {isSuperadmin && (
                  <NavigationMenuItem>
                    <NavigationMenuLink
                      href="/admin"
                      className={cn(
                        navigationMenuTriggerStyle(),
                        "font-medium bg-transparent hover:bg-transparent focus:bg-transparent active:bg-transparent data-[active]:bg-transparent data-[state=open]:bg-transparent",
                        pathname.startsWith("/admin") && "text-text-strong"
                      )}
                    >
                      Admin
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                )}
              </NavigationMenuList>
            </NavigationMenu>
          )}

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

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

interface HeaderProps {
  className?: string
}

const MAIN_VIEWS = [
  { label: 'Mapa', href: '/map' },
  { label: 'Lista', href: '/list' },
]

export function Header({ className }: HeaderProps) {
  const { currentUser, isEditor, isSuperadmin } = useUser()
  const pathname = usePathname()
  const isUpdating = pathname.includes("add")

  // Don't show header inside the specific animita detail views so it doesn't overlap the detail page.
  if (pathname.includes("animita")) return null

  return (
    <header className={cn("fixed top-0 left-0 right-0 z-50 pointer-events-none w-full", className)}>
      <div className="bg-transparent flex items-center justify-between p-4 w-full h-16 pointer-events-auto">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-6">
            <Link href="/" className="font-medium active:scale-100 gap-1 [&_svg]:opacity-50 px-2.5 text-text-strong font-ibm-plex-mono slashed-zero">
              [ÁNIMA]
            </Link>

            {!isUpdating && (
              <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 bg-background/50 backdrop-blur-md border border-border-weak rounded-full p-1 gap-1">
                {MAIN_VIEWS.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Button
                      key={item.href}
                      variant="ghost"
                      size="sm"
                      asChild
                      className={cn(
                        "rounded-full h-8 px-5 transition-all",
                        isActive
                          ? "bg-background shadow-sm text-text-strong"
                          : "text-text-weak hover:text-text-strong hover:bg-transparent"
                      )}
                    >
                      <Link href={item.href}>{item.label}</Link>
                    </Button>
                  )
                })}
              </div>
            )}

            {!isUpdating && (
              <NavigationMenu className="hidden md:flex ml-4">
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
          </div>
        </div>

        <div className="flex items-center gap-3">
          {currentUser ? (
            <>
              <Button size="sm" className="!pl-2 gap-1" asChild>
                <Link href="/add">
                  <Plus />
                  Añadir
                </Link>
              </Button>

              <UserDropdown />
            </>
          ) : (
            <Button size="sm" asChild>
              <Link href="/login">
                Únete
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}

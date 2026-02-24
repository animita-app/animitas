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

import { ROLES } from '@/types/roles'
import { cn } from '@/lib/utils'
import { UserDropdown } from './user-dropdown'
import { PlatformDropdown } from './platform-dropdown'


interface HeaderProps {
  onExport?: (format: string, scope?: 'viewport' | 'all') => void
  isLoading?: boolean
  componentCount?: number
  className?: string
  variant?: 'gis' | 'default'
  onResetView?: () => void
}

const MENU_ITEMS = [
  { label: 'Explorar', href: '/map' },
  { label: 'Planes', href: '/pricing' },
]

export function Header({ onExport, componentCount = 0, className, variant = 'default', onResetView }: HeaderProps) {
  const { role, currentUser, isEditor, isSuperadmin } = useUser()
  const pathname = usePathname()
  const isDefault = role === ROLES.DEFAULT
  const isUpdating = pathname.includes("add")

  if ((pathname === '/map' && variant !== 'gis') || pathname.includes("animita")) return null



  return (
    <div className={cn("bg-transparent z-10 flex items-center justify-between p-4 w-full", className)}>
      <div className="flex items-center gap-4">
        {variant === 'gis' ? (
          isDefault ? (
            <Button variant="ghost" size="sm" className="!px-2.5 active:scale-100 text-text-strong font-ibm-plex-mono slashed-zero cursor-default hover:bg-transparent">
              [ÁNIMA]
            </Button>
          ) : (
            <PlatformDropdown onExport={onExport} componentCount={componentCount} />
          )
        ) : (
          <div className="flex items-center gap-6">
            <Link href="/" className="font-medium active:scale-100 gap-1 [&_svg]:opacity-50 px-2.5 text-text-strong font-ibm-plex-mono slashed-zero">
              [ÁNIMA]
            </Link>

            {!isUpdating && (
              <NavigationMenu className="hidden md:flex absolute left-1/2 -translate-x-1/2">
                <NavigationMenuList>
                  {MENU_ITEMS.map((item) => (
                    <NavigationMenuItem key={item.href}>
                      <NavigationMenuLink
                        href={item.href}
                        className={cn(
                          navigationMenuTriggerStyle(),
                          "font-medium bg-transparent hover:bg-transparent focus:bg-transparent active:bg-transparent data-[active]:bg-transparent data-[state=open]:bg-transparent",
                          pathname === item.href && "text-text-strong"
                        )}
                      >
                        {item.label}
                      </NavigationMenuLink>
                    </NavigationMenuItem>
                  ))}

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
        )}
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
  )
}

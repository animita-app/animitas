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
import { useSpatialContext } from '@/contexts/spatial-context'
import { ROLES } from '@/types/roles'
import { cn } from '@/lib/utils'
import { UserDropdown } from './user-dropdown'
import { PlatformDropdown } from './platform-dropdown'
import { ButtonGroup } from '../ui/button-group'

interface HeaderProps {
  onExport?: (format: string, scope?: 'viewport' | 'all') => void
  isLoading?: boolean
  componentCount?: number
  className?: string
  variant?: 'gis' | 'default'
}

const MENU_ITEMS = [
  { label: 'Explorar', href: '/map' },
  { label: 'Planes', href: '/pricing' },
]

export function Header({ onExport, componentCount = 0, className, variant = 'default' }: HeaderProps) {
  const { role, currentUser } = useUser()
  const { isCruiseActive, setCruiseActive } = useSpatialContext()
  const pathname = usePathname()
  const isFree = role === ROLES.FREE

  return (
    <div className={cn("bg-transparent z-10 flex items-center justify-between", className)}>
      <div className="flex items-center gap-4">
        {variant === 'gis' ? (
          isFree ? (
            <Button variant="ghost" size="sm" className="!px-2.5 active:scale-100 text-black font-ibm-plex-mono slashed-zero cursor-default hover:bg-transparent">
              [ÁNIMA]
            </Button>
          ) : (
            <PlatformDropdown onExport={onExport} componentCount={componentCount} />
          )
        ) : (
          <div className="flex items-center gap-6">
            <Link href="/" className="font-medium active:scale-100 gap-1 [&_svg]:opacity-50 px-2.5 text-black font-ibm-plex-mono slashed-zero">
              [ÁNIMA]
            </Link>

            <NavigationMenu className="absolute left-1/2 -translate-x-1/2">
              <NavigationMenuList>
                {MENU_ITEMS.map((item) => (
                  <NavigationMenuItem key={item.href}>
                    <NavigationMenuLink
                      href={item.href}
                      className={cn(
                        navigationMenuTriggerStyle(),
                        "font-medium bg-transparent hover:bg-transparent focus:bg-transparent active:bg-transparent data-[active]:bg-transparent data-[state=open]:bg-transparent",
                        pathname === item.href && "text-black"
                      )}
                    >
                      {item.label}
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        {isFree && (
          <div className="flex gap-3 items-center">
            Modo crucero
            <Button
              variant={isCruiseActive ? "default" : "outline"}
              size="sm"
              className="font-ibm-plex-mono uppercase"
              onClick={() => setCruiseActive(!isCruiseActive)}
            >
              <div className={cn("relative *:bg-accent", isCruiseActive && "*:!bg-white")}>
                <div className="size-1.5 rounded-full animate-pulse absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                <div className="size-1.5 rounded-full" />
              </div>
              {isCruiseActive ? "ON" : "OFF"}
            </Button>
          </div>
        )}
        {currentUser ? (
          <>
            <Button size="sm" className="!pl-2 gap-1 bg-black hover:bg-black/90">
              <Plus />
              Añadir
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

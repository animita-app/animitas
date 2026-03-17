"use client"

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useIsMobile } from '@/hooks/use-mobile'
import { Button } from '@/components/ui/button'
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { useUser } from '@/contexts/user-context'
import { useSpatialContext } from '@/contexts/spatial-context'
import { useHeritageTaxonomy } from '@/hooks/use-heritage-taxonomy'
import { TwoLevelCombobox, type TwoLevelCategory } from '@/components/ui/two-level-combobox'
import { cn } from '@/lib/utils'
import { UserDropdown } from './user-dropdown'
import { MainHeaderPanel } from './main-header-panel'

export function Header() {
  const { currentUser, isEditor, isSuperadmin, isLoading } = useUser()
  const pathname = usePathname()
  const isMobile = useIsMobile()
  const [searchActive, setSearchActive] = useState(false)
  const [comboboxOpen, setComboboxOpen] = useState(false)
  const { filters, setFilter } = useSpatialContext()
  const { categories, kinds } = useHeritageTaxonomy()

  const selectedValues = useMemo(() => {
    return [...(filters.kind || [])]
  }, [filters])

  const comboboxCategories = useMemo<TwoLevelCategory[]>(() => {
    return categories.map(cat => ({
      key: cat.slug,
      label: cat.name,
      items: kinds
        .filter(k => k.category_id === cat.id)
        .map(k => ({ value: k.slug, label: k.name })),
      multiSelect: true
    }))
  }, [categories, kinds])

  const handleToggle = (value: string, categoryKey: string, isSelected: boolean) => {
    if (isSelected) {
      setFilter('kind', filters.kind?.filter(v => v !== value) || [])
    } else {
      setFilter('kind', [...(filters.kind || []), value])
    }
  }

  if (pathname.includes("animita")) return null

  const segments = pathname.split('/').filter(Boolean)
  const isSiteDetailRoute = segments.length === 2 && !['map', 'list', 'add', 'auth', 'admin'].includes(segments[0])

  if (isSiteDetailRoute) return null

  const isFixedHeader = pathname === '/' || pathname === '/map' || pathname === '/list' || pathname === '/add' || pathname === '/auth'
  const showMainPanel = pathname === '/' || pathname === '/map' || pathname === '/list'

  return (
    <header className={cn(
      isFixedHeader ? "fixed" : "sticky",
      "top-0 left-0 right-0 z-50 pointer-events-none w-full",
    )}>
      <div className="bg-transparent flex items-center justify-between p-4 w-full h-14 pointer-events-auto">
        {/* Left: Logo */}
        <div className={cn(
          "flex items-center gap-6 transition-all duration-150",
          isMobile && searchActive && "-translate-x-full opacity-0"
        )}>
          <TwoLevelCombobox
            trigger={
              <button className="flex items-center font-medium active:scale-100 gap-1 [&_svg]:opacity-50 px-2.5 -ml-2.5 text-text-strong font-ibm-plex-mono slashed-zero relative">
                [ÁNIMA]
                {selectedValues.length > 0 && (
                  <span className="bg-black/15 text-foreground text-xs font-medium h-4 w-4 rounded-full text-center flex items-center justify-center">
                    {selectedValues.length}
                  </span>
                )}
              </button>
            }
            open={comboboxOpen}
            onOpenChange={setComboboxOpen}
            categories={comboboxCategories}
            selectedValues={selectedValues}
            onToggle={handleToggle}
            contentWidth="w-80"
          />
        </div>

        {/* Center: Tabs + Filters/Search */}
        {showMainPanel && (
          <div className="absolute left-1/2 -translate-x-1/2 transition-all duration-150">
            <MainHeaderPanel onSearchActiveChange={setSearchActive} />
          </div>
        )}

        {/* Right: Role links + user actions */}
        <div className={cn(
          "flex items-center gap-3 transition-all duration-150",
          isMobile && searchActive && "translate-x-full opacity-0"
        )}>
          {(isEditor || isSuperadmin) && (
            <NavigationMenu className="hidden md:flex">
              <NavigationMenuList>
                {isEditor && (
                  // The Editor link was moved to Notifications Bell
                  <span className="hidden" />
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

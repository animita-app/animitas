"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { isDemo } from '@/lib/demo/flag'
import Image from 'next/image'
import type React from 'react'
import { cn } from '@/lib/utils'
import { CutoutText } from '@/components/cutout-text'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useUser } from '@/contexts/user-context'
import { createClient } from '@/lib/supabase/client'
import { NotificationsBell } from './notifications-bell'

// The same plates as the comuna filter. Sign colors live in .road-sign, unlayered, so they hold on highlight.
const PLATE = 'plate-deal road-sign road-sign-text w-max gap-3 px-3 py-1.5 text-base transition-[translate] duration-150 data-[highlighted]:-translate-x-1 -rotate-[0.4deg]'

export function UserDropdown() {
  const { currentUser } = useUser()
  const [demo, setDemo] = useState(false)
  // Only one of the two menus open at a time: opening one closes the other.
  const [openMenu, setOpenMenu] = useState<'letters' | 'account' | null>(null)
  const menu = (name: 'letters' | 'account') => ({
    open: openMenu === name,
    onOpenChange: (open: boolean) => setOpenMenu(current => (open ? name : current === name ? null : current)),
  })
  useEffect(() => setDemo(isDemo()), [])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.reload()
  }

  if (!currentUser) return null

  return (
    <div className="flex items-center gap-2">
      <NotificationsBell {...menu('letters')} />
      <DropdownMenu {...menu('account')}>
        <DropdownMenuTrigger asChild>
          {/* You, as a small instant print: your photo, or your initial cut from print. */}
          <button
            type="button"
            aria-label="Tu cuenta"
            className="print-frame flex size-11 rotate-3 items-center justify-center p-1 pb-2 outline-none transition-[scale,rotate] duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-110 hover:rotate-0 focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-expanded:scale-110 aria-expanded:rotate-0 motion-reduce:transition-none"
          >
            {currentUser.avatarUrl ? (
              <Image src={currentUser.avatarUrl} alt="" width={64} height={64} className="size-full object-cover" />
            ) : (
              <CutoutText text={(currentUser.name || currentUser.username || 'v')[0]} height={22} />
            )}
          </button>
        </DropdownMenuTrigger>
        {/* Street plates, like the comunas: where you can go from here. */}
        <DropdownMenuContent align="end" sideOffset={4} className="flex flex-col items-end gap-2 bg-transparent p-3 shadow-none">
          <DropdownMenuItem asChild style={{ '--i': 0 } as React.CSSProperties} className={PLATE}>
            <Link href={`/@${currentUser.username}`}>Tu perfil</Link>
          </DropdownMenuItem>
          {demo ? (
            <>
              {/* The only sign of demo mode, so nothing floats over the pages. Plain links: they go through
                  the server to change the demo cookie. */}
              <DropdownMenuLabel className="plate-deal px-1 pt-2 text-xs font-normal text-text-weak" style={{ '--i': 1 } as React.CSSProperties}>
                Estás en modo demo
              </DropdownMenuLabel>
              <DropdownMenuItem asChild style={{ '--i': 2 } as React.CSSProperties} className={cn(PLATE, 'road-sign-blue rotate-[0.6deg]')}>
                <a href="/demo?reiniciar">Reiniciar demo</a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild style={{ '--i': 3 } as React.CSSProperties} className={cn(PLATE, 'road-sign-blue')}>
                <a href="/demo?salir">Salir del demo</a>
              </DropdownMenuItem>
            </>
          ) : (
            <DropdownMenuItem onSelect={handleLogout} style={{ '--i': 1 } as React.CSSProperties} className={cn(PLATE, 'road-sign-blue rotate-[0.6deg]')}>
              Cerrar sesión
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

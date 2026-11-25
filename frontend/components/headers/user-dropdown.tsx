"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { isDemo } from '@/lib/demo/flag'
import Image from 'next/image'
import { CutoutText } from '@/components/cutout-text'
import { PenLoop } from '@/components/pen'
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

const ITEM = 'pen-ink pen-item rounded-none p-0 text-lg data-[highlighted]:bg-transparent'

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
        <div className="shelf shelf-top">
          <DropdownMenuTrigger asChild>
            {/* You, written in pen: your initial circled, or your photo as a small print. */}
            <button
              type="button"
              aria-label="Tu cuenta"
              style={{ transformOrigin: '100% 0' }}
              className="shelf-item relative flex size-11 items-center justify-center rounded-full outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              <span className="shelf-label pointer-events-none absolute left-1/2 top-1/2 z-10 size-0">
                <CutoutText text="tú" height={20} orbit={{ radius: 40, angle: 120, clockwise: false }} />
              </span>
              {currentUser.avatarUrl ? (
                <span className="print-frame block size-10 rotate-3 p-1 pb-2">
                  <Image src={currentUser.avatarUrl} alt="" width={64} height={64} className="size-full object-cover" />
                </span>
              ) : (
                <PenLoop className="size-10 text-xl">{(currentUser.name || currentUser.username || 'v')[0].toUpperCase()}</PenLoop>
              )}
            </button>
          </DropdownMenuTrigger>
        </div>
        {/* A note with where you can go, written in pen. */}
        <DropdownMenuContent align="end" sideOffset={4} className="paper-slip flex min-w-48 rotate-1 flex-col gap-2 rounded-none bg-transparent px-5 py-4">
          <DropdownMenuItem asChild className={ITEM}>
            <Link href={`/@${currentUser.username}`}>Tu perfil</Link>
          </DropdownMenuItem>
          {demo ? (
            <>
              {/* The only sign of demo mode, so nothing floats over the pages. Plain links: they go through
                  the server to change the demo cookie. */}
              <DropdownMenuLabel className="p-0 pt-2 text-xs font-normal text-text-weak">Estás en modo demo</DropdownMenuLabel>
              <DropdownMenuItem asChild className={ITEM}>
                <a href="/demo?reiniciar">Reiniciar demo</a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className={ITEM}>
                <a href="/demo?salir">Salir del demo</a>
              </DropdownMenuItem>
            </>
          ) : (
            <DropdownMenuItem onSelect={handleLogout} className={ITEM}>
              Cerrar sesión
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

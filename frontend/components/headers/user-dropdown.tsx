"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { isDemo } from '@/lib/demo/flag'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useUser } from '@/contexts/user-context'
import { createClient } from '@/lib/supabase/client'
import { NotificationsBell } from './notifications-bell'

export function UserDropdown() {
  const { currentUser } = useUser()
  const [demo, setDemo] = useState(false)
  useEffect(() => setDemo(isDemo()), [])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.reload()
  }

  if (!currentUser) return null

  return (
    <div className="flex items-center gap-2">
      <NotificationsBell />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Tu cuenta" className="rounded-full">
            <Avatar>
              <AvatarImage src={currentUser.avatarUrl} alt="" />
              <AvatarFallback>{currentUser.username?.[0]?.toUpperCase()}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" sideOffset={4} className="w-48">
          <DropdownMenuItem asChild>
            <Link href={`/@${currentUser.username}`}>Perfil</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/creditos">Créditos</Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {demo ? (
            <>
              {/* The only sign of demo mode, so nothing floats over the pages. Plain links: they go through
                  the server to change the demo cookie. */}
              <DropdownMenuLabel className="text-xs font-normal text-text-weak">Estás en modo demo</DropdownMenuLabel>
              <DropdownMenuItem asChild>
                <a href="/demo?reiniciar">Reiniciar demo</a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href="/demo?salir">Salir del demo</a>
              </DropdownMenuItem>
            </>
          ) : (
            <DropdownMenuItem onSelect={handleLogout}>Cerrar sesión</DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

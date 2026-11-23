"use client"

import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuGroup,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu"
import { useUser } from '@/contexts/user-context'
import { ROLES } from '@/types/roles'
import { Badge } from "@/components/ui/badge"
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

import { NotificationsBell } from './notifications-bell'

export function UserDropdown() {
  const { role, setRole, currentUser, setUser, isEditor, isSuperadmin } = useUser()

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
          <Avatar>
            <AvatarImage src={currentUser.avatarUrl} alt={currentUser.name} />
            <AvatarFallback>{currentUser?.username?.[0].toUpperCase()}</AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuGroup>
            <DropdownMenuItem asChild>
              <Link href={`/@${currentUser.username}`}>
                Perfil
              </Link>
            </DropdownMenuItem>
            {isSuperadmin && (
              <DropdownMenuItem asChild>
                <Link href="/admin" className="justify-between w-full">
                  Panel Admin
                </Link>
              </DropdownMenuItem>
            )}
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Configuración</DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent>
                  <DropdownMenuCheckboxItem
                    checked={role === ROLES.DEFAULT}
                    onCheckedChange={() => {
                      setRole(ROLES.DEFAULT)
                      window.location.reload()
                    }}
                  >
                    Visitante (Default)
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={role === ROLES.EDITOR}
                    onCheckedChange={() => {
                      setRole(ROLES.EDITOR)
                      window.location.reload()
                    }}
                  >
                    Editor
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={role === ROLES.SUPERADMIN}
                    onCheckedChange={() => {
                      setRole(ROLES.SUPERADMIN)
                      window.location.reload()
                    }}
                  >
                    Superadmin
                  </DropdownMenuCheckboxItem>

                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={handleLogout}>
            Cerrar sesión
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

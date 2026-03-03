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

export function UserDropdown() {
  const { role, setRole, currentUser, setUser, researchMode, setResearchMode, isEditor, isSuperadmin } = useUser()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.reload()
  }

  if (!currentUser) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="relative cursor-pointer">
          <Avatar>
            <AvatarImage src={currentUser.avatarUrl} alt={currentUser.name} />
            <AvatarFallback>{currentUser?.username?.[0].toUpperCase()}</AvatarFallback>
          </Avatar>
          {role === ROLES.EDITOR && (
            <div className="absolute -top-0.5 -right-0.5 size-2.5 bg-accent rounded-full border-[2px] border-background" />
          )}
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href={`/profile/@${currentUser.username}`}>
              Perfil
            </Link>
          </DropdownMenuItem>
          {isEditor && (
            <DropdownMenuItem asChild>
              <Link href="/editor" className="justify-between w-full">
                Cola de Revisión
              </Link>
            </DropdownMenuItem>
          )}
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

        {(isEditor || isSuperadmin) && (
          <DropdownMenuGroup>
            <DropdownMenuCheckboxItem
              checked={researchMode}
              onCheckedChange={setResearchMode}
            >
              Modo Investigación
            </DropdownMenuCheckboxItem>
          </DropdownMenuGroup>
        )}

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={handleLogout}>
          Cerrar sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

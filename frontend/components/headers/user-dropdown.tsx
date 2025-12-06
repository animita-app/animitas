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

export function UserDropdown() {
  const { role, setRole, currentUser, setUser } = useUser()

  if (!currentUser) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="cursor-pointer">
          <AvatarImage src={currentUser.avatarUrl} alt={currentUser.name} />
          <AvatarFallback>{currentUser.name[0]}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuItem>
            Perfil
          </DropdownMenuItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Configuración</DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <DropdownMenuCheckboxItem
                  checked={role === ROLES.FREE}
                  onCheckedChange={() => setRole(ROLES.FREE)}
                >
                  Gratis
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={role === ROLES.PRO}
                  onCheckedChange={() => setRole(ROLES.PRO)}
                >
                  Pro
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={role === ROLES.INSTITUTIONAL}
                  onCheckedChange={() => setRole(ROLES.INSTITUTIONAL)}
                >
                  Institucional
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={role === ROLES.EDITOR}
                  onCheckedChange={() => setRole(ROLES.EDITOR)}
                >
                  Editor
                </DropdownMenuCheckboxItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={() => setUser?.(null)}>
          Cerrar sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

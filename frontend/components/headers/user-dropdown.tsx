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
import Link from "next/link"

export function UserDropdown() {
  const { role, setRole, currentUser, setUser } = useUser()

  if (!currentUser) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="relative cursor-pointer">
          <Avatar>
            <AvatarImage src={currentUser.avatarUrl} alt={currentUser.name} />
            <AvatarFallback>{currentUser.name[0]}</AvatarFallback>
          </Avatar>
          {role === ROLES.EDITOR && (
            <div className="absolute -top-0.5 -right-0.5 size-2.5 bg-accent rounded-full border-[2px] border-background" />
          )}
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuItem>
            Perfil
          </DropdownMenuItem>
          {role === ROLES.EDITOR && (
            <DropdownMenuItem asChild>
              <Link href="/platform/revisions" className="justify-between w-full">
                Por revisar
                <Badge className="aspect-square w-5 items-center -mr-0.5 !pt-0.5 bg-accent text-white">
                  5
                </Badge>
              </Link>
            </DropdownMenuItem>
          )}
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Configuración</DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <DropdownMenuCheckboxItem
                  checked={role === ROLES.FREE}
                  onCheckedChange={() => {
                    setRole(ROLES.FREE)
                    window.location.reload()
                  }}
                >
                  Gratis
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={role === ROLES.PRO}
                  onCheckedChange={() => {
                    setRole(ROLES.PRO)
                    window.location.reload()
                  }}
                >
                  Pro
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={role === ROLES.INSTITUTIONAL}
                  onCheckedChange={() => {
                    setRole(ROLES.INSTITUTIONAL)
                    window.location.reload()
                  }}
                >
                  Institucional
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

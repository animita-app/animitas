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
import { useSpatialContext } from '@/contexts/spatial-context'
import { ROLES } from '@/types/roles'
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

import { NotificationsBell } from './notifications-bell'

export function UserDropdown() {
  const { role, setRole, currentUser, setUser, researchMode, setResearchMode, isEditor, isSuperadmin } = useUser()
  const { showResearchPanel, setShowResearchPanel } = useSpatialContext()

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
        {/* ... rest of the code is unchanged up until the end of the file, wait I have to replace everything from line 25 down */}
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
              <Link href={`/@${currentUser.username}`}>
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

          <DropdownMenuGroup>
            <DropdownMenuCheckboxItem
              checked={showResearchPanel}
              onCheckedChange={(checked) => {
                setResearchMode(checked)
                if (!checked) setShowResearchPanel(false)
              }}          >
              Modo investigación
            </DropdownMenuCheckboxItem>
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

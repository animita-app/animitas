"use client"

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Copy, Ellipsis, Pencil, Plus, Repeat, Trash } from 'lucide-react'
import { useUser } from '@/contexts/user-context'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

interface SidebarHeaderProps {
  site: any
}

export function SidebarHeader({ site }: SidebarHeaderProps) {
  const { currentUser, isEditor } = useUser()
  const isCreator = currentUser?.id === site.creator_id

  const creatorName = site.created_by?.name || 'Anónimo'
  const createdAt = site.created_at
    ? formatDistanceToNow(new Date(site.created_at), { addSuffix: true, locale: es })
    : null

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    toast.success('Link copiado')
  }

  return (
    <div className="h-14 flex items-center justify-between px-6 pr-3 border-b border-border-weak shrink-0">
      <div className="flex items-center gap-2">
        <Avatar className="size-6">
          <AvatarFallback className="text-xs font-normal">
            {creatorName[0]?.toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <p className="flex gap-1.5 items-center text-sm text-text-weak">
          <span className="font-medium text-text-strong">{creatorName}</span>
          {createdAt && <span>·</span>}
          {createdAt && <span>{createdAt}</span>}
        </p>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <Ellipsis />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          {isEditor && (
            <DropdownMenuItem>
              <Repeat />
              Nueva versión
            </DropdownMenuItem>
          )}
          {isEditor && (
            <DropdownMenuItem>
              <Pencil />
              Editar insights
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={handleCopyLink}>
            <Copy />
            Copiar link
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Plus />
            Añadir a ruta
          </DropdownMenuItem>
          {isCreator && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive focus:text-destructive">
                <Trash />
                Eliminar
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

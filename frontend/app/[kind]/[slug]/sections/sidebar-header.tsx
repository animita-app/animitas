"use client"

import { useState } from 'react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { CheckCircle2, Copy, Ellipsis, Pencil, Plus, Repeat, Trash } from 'lucide-react'
import { useSitePermissions } from '@/hooks/use-site-permissions'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { HeritageSite } from '@/types/heritage'

interface SidebarHeaderProps {
  site: HeritageSite
}

export function SidebarHeader({ site }: SidebarHeaderProps) {
  const { isCreator, isEditor } = useSitePermissions(site)
  const [copied, setCopied] = useState(false)

  const creatorName = site.created_by?.name || 'Anónimo'
  const postedAt = site.created_at
    ? formatDistanceToNow(new Date(site.created_at), { addSuffix: true, locale: es })
    : null

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-background-weak h-14 flex items-center justify-between px-6 pr-3 border-b border-border-weak shrink-0">
      <div className="flex items-center gap-2">
        <Avatar className="size-6 shrink-0">
          <AvatarFallback className="text-xs font-normal">
            {creatorName[0]?.toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <p className="flex gap-1.5 items-center text-sm text-text-weak">
          <span className="font-medium text-text-strong">{creatorName}</span>
          {postedAt && <span>·</span>}
          {postedAt && <span>{postedAt}</span>}
        </p>
      </div>

      <DropdownMenu openOnHover={false}>
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
          <DropdownMenuItem onSelect={(e) => {
            e.preventDefault()
            handleCopyLink()
          }}>
            <span className="inline-flex items-center gap-2 transition-all duration-200">
              {copied ? (
                <span
                  className="inline-flex items-center gap-2"
                  style={{ animation: 'copy-in 0.2s cubic-bezier(0.34,1.56,0.64,1) forwards' }}
                >
                  <CheckCircle2 />
                  <span>¡Copiado!</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-2">
                  <Copy />
                  Copiar link
                </span>
              )}
            </span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Plus />
            Añadir a ruta
          </DropdownMenuItem>
          {isCreator && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
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

"use client"

import { useState } from 'react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { CheckCircle2, Copy, Ellipsis, Pencil, Plus, Repeat, Trash } from 'lucide-react'
import { useSitePermissions } from '@/hooks/use-site-permissions'
import { useUser } from '@/contexts/user-context'
import { createClient } from '@/lib/supabase/client'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { toast } from 'sonner'
import { HeritageSite } from '@/types/heritage'

interface SidebarHeaderProps {
  site: HeritageSite
}

export function SidebarHeader({ site }: SidebarHeaderProps) {
  const { isCreator, isEditor } = useSitePermissions(site)
  const { currentUser } = useUser()
  const [copied, setCopied] = useState(false)
  const [userRoutes, setUserRoutes] = useState<Array<{ id: string; title: string }>>([])
  const [loadingRoutes, setLoadingRoutes] = useState(false)
  const [newRouteName, setNewRouteName] = useState('')
  const [creatingRoute, setCreatingRoute] = useState(false)
  const [showNewRouteInput, setShowNewRouteInput] = useState(false)

  const creatorName = site.created_by?.name || 'Anónimo'
  const postedAt = site.created_at
    ? formatDistanceToNow(new Date(site.created_at), { addSuffix: true, locale: es })
    : null

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const loadUserRoutes = async () => {
    if (!currentUser?.id) {
      toast.error('Inicia sesión para añadir a ruta')
      return
    }
    setLoadingRoutes(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('site_routes')
      .select('id, title')
      .eq('creator_id', currentUser.id)
      .order('created_at', { ascending: false })
    if (data) setUserRoutes(data)
    setLoadingRoutes(false)
  }

  const handleCreateAndAdd = async () => {
    if (!newRouteName.trim()) {
      toast.error('El nombre de la ruta no puede estar vacío')
      return
    }
    if (!currentUser?.id) {
      toast.error('Inicia sesión para crear una ruta')
      return
    }

    setCreatingRoute(true)
    const supabase = createClient()

    const { data: newRoute, error: createError } = await supabase
      .from('site_routes')
      .insert({
        creator_id: currentUser.id,
        title: newRouteName.trim(),
        description: null
      })
      .select('id')
      .single()

    if (createError) {
      toast.error('Error al crear ruta')
      setCreatingRoute(false)
      return
    }

    const { error: addError } = await supabase
      .from('site_route_items')
      .insert({
        route_id: newRoute.id,
        site_id: site.id,
        sort_order: 0
      })

    setCreatingRoute(false)
    if (addError) {
      toast.error('Error al añadir sitio a nueva ruta')
    } else {
      toast.success('Ruta creada y sitio añadido')
      setNewRouteName('')
      await loadUserRoutes()
    }
  }

  const handleAddToRoute = async (routeId: string) => {
    const supabase = createClient()
    const { error } = await supabase
      .from('site_route_items')
      .insert({
        route_id: routeId,
        site_id: site.id,
        sort_order: 0
      })

    if (error) {
      if (error.code === '23505') {
        toast.info('Este sitio ya está en la ruta')
      } else {
        toast.error('Error al añadir a ruta')
      }
    } else {
      toast.success('Sitio añadido a ruta')
      setShowNewRouteInput(false)
    }
  }

  return (
    <div className="hidden md:flex bg-background-weak h-14 items-center justify-between px-6 pr-3 border-b border-border-weak shrink-0">
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
          <DropdownMenuSub>
            <DropdownMenuSubTrigger
              onSelect={(e) => {
                e.preventDefault()
                loadUserRoutes()
              }}
            >
              <Plus />
              Añadir a ruta
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              {loadingRoutes ? (
                <div className="px-2 py-1.5 text-sm text-text-weak">Cargando rutas...</div>
              ) : showNewRouteInput ? (
                <div className="px-2 py-2 space-y-2">
                  <Input
                    placeholder="Nombre de la ruta"
                    value={newRouteName}
                    onChange={(e) => setNewRouteName(e.target.value)}
                    onKeyDown={(e) => {
                      e.stopPropagation()
                      if (e.key === 'Enter') handleCreateAndAdd()
                      if (e.key === 'Escape') setShowNewRouteInput(false)
                    }}
                    autoFocus
                    className="h-8"
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={handleCreateAndAdd}
                      disabled={creatingRoute || !newRouteName.trim()}
                      size="sm"
                      className="flex-1"
                    >
                      {creatingRoute ? '...' : 'Crear'}
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setShowNewRouteInput(false)
                        setNewRouteName('')
                      }}
                      size="sm"
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : userRoutes.length === 0 ? (
                <div className="px-2 py-1.5 text-sm text-text-weak">Sin rutas</div>
              ) : (
                userRoutes.map((route) => (
                  <DropdownMenuItem
                    key={route.id}
                    onSelect={() => handleAddToRoute(route.id)}
                  >
                    {route.title}
                  </DropdownMenuItem>
                ))
              )}
              {!showNewRouteInput && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={() => setShowNewRouteInput(true)}>
                    <Plus />
                    Nueva ruta
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
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

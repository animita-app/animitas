"use client"

import { useRef, useState, useEffect } from 'react'
import { Camera, Loader2, Plus } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { InlineEdit } from '@/components/ui/inline-edit'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useUser } from '@/contexts/user-context'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { HeritageSiteCard } from '@/components/cards/heritage-site-card'
import { RouteCard } from '@/components/cards/route-card'
import { Button } from '@/components/ui/button'

interface ProfileData {
  id: string
  display_name: string
  username: string
  image: string | null
  role: string
}

interface ProfileViewProps {
  profile: ProfileData | null
  username: string
}

export function ProfileView({ profile, username }: ProfileViewProps) {
  const { currentUser, setUser } = useUser()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const [imageUrl, setImageUrl] = useState(profile?.image || null)
  const isOwnProfile = profile && currentUser?.username?.toLowerCase() === username.toLowerCase()
  const isElevated = profile?.role === 'editor' || profile?.role === 'superadmin'

  const saveDisplayName = async (value: string) => {
    if (!profile) throw new Error('Profile not found')
    const supabase = createClient()
    const { error } = await supabase
      .from('user_profiles')
      .update({ display_name: value })
      .eq('id', profile.id)
    if (error) throw error
    if (currentUser) setUser({ ...currentUser, name: value })
  }

  const createNewRoute = async () => {
    if (!profile) return
    setCreatingRoute(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('site_routes')
        .insert({
          title: 'Tú ruta',
          description: null,
          creator_id: profile.id,
        })
        .select('id, title, description, site_route_items(count, heritage_sites(images))')
        .single()

      if (error) throw error
      if (data) {
        setRoutes([data, ...routes])
        toast.success('Ruta creada')
      }
    } catch {
      toast.error('Error al crear la ruta')
    } finally {
      setCreatingRoute(false)
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!profile) return
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const supabase = createClient()
    const path = `users/${profile.id}`

    const { error: uploadError } = await supabase.storage
      .from('base')
      .upload(path, file, { upsert: true, contentType: file.type })

    if (uploadError) {
      toast.error('Error al subir la foto')
      setUploading(false)
      return
    }

    const { data: { publicUrl } } = supabase.storage.from('base').getPublicUrl(path)
    const publicUrlWithBust = `${publicUrl}?t=${Date.now()}`

    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({ image: publicUrlWithBust })
      .eq('id', profile.id)

    if (updateError) {
      toast.error('Error al guardar la foto')
      setUploading(false)
      return
    }

    if (currentUser) setUser({ ...currentUser, avatarUrl: publicUrlWithBust })
    setImageUrl(publicUrlWithBust)
    toast.success('Foto actualizada')
    setUploading(false)
  }

  const roleLabel = profile?.role === 'superadmin'
    ? 'Superadmin'
    : profile?.role === 'editor'
      ? 'Editor'
      : null

  const [sites, setSites] = useState<any[]>([])
  const [routes, setRoutes] = useState<any[]>([])
  const [tabLoading, setTabLoading] = useState(true)
  const [creatingRoute, setCreatingRoute] = useState(false)

  useEffect(() => {
    if (!profile) return
    async function fetchUserContent() {
      const supabase = createClient()
      const [sitesRes, routesRes] = await Promise.all([
        supabase
          .from('heritage_sites')
          .select('id, slug, title, images, heritage_kinds!kind_id(slug)')
          .eq('creator_id', profile!.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('site_routes')
          .select('id, title, description, site_route_items(count, heritage_sites(images))')
          .eq('creator_id', profile!.id)
          .order('created_at', { ascending: false }),
      ])
      if (sitesRes.data) setSites(sitesRes.data)
      if (routesRes.data) setRoutes(routesRes.data)
      setTabLoading(false)
    }
    fetchUserContent()
  }, [profile?.id])

  if (!profile) {
    return (
      <div className="flex min-h-svh items-center justify-center text-text-weak text-sm">
        Perfil no encontrado.
      </div>
    )
  }

  return (
    <div className="flex w-full flex-col items-center bg-background">
      <div className="flex flex-col items-center gap-6 text-center px-6 pt-16">
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className="relative group size-24"
              onClick={() => isOwnProfile && !uploading && fileInputRef.current?.click()}
            >
              <Avatar className="size-24">
                <AvatarImage src={imageUrl || undefined} alt={profile.display_name} />
                <AvatarFallback className="text-4xl font-normal">
                  {profile.username?.[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {isOwnProfile && (
                <div className={`absolute inset-0 rounded-full bg-black/40 transition-opacity flex items-center justify-center cursor-pointer ${uploading ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                  {uploading ? <Loader2 className="text-white animate-spin" /> : <Camera className="text-white" />}
                </div>
              )}
            </div>
          </TooltipTrigger>
          {isOwnProfile && <TooltipContent sideOffset={8}>Cambiar foto</TooltipContent>}
        </Tooltip>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        <div className="flex items-center gap-2">
          {isOwnProfile ? (
            <InlineEdit
              value={profile.display_name}
              onSave={saveDisplayName}
              placeholder="Tu nombre"
              className="text-2xl font-semibold text-text-strong text-center tracking-tight"
            />
          ) : (
            <h1 className="text-2xl font-semibold text-text-strong tracking-tight">{profile.display_name}</h1>
          )}
          {isElevated && (
            <Badge variant="secondary" className="text-xs font-semibold uppercase tracking-wide shrink-0">
              {profile.role === 'superadmin' ? 'Admin' : 'Editor'}
            </Badge>
          )}
        </div>

        <p className="select-none -mt-3 text-base text-text-weak">
          @{profile.username}
        </p>
      </div>

      <Tabs defaultValue="sites" className="w-full px-4 mt-8">
        <TabsList className="border-b-0">
          <TabsTrigger value="sites" className="!text-base">Sitios</TabsTrigger>
          <TabsTrigger value="routes" className="!text-base">Rutas</TabsTrigger>
        </TabsList>

        <TabsContent value="sites">
          {tabLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="aspect-square rounded-lg bg-background-weaker animate-pulse" />
              ))}
            </div>
          ) : sites.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {sites.map((s) => {
                const kindSlug = (s as any).heritage_kinds?.slug || 'animita'
                return (
                  <HeritageSiteCard
                    key={s.id}
                    site={{ ...s, kind: kindSlug }}
                  />
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-sm text-text-weak">
              {isOwnProfile ? 'Aún no has creado sitios.' : 'Sin sitios publicados.'}
            </div>
          )}
        </TabsContent>

        <TabsContent value="routes">
          {tabLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="aspect-square rounded-lg bg-background-weaker animate-pulse" />
              ))}
            </div>
          ) : routes.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {routes.map((r) => {
                const itemCount = (r as any).site_route_items?.[0]?.count || 0
                const routeItems = (r as any).site_route_items || []
                const coverImages = routeItems
                  .slice(0, 4)
                  .map((item: any) => item.heritage_sites?.images?.[0])
                  .filter(Boolean)
                return (
                  <RouteCard
                    key={r.id}
                    id={r.id}
                    title={r.title}
                    description={r.description}
                    coverImages={coverImages}
                    itemCount={itemCount}
                  />
                )
              })}
            </div>
          ) : isOwnProfile ? (
            <div className="flex items-center justify-center py-12">
              <Button
                onClick={createNewRoute}
                disabled={creatingRoute}
                variant="ghost"
                className="flex items-center gap-2 text-text-weak hover:text-text-strong"
              >
                <Plus size={20} />
                Nueva ruta
              </Button>
            </div>
          ) : (
            <div className="text-center py-12 text-sm text-text-weak">
              Sin rutas creadas.
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

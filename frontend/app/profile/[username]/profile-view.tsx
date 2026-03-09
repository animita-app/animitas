"use client"

import { useRef, useState, useEffect } from 'react'
import { Camera, Loader2, Route } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { InlineEdit } from '@/components/ui/inline-edit'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useUser } from '@/contexts/user-context'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { HeritageSiteCard } from '@/components/cards/heritage-site-card'

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

  if (!profile) {
    return (
      <div className="flex min-h-svh items-center justify-center text-text-weak text-sm">
        Perfil no encontrado.
      </div>
    )
  }

  const [imageUrl, setImageUrl] = useState(profile.image)
  const isOwnProfile = currentUser?.username?.toLowerCase() === username.toLowerCase()
  const isElevated = profile.role === 'editor' || profile.role === 'superadmin'

  const saveDisplayName = async (value: string) => {
    const supabase = createClient()
    const { error } = await supabase
      .from('user_profiles')
      .update({ display_name: value })
      .eq('id', profile.id)
    if (error) throw error
    if (currentUser) setUser({ ...currentUser, name: value })
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const roleLabel = profile.role === 'superadmin'
    ? 'Superadmin'
    : profile.role === 'editor'
      ? 'Editor'
      : null

  const [sites, setSites] = useState<any[]>([])
  const [routes, setRoutes] = useState<any[]>([])
  const [tabLoading, setTabLoading] = useState(true)

  useEffect(() => {
    async function fetchUserContent() {
      const supabase = createClient()
      const [sitesRes, routesRes] = await Promise.all([
        supabase
          .from('heritage_sites')
          .select('id, slug, title, images, heritage_kinds!kind_id(slug)')
          .eq('creator_id', profile.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('site_routes')
          .select('id, title, description, site_route_items(count)')
          .eq('creator_id', profile.id)
          .order('created_at', { ascending: false }),
      ])
      if (sitesRes.data) setSites(sitesRes.data)
      if (routesRes.data) setRoutes(routesRes.data)
      setTabLoading(false)
    }
    fetchUserContent()
  }, [profile.id])

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
          {roleLabel && <><span className="mx-2">·</span>{roleLabel}</>}
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
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-16 rounded-lg bg-background-weaker animate-pulse" />
              ))}
            </div>
          ) : routes.length > 0 ? (
            <div className="space-y-3">
              {routes.map((r) => {
                const itemCount = (r as any).site_route_items?.[0]?.count || 0
                return (
                  <div key={r.id} className="flex items-center gap-3 rounded-lg border border-border-weak p-3 hover:border-border transition-colors">
                    <div className="size-10 rounded-md bg-background-weaker flex items-center justify-center shrink-0">
                      <Route className="text-text-weak" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-text-strong truncate">{r.title}</p>
                      <p className="text-xs text-text-weak">{itemCount} {itemCount === 1 ? 'sitio' : 'sitios'}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-sm text-text-weak">
              {isOwnProfile ? 'Aún no has creado rutas.' : 'Sin rutas creadas.'}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

"use client"

import { useRef, useState, useEffect } from 'react'
import { Camera, Loader2, Route } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { InlineEdit } from '@/components/ui/inline-edit'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useUser } from '@/contexts/user-context'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { AnimitaCard } from '@/components/animita/animita-card'
import { TABLES } from '@/lib/animitas'
import { uploadAvatar } from '@/lib/photos'

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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!profile) return
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const supabase = createClient()
    let publicUrlWithBust: string
    try {
      publicUrlWithBust = await uploadAvatar(supabase, profile.id, file)
    } catch {
      toast.error('No se pudo subir la foto')
      setUploading(false)
      return
    }

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

  useEffect(() => {
    if (!profile) return
    async function fetchUserContent() {
      const supabase = createClient()
      const [sitesRes, routesRes] = await Promise.all([
        supabase
          .from(TABLES.animitas)
          .select('id, slug, title, images')
          .eq('creator_id', profile!.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('site_routes')
          .select('id, title, description, site_route_items(count)')
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
            <Badge variant="secondary" className="shrink-0">
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
          <TabsTrigger value="sites" className="!text-base">Animitas</TabsTrigger>
          <TabsTrigger value="routes" className="!text-base">Rutas</TabsTrigger>
        </TabsList>

        <TabsContent value="sites">
          {tabLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="aspect-square rounded-lg" />
              ))}
            </div>
          ) : sites.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {sites.map((s) => (
                <AnimitaCard key={s.id} site={s} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-sm text-text-weak">
              {isOwnProfile ? 'Aún no has agregado animitas.' : 'Sin animitas publicadas.'}
            </div>
          )}
        </TabsContent>

        <TabsContent value="routes">
          {tabLoading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <Skeleton key={i} className="h-16 rounded-lg" />
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
                      <p className="text-xs text-text-weak">{itemCount} {itemCount === 1 ? 'animita' : 'animitas'}</p>
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

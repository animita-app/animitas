"use client"

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Camera } from 'lucide-react'
import { toast } from 'sonner'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { InlineEdit } from '@/components/ui/inline-edit'
import { DevelopingPhoto } from '@/components/loaders'
import { Spinner } from '@/components/ui/spinner'
import { EmptyState } from '@/components/empty-state'
import { CutoutText } from '@/components/cutout-text'
import { AnimitaCard } from '@/components/animita/animita-card'
import { useUser } from '@/contexts/user-context'
import { createClient } from '@/lib/supabase/client'
import { TABLES } from '@/lib/animitas'
import { uploadAvatar } from '@/lib/photos'

interface ProfileData {
  id: string
  display_name: string
  username: string
  image: string | null
  role: string
}

type AnimitaSummary = { id: string; slug: string; title: string; images: string[] | null; city_region: string | null }

export function ProfileView({ profile }: { profile: ProfileData }) {
  const { currentUser, setUser } = useUser()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [imageUrl, setImageUrl] = useState(profile.image)
  const [animitas, setAnimitas] = useState<AnimitaSummary[] | null>(null)
  const isOwnProfile = currentUser?.id === profile.id
  const isEditor = profile.role === 'editor' || profile.role === 'superadmin'

  useEffect(() => {
    let cancelled = false
    setAnimitas(null)
    createClient()
      .from(TABLES.animitas)
      .select('id, slug, title, images, city_region')
      .eq('creator_id', profile.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (!cancelled) setAnimitas(data ?? [])
      })
    return () => { cancelled = true }
  }, [profile.id])

  const saveDisplayName = async (value: string) => {
    const { error } = await createClient().from(TABLES.profiles).update({ display_name: value }).eq('id', profile.id)
    if (error) throw error
    if (currentUser) setUser({ ...currentUser, name: value })
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setUploading(true)
    try {
      const supabase = createClient()
      const url = await uploadAvatar(supabase, profile.id, file)
      const { error } = await supabase.from(TABLES.profiles).update({ image: url }).eq('id', profile.id)
      if (error) throw error
      setImageUrl(url)
      if (currentUser) setUser({ ...currentUser, avatarUrl: url })
      toast.success('Foto actualizada')
    } catch (err: any) {
      toast.error('No se pudo cambiar la foto', { description: err?.message })
    } finally {
      setUploading(false)
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 pt-20 pb-24">
      <header className="flex flex-col items-center gap-3 text-center">
        <div className="photo-vignette -rotate-2 bg-neutral-light-1 p-2 pb-6 shadow-[0_1px_0_rgb(28_24_20_/_0.12),0_10px_18px_-10px_rgb(28_24_20_/_0.5)]">
          <Avatar className="size-28 rounded-none">
            <AvatarImage src={imageUrl || undefined} alt="" className="object-cover" />
            <AvatarFallback className="rounded-none text-4xl font-normal">{profile.display_name?.[0]?.toUpperCase()}</AvatarFallback>
          </Avatar>
        </div>
        {isOwnProfile && (
          <>
            <Button variant="link" className="h-auto p-0 text-text-weak" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
              {uploading ? <Spinner /> : <Camera />}
              {uploading ? 'Subiendo…' : 'Cambiar foto'}
            </Button>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          </>
        )}

        <div className="flex items-center gap-2">
          {isOwnProfile ? (
            <InlineEdit
              value={profile.display_name}
              onSave={saveDisplayName}
              label="Tu nombre"
              placeholder="Tu nombre"
              className="text-2xl font-medium text-text-strong text-center"
            />
          ) : (
            <h1 className="text-2xl font-medium text-text-strong text-balance">{profile.display_name}</h1>
          )}
          {isEditor && <Badge variant="secondary">Editor</Badge>}
        </div>
        <p className="text-sm text-text-weak">@{profile.username}</p>
      </header>

      <section aria-labelledby="profile-animitas" className="space-y-4">
        <h2 id="profile-animitas" className="sr-only">
          Animitas{animitas && animitas.length > 0 ? ` (${animitas.length})` : ''}
        </h2>
        <CutoutText text={animitas && animitas.length > 0 ? `animitas ${animitas.length}` : 'animitas'} height={24} />

        {animitas === null ? (
          <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3">
            {[1, 2, 3].map(i => <DevelopingPhoto key={i} />)}
          </div>
        ) : animitas.length > 0 ? (
          <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3">
            {animitas.map(a => <AnimitaCard key={a.id} site={a} />)}
          </div>
        ) : (
          <EmptyState
            title={isOwnProfile ? 'Todavía no añades animitas' : 'Todavía no añade animitas'}
            cutout="todavía nada"
            description={isOwnProfile ? 'Cuando pases por una, sácale una foto y súmala al mapa.' : undefined}
            action={isOwnProfile ? (
              <Link href="/add" className="road-sign road-sign-text road-sign-action inline-flex -rotate-1 items-center px-5 py-1.5">
                Añadir
              </Link>
            ) : undefined}
          />
        )}
      </section>
    </main>
  )
}

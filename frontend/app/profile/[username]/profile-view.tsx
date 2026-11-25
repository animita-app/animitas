"use client"

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { InlineEdit } from '@/components/ui/inline-edit'
import { DevelopingPhoto } from '@/components/loaders'
import { Spinner } from '@/components/ui/spinner'
import { EmptyState } from '@/components/empty-state'
import { CutoutText } from '@/components/cutout-text'
import { PenLoop, RedPenCount } from '@/components/pen'
import { AnimitaCard } from '@/components/animita/animita-card'
import { useUser } from '@/contexts/user-context'
import { createClient } from '@/lib/supabase/client'
import { toAnimita, TABLES } from '@/lib/animitas'
import type { Animita } from '@/types/animita'
import { useNewRecuerdos } from '@/hooks/use-new-recuerdos'
import { isDemo } from '@/lib/demo/flag'
import { uploadAvatar } from '@/lib/photos'

interface ProfileData {
  id: string
  display_name: string
  username: string
  image: string | null
  role: string
}

export function ProfileView({ profile }: { profile: ProfileData }) {
  const { currentUser, setUser } = useUser()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [imageUrl, setImageUrl] = useState(profile.image)
  const [animitas, setAnimitas] = useState<Animita[] | null>(null)
  const isOwnProfile = currentUser?.id === profile.id
  const recuerdos = useNewRecuerdos()
  const [demo, setDemo] = useState(false)
  useEffect(() => setDemo(isDemo()), [])

  const signOut = async () => {
    await createClient().auth.signOut()
    window.location.href = '/map'
  }

  useEffect(() => {
    let cancelled = false
    setAnimitas(null)
    createClient()
      .from(TABLES.animitas)
      .select('*')
      .eq('creator_id', profile.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        // Same rule as the map and the list: an animita without a place has no page, so no card leads to a 404.
        if (!cancelled) setAnimitas((data ?? []).map(toAnimita).filter((a): a is Animita => a !== null))
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
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-10 px-6 pt-20 pb-40 md:pt-12">
      <header className="flex flex-col items-center gap-4 text-center">
        {/* An instant print of you, the same kind as the add form's. Your own is the button to change it;
            without a photo it shows your initial circled in pen, as in the corner. */}
        {(() => {
          const print = (
            <span className="print-frame block -rotate-2 p-1.5 pb-5 transition-[rotate,scale] duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:rotate-0 group-hover:scale-105 motion-reduce:transition-none">
              <span className="relative flex size-32 items-center justify-center overflow-hidden bg-background-weak">
                {imageUrl ? (
                  <Image src={imageUrl} alt="" fill sizes="128px" className="object-cover" />
                ) : (
                  <PenLoop className="size-20 text-4xl">{profile.display_name?.[0]?.toUpperCase() ?? '?'}</PenLoop>
                )}
                {uploading && <span className="absolute inset-0 flex items-center justify-center bg-background/70"><Spinner /></span>}
              </span>
            </span>
          )
          return isOwnProfile ? (
            <>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                aria-label={imageUrl ? 'Cambiar tu foto' : 'Poner tu foto'}
                className="group pen-redraw rounded-xs outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
              >
                {print}
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </>
          ) : print
        })()}

        <div className="flex flex-col items-center gap-1">
          <h1 className="text-balance text-2xl font-medium text-text-strong">
            {isOwnProfile ? (
              <InlineEdit value={profile.display_name} onSave={saveDisplayName} label="Tu nombre" placeholder="Tu nombre" inline />
            ) : (
              profile.display_name
            )}
          </h1>
          <p className="text-sm text-text-weak">@{profile.username}</p>
        </div>
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
          <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3">
            {animitas.map(a => {
              const left = isOwnProfile ? recuerdos.filter(r => r.slug === a.slug) : []
              return (
                <AnimitaCard
                  key={a.id}
                  site={a}
                  badge={left.length > 0 ? <RedPenCount count={left.length} className="size-10 text-xl" /> : undefined}
                  badgeLabel={left.length === 1 ? 'un recuerdo nuevo' : left.length > 1 ? `${left.length} recuerdos nuevos` : undefined}
                />
              )
            })}
          </div>
        ) : (
          <EmptyState
            title={isOwnProfile ? 'Todavía no añades animitas' : 'Todavía no añade animitas'}
            cutout="todavía nada"
            description={isOwnProfile ? 'Cuando pases por una, sácale una foto y súmala al mapa.' : undefined}
            action={isOwnProfile ? (
              <Button asChild variant="sign" size="lg" className="-rotate-1">
                <Link href="/add">Añadir</Link>
              </Button>
            ) : undefined}
          />
        )}
      </section>

      {isOwnProfile && (
        // Plain link in demo mode: it goes through the server to drop the demo cookie.
        <div className="flex justify-center pt-8">
          {demo ? (
            <Button asChild variant="link" className="h-auto p-0 text-text-weak">
              <a href="/demo?salir">Salir del demo</a>
            </Button>
          ) : (
            <Button variant="link" className="h-auto p-0 text-text-weak" onClick={signOut}>Cerrar sesión</Button>
          )}
        </div>
      )}
    </main>
  )
}

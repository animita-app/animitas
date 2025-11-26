'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getAnimitaById } from '@/lib/mockService'
import { getAnimitaStickersByUser, getAnimitaPetitionsByUser } from '@/lib/localStorage'
import { PetitionForm } from './petition-form'
import { StickerGrid } from './sticker-grid'
import { PetitionItem, PetitionInput } from './petition-item'
import { addSticker } from '@/lib/localStorage'
import type { Animita } from '@/types/mock'
import type { Sticker } from '@/types/mock'

export function MemorialDetail({ id }: { id: string }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [memorial, setMemorial] = useState<Animita | null>(null)
  const [showPetitionForm, setShowPetitionForm] = useState(false)
  const [updateTrigger, setUpdateTrigger] = useState(0)

  const handlePetitionAdded = () => {
    setUpdateTrigger(prev => prev + 1)
  }

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const animita = await getAnimitaById(id)
        if (cancelled) return

        if (!animita) {
          setError('No encontramos esta animita.')
          setMemorial(null)
        } else {
          setMemorial(animita)
        }
      } catch (err) {
        if (!cancelled) setError('No pudimos mostrar los detalles. Intenta nuevamente.')
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [id])


  const [userStickers, setUserStickers] = useState<any[]>([])
  const [userPetitions, setUserPetitions] = useState<any[]>([])

  useEffect(() => {
    setUserStickers(getAnimitaStickersByUser(id))
    setUserPetitions(getAnimitaPetitionsByUser(id))
  }, [id, updateTrigger])

  const birthYear = memorial?.birthDate ? new Date(memorial.birthDate).getFullYear() : null
  const deathYear = memorial?.deathDate ? new Date(memorial.deathDate).getFullYear() : null

  // Filter out duplicates if any (though logic should handle it, good to be safe or just merge)
  // Actually, we should probably deduplicate based on ID if we were merging lists from server and local.
  // But here memorial.material is mock data, userStickers is local.
  // We should just append them.
  const allStickers = [...(memorial?.material || []), ...userStickers]

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <Loader2 className="animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error || !memorial) {
    return (
      <div className="space-y-8 p-6 text-center text-balance h-full">
        <p>{error ?? 'No encontramos esta animita.'}</p>
        <Button variant="secondary" onClick={() => router.back()}>
          Volver al mapa
        </Button>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-3 py-3">
        <h2 className="px-6 normal-case !text-neutral-800 text-2xl font-semibold">
          {memorial.name}
        </h2>

        {(birthYear || deathYear) && (
          <div className="px-6 -mt-1.5">
            <span className="inline-flex gap-2 items-center text-sm text-foreground/70">
              {birthYear && birthYear}
              {(birthYear || deathYear) && ' ✝︎ '}
              {deathYear && deathYear}
            </span>
          </div>
        )}

        <StickerGrid
          animitaId={id}
          stickers={allStickers}
          onAddSticker={(type: Sticker['type']) => {
            addSticker(id, type)
            setUpdateTrigger(prev => prev + 1)
          }}
        />

        {/* {memorial.images && memorial.images.length > 0 && (
          <Carousel className="relative mt-4 -mx-6">
            <CarouselContent>
              {memorial.images.map((imageUrl, idx) => (
                <CarouselItem key={idx} className="pl-1 basis-4/12">
                  <div className="relative w-full aspect-3/4 overflow-hidden bg-muted">
                    <Image
                      src={imageUrl}
                      alt="Memorial image"
                      fill
                      className="object-cover"
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        )} */}
      </div>

      <Tabs defaultValue="peticiones" className='px-6'>
        <TabsList className="-ml-4 mt-2">
          <TabsTrigger value="peticiones">Peticiones</TabsTrigger>
          <TabsTrigger value="historia">Historia</TabsTrigger>
        </TabsList>

        <TabsContent value="peticiones" className="space-y-3 mb-12 -mx-2">
          {(() => {
            const allPetitions = [...(memorial.peticiones || []), ...userPetitions]
              .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())

            if (allPetitions.length === 0) return null

            return (
              <div className="space-y-2 mt-4">
                {allPetitions.map((petition) => (
                  <div key={petition.id} className="animate-in fade-in slide-in-from-top-4 duration-700 fill-mode-both">
                    <PetitionItem petition={petition} />
                  </div>
                ))}
              </div>
            )
          })()}

          <div className="mt-6">
            <h3 className="px-2 text-2xl font-medium text-muted-foreground/60 mb-2 normal-case">
              Tú
            </h3>
            <PetitionInput onClick={() => setShowPetitionForm(true)} animitaName={memorial?.name || 'Animita'} />
          </div>
        </TabsContent>

        <TabsContent value="historia" className="space-y-4 pt-3 px-0 mb-12">
          <p className="text-sm font-sans !normal-case leading-relaxed">
            {memorial.story}
          </p>
        </TabsContent>
      </Tabs>

      <PetitionForm
        animitaId={id}
        animitaName={memorial?.name || 'Animita'}
        open={showPetitionForm}
        onOpenChange={setShowPetitionForm}
        onPetitionAdded={handlePetitionAdded}
      />
    </>
  )
}

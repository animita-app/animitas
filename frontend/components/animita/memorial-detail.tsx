'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Image from 'next/image'
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel'
import { getAnimitaById } from '@/lib/mockService'
import { getAnimitaStickersByUser, getAnimitaPetitionsByUser } from '@/lib/localStorage'
import { PetitionForm } from './petition-form'
import { StickerGrid } from './sticker-grid'
import { PetitionItem } from './petition-item'
import { addSticker } from '@/lib/localStorage'
import type { Animita } from '@/types/mock'
import type { Sticker } from '@/types/mock'

export function MemorialDetail({ id }: { id: string }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [memorial, setMemorial] = useState<Animita | null>(null)
  const [showPetitionForm, setShowPetitionForm] = useState(false)

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


  const birthYear = memorial?.birthDate ? new Date(memorial.birthDate).getFullYear() : null
  const deathYear = memorial?.deathDate ? new Date(memorial.deathDate).getFullYear() : null
  const userAddedStickers = getAnimitaStickersByUser(id)
  const allStickers = [...(memorial?.material || []), ...userAddedStickers]
  const userPetitionsData = getAnimitaPetitionsByUser(id)

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
        <h2 className="normal-case text-2xl font-semibold">
          {memorial.name}
        </h2>

        {(birthYear || deathYear) && (
          <div className="-mt-1.5 space-y-2">
            <span className="inline-flex gap-2 items-center text-sm text-foreground/70">
              {birthYear && birthYear}
              {(birthYear || deathYear) && ' ✝︎ '}
              {deathYear && deathYear}
            </span>
          </div>
        )}

        <StickerGrid
          stickers={allStickers}
          onAddSticker={(type: Sticker['type']) => {
            addSticker(id, type)
          }}
        />

        {memorial.images && memorial.images.length > 0 && (
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
        )}
      </div>

      <Tabs defaultValue="peticiones">
        <TabsList className="-ml-4">
          <TabsTrigger value="peticiones">Peticiones</TabsTrigger>
          <TabsTrigger value="historia">Historia</TabsTrigger>
        </TabsList>

        <TabsContent value="peticiones" className="space-y-3">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setShowPetitionForm(true)}
          >
            Hacer una petición
          </Button>

          {userPetitionsData.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Tus peticiones ({userPetitionsData.length})</h4>
              <div className="space-y-2">
                {userPetitionsData.map((petition) => (
                  <PetitionItem key={petition.id} petition={petition} />
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="historia" className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Historia</h3>
            <p className="text-sm leading-relaxed">
              {memorial.story}
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Biografía</h3>
            <p className="text-sm leading-relaxed">
              {memorial.biography}
            </p>
          </div>
        </TabsContent>
      </Tabs>

      <PetitionForm
        animitaId={id}
        open={showPetitionForm}
        onOpenChange={setShowPetitionForm}
      />
    </>
  )
}

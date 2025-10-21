'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { getInitials } from '@/lib/utils'

import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel'

type Candle = {
  id: string
  duration: 'ONE_DAY' | 'THREE_DAYS' | 'SEVEN_DAYS'
  isActive: boolean
  message: string | null
  litAt: string
  expiresAt: string
  standStyle: string
  stickStyle: string
  flameStyle: string
  backgroundColor: string
  user: {
    id: string
    displayName: string | null
  } | null
}

type Testimony = {
  id: string
  content: string
  createdAt: string
  hasCandle: boolean
  images: string[]
  user: {
    id: string
    displayName: string | null
  } | null
}

type MemorialDetailResponse = {
  memorial: {
    id: string
    name: string
    story: string | null
    lat: number
    lng: number
    isPublic: boolean
    city: string | null
    coordinates: [number, number]
    people: Array<{
      id: string
      name: string
      username: string
      image: string | null
      birthDate: string | null
      deathDate: string | null
      birthPlace: string | null
      deathPlace: string | null
    }>
    images: Array<{
      id: string
      url: string
      uploadedAt: string
    }>
    createdAt: string
    createdBy: {
      id: string
      displayName: string | null
    } | null
    candles: Candle[]
    testimonies: Testimony[]
  }
}

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1200&q=80'

export function MemorialDetail({ id, drawerHeight }: { id: string; drawerHeight?: number }) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'testimonios' | 'historia'>('testimonios')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [memorial, setMemorial] = useState<MemorialDetailResponse['memorial'] | null>(null)
  const [showCandleModal, setShowCandleModal] = useState(false)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const response = await fetch(`/api/memorials/${id}`)
        if (!response.ok) {
          throw new Error('No pudimos cargar el memorial')
        }
        const payload: MemorialDetailResponse = await response.json()
        if (cancelled) return
        setMemorial(payload.memorial)
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


  const mainImage = memorial?.people?.[0]?.image ?? FALLBACK_IMAGE
  const activeCandles = useMemo(
    () => (memorial?.candles ?? []).filter((candle) => candle.isActive),
    [memorial?.candles]
  )
  const totalCandles = memorial?.candles.length ?? 0
  const testimonies = memorial?.testimonies ?? []

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
        <p>{error ?? 'No encontramos este memorial.'}</p>
        <Button variant="secondary" onClick={() => router.back()}>
          Volver al mapa
        </Button>
      </div>
    )
  }

  const people = memorial.people
  const person = people[0]
  const birthYear = person?.birthDate ? new Date(person.birthDate).getFullYear() : null
  const deathYear = person?.deathDate ? new Date(person.deathDate).getFullYear() : null

  return (
    <>
      <div className="space-y-3 py-3">
        <h2 className="normal-case text-2xl font-semibold">
          {person?.name ?? memorial.name}
        </h2>

        {person && (birthYear || deathYear || person.birthPlace || person.deathPlace) && (
          <div className="-mt-1.5 space-y-4">
            {people.map((p) => {
              const bYear = p.birthDate ? new Date(p.birthDate).getFullYear() : null
              const dYear = p.deathDate ? new Date(p.deathDate).getFullYear() : null
              return (
                <span key={p.id} className="inline-flex gap-2 items-center">
                  {people.length > 1 && <span className="font-semibold">{p.name}:</span>}
                  {bYear && p.birthPlace && bYear}
                  {bYear && !p.birthPlace && bYear}
                  {(bYear || dYear) && ' ✝︎ '}
                  {dYear && p.deathPlace && dYear}
                  {dYear && !p.deathPlace && dYear}
                </span>
              )
            })}
          </div>
        )}

        <Button className="w-full" onClick={() => setShowCandleModal(true)}>
          Prende una vela
        </Button>

        {memorial.images && memorial.images.length > 0 && (
          <Carousel className="relative mt-4 -mx-6">
            <CarouselContent>
              {memorial.images.map((image) => (
                <CarouselItem key={image.id} className="pl-1 basis-4/12">
                  <div className="relative w-full aspect-[3/4] overflow-hidden bg-muted">
                    <Image
                      src={image.url}
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

        <div className="flex items-center gap-3 pb-3 pt-3">
          {activeCandles.length > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2 overflow-hidden">
                {activeCandles.slice(0, 3).map((candle) => (
                  <Avatar key={candle.id} className="inline-block size-8 bg-background-weaker border border-border-weak">
                    {/* The user object from the API for a candle doesn't have an image. */}
                    <AvatarFallback>{getInitials(candle.user?.displayName)}</AvatarFallback>
                  </Avatar>
                ))}
              </div>
              <span className="text-sm text-foreground/50">
                {activeCandles.length} prendieron una vela
              </span>
            </div>
          )}
        </div>
      </div>

      <p className="text-sm">
        {memorial.story}
      </p>

      {/* <div className="flex items-center gap-3 pb-3 pt-3 border-b border-b-border-weak">
        <Image
          src={mainImage}
          alt={memorial.name}
          width={32}
          height={32}
          className="size-8 object-cover object-center rounded-full"
        />

        <p className="text-sm">
          {memorial.createdBy?.displayName ?? 'Memorial colectivo'}
        </p>
      </div> */}
    </>
  )
}

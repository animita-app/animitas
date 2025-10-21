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

export function MemorialDetail({ id }: { id: string }) {
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


      <div className="flex items-center gap-3 pb-3 pt-3 border-b border-b-border-weak">
        {/* <Image
          src={mainImage}
          alt={memorial.name}
          width={32}
          height={32}
          className="size-8 object-cover object-center rounded-full"
        /> */}

        <p className="text-sm">
          {memorial.createdBy?.displayName ?? 'Memorial colectivo'}
        </p>
      </div>

      {/* <LightCandleModal
        open={showCandleModal}
        onOpenChange={setShowCandleModal}
        memorialId={id}
        onSubmit={async (data) => {
          const response = await fetch('/api/candles', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              memorialId: id,
              ...data.candleStyle,
              testimony: data.testimony,
              duration: data.duration,
              isAnonymous: data.isAnonymous,
            }),
          })

          if (!response.ok) {
            throw new Error('No pudimos prender la vela')
          }

          const memorialResponse = await fetch(`/api/memorials/${id}`)
          if (memorialResponse.ok) {
            const payload: MemorialDetailResponse = await memorialResponse.json()
            setMemorial(payload.memorial)
          }
        }}
      /> */}

      {/* <div className="">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="relative h-28 w-28 overflow-hidden rounded-full border border-white/30 shadow-lg">
            <img
              src={mainImage}
              alt={memorial.name}
              className="h-full w-full object-cover object-center"
            />
          </div>
          <div className="space-y-0.5">
            <h2 className="text-2xl font-semibold tracking-tight">{memorial.name}</h2>
            <p className="text-sm uppercase tracking-[0.3em]/70">
              {memorial.createdBy?.name ?? 'Memorial colectivo'}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 text-xs uppercase tracking-[0.3em]/70">
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {memorial.coordinates[1].toFixed(2)}°S · {memorial.coordinates[0].toFixed(2)}°W
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock3 className="h-3.5 w-3.5" />
              desde {new Date(memorial.createdAt).getFullYear()}
            </span>
          </div>

          <Button className="mt-2 h-12 rounded-full border border-white/40 bg-white/20 px-10 text-xs uppercase tracking-[0.4em] shadow-[0_8px_30px_rgba(0,0,0,0.25)] hover:bg-white/30">
            PRÉNDE UNA VELA
          </Button>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <StatPill
            icon={<Flame className="h-3.5 w-3.5" />}
            label="Velas activas"
            value={String(activeCandles.length)}
          />
          <StatPill
            icon={<Wand2 className="h-3.5 w-3.5" />}
            label="Velas totales"
            value={String(totalCandles)}
          />
          <StatPill
            icon={<Sparkles className="h-3.5 w-3.5" />}
            label="Testimonios"
            value={String(testimonies.length)}
          />
        </div>
      </div>

      <div className="space-y-6 px-6 pb-10">
        <div className="relative mt-6 overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-inner">
          <img
            src={mainImage}
            alt={`Vista del memorial ${memorial.name}`}
            className="h-64 w-full object-cover object-center"
          />
        </div>

        <div className="flex items-center gap-3 rounded-full border border-white/15 bg-white/5 p-1 text-sm uppercase tracking-[0.35em]/70">
          <button
            type="button"
            onClick={() => setActiveTab('testimonios')}
            className={`flex-1 rounded-full py-3 transition ${
              activeTab === 'testimonios'
                ? 'bg-white/20 shadow-[0_6px_20px_rgba(0,0,0,0.25)]'
                : 'hover:bg-white/10'
            }`}
          >
            Testimonios
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('historia')}
            className={`flex-1 rounded-full py-3 transition ${
              activeTab === 'historia'
                ? 'bg-white/20 shadow-[0_6px_20px_rgba(0,0,0,0.25)]'
                : 'hover:bg-white/10'
            }`}
          >
            Historia
          </button>
        </div>

        {activeCandles.length > 0 ? (
          <div className="space-y-3 rounded-3xl border border-white/15 bg-white/6 p-5 shadow-inner">
            {activeCandles.map((candle) => (
              <div
                key={candle.id}
                className="flex items-center justify-between rounded-2xl bg-white/8 px-4 py-3 text-xs uppercase tracking-[0.3em]/80"
              >
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#ffb347] text-[#2f2b2a] shadow">
                    <Flame className="h-3.5 w-3.5" />
                  </span>
                  <span className="font-semibold">
                    {candle.user?.name ?? 'Anónimo'}
                  </span>
                </div>
                <span className="text-white">{formatCountdown(candle.expiresAt)}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-white/10 bg-white/5 px-6 py-5 text-sm/70">
            No hay velas activas por ahora. ¡Sé la primera persona en prender una!
          </div>
        )}

        {activeTab === 'historia' ? (
          <div className="space-y-4 rounded-3xl border border-white/10 bg-white/6 px-6 py-6 leading-relaxed/80">
            <p>{memorial.story ?? 'Aún no registramos la historia completa de esta animita.'}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {testimonies.length === 0 ? (
              <div className="rounded-3xl border border-white/10 bg-white/5 px-6 py-6 text-sm/70">
                Sé la primera persona en dejar un testimonio para este memorial.
              </div>
            ) : (
              testimonies.map((testimony) => (
                <article
                  key={testimony.id}
                  className="space-y-4 rounded-3xl border border-white/12 bg-white/6 px-6 py-6 shadow-lg shadow-black/20"
                >
                  <header className="flex items-center justify-between text-xs uppercase tracking-[0.32em]/70">
                    <span>{testimony.user?.name ?? 'Anónimo'}</span>
                    <span>{formatRelative(testimony.createdAt)}</span>
                  </header>
                  <p className="whitespace-pre-line text-base leading-7 tracking-wide/90">
                    {testimony.content}
                  </p>
                  <footer className="flex items-center gap-3 text-xs uppercase tracking-[0.3em]/60">
                    <span className="inline-flex items-center gap-1 rounded-full bg-white/8 px-3 py-1">
                      <Sparkles className="h-3.5 w-3.5" />
                      {testimony.hasCandle ? 'Con vela' : 'Sin vela'}
                    </span>
                  </footer>
                </article>
              ))
            )}
          </div>
        )}
      </div> */}
    </>
  )
}

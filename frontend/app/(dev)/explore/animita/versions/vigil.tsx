'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Flame, Navigation } from 'lucide-react'
import type { Animita } from '@/types/animita'
import { directionsUrl } from '@/lib/location'
import { cn } from '@/lib/utils'
import { useLocalCandles, useLocalNotes, candlesLabel, sinceYear } from '../use-local-candles'

export function Vigil({ animita }: { animita: Animita }) {
  const { count, isLit, toggle } = useLocalCandles()
  const { notes, draft, setDraft, add } = useLocalNotes()
  const place = [animita.address, animita.city_region].filter(Boolean).join(', ')
  const [cover, ...rest] = animita.images ?? []

  return (
    <div className="min-h-svh bg-black text-(--bone)">
      <section aria-labelledby="vigil-name" className="relative flex min-h-svh flex-col justify-end overflow-hidden">
        {cover && (
          <Image
            src={cover}
            alt=""
            fill
            priority
            sizes="100vw"
            className={cn('object-cover transition-[filter,opacity] duration-1000 ease-[cubic-bezier(0.2,0,0,1)] motion-reduce:transition-none', isLit ? 'opacity-70 grayscale-0 sepia-[0.3]' : 'opacity-35 grayscale')}
          />
        )}
        <div aria-hidden className="absolute inset-0 bg-linear-to-t from-black via-black/60 to-black/30" />
        <div
          aria-hidden
          className={cn(
            'halo pointer-events-none absolute bottom-24 left-1/2 size-96 -translate-x-1/2 rounded-full bg-(--wax)/25 blur-3xl transition-opacity duration-700 motion-reduce:transition-none',
            isLit ? 'opacity-100' : 'opacity-0'
          )}
        />

        <Link href="/map" aria-label="Volver al mapa" className="absolute top-4 left-4 z-10 rounded-full p-2 text-(--bone-muted) hover:text-(--bone) focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--wax)/50">
          <ArrowLeft size={20} className="-translate-x-px" />
        </Link>

        <div className="relative mx-auto w-full max-w-2xl space-y-8 px-6 pb-16 text-center">
          <div className="space-y-3">
            <h1 id="vigil-name" className="font-(family-name:--font-vigil) text-6xl leading-none text-balance">{animita.title}</h1>
            {place && <p className="text-sm text-(--bone-muted) text-pretty">{place}</p>}
          </div>

          <div className="flex flex-col items-center gap-3">
            <button
              type="button"
              onClick={toggle}
              aria-pressed={isLit}
              aria-label={isLit ? 'Apagar tu vela' : 'Prender una vela'}
              className={cn(
                'grid size-20 place-items-center rounded-full border transition-colors duration-500 active:scale-[0.97] motion-reduce:active:scale-100 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--wax)/50',
                isLit ? 'border-(--wax) text-(--wax)' : 'border-(--bone-muted)/40 text-(--bone-muted) hover:border-(--bone) hover:text-(--bone)'
              )}
            >
              <Flame size={32} className={cn(isLit && 'flame fill-current')} />
            </button>
            <p aria-live="polite" className="text-sm text-(--bone-muted)">
              {isLit ? (count === 1 ? 'Tu vela está prendida' : `Tu vela y ${(count - 1).toLocaleString('es-CL')} más`) : count === 0 ? 'Prende la primera vela' : candlesLabel(count)}
            </p>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-2xl space-y-16 px-6 pt-16 pb-32">
        {animita.story && (
          <section aria-label="Su historia">
            <p className="text-lg leading-relaxed text-(--bone)/90 whitespace-pre-line text-pretty">{animita.story}</p>
          </section>
        )}

        {rest.length > 0 && (
          <section aria-label="Más fotos" className="grid grid-cols-3 gap-2">
            {rest.map((src, i) => (
              <div key={src} className="relative aspect-square overflow-hidden">
                <Image src={src} alt={`Animita de ${animita.title}, foto ${i + 2}`} fill sizes="(max-width: 672px) 33vw, 224px" className="faded object-cover" tabIndex={0} />
              </div>
            ))}
          </section>
        )}

        <section aria-label="Dónde está" className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm text-(--bone-muted)">En el mapa desde {sinceYear(animita.created_at)}, agregada por {animita.created_by.name}</p>
          <a href={directionsUrl(animita.location)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full border border-(--bone-muted)/40 px-4 py-2 text-sm hover:border-(--bone) focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--wax)/50">
            <Navigation size={14} />
            Cómo llegar
          </a>
        </section>

        <section aria-labelledby="vigil-notes" className="space-y-6">
          <h2 id="vigil-notes" className="font-(family-name:--font-vigil) text-3xl">Recuerdos</h2>
          <form onSubmit={(e) => { e.preventDefault(); add() }} className="space-y-3">
            <label className="block">
              <span className="sr-only">Deja un recuerdo</span>
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                rows={3}
                placeholder="Deja un recuerdo"
                className="w-full resize-none rounded-lg border border-(--bone-muted)/30 bg-white/5 p-4 text-base placeholder:text-(--bone-muted) focus:border-(--wax) focus:outline-none"
              />
            </label>
            <div className="flex justify-end">
              <button type="submit" className="rounded-full bg-(--bone) px-4 py-2 text-sm text-black hover:bg-(--bone)/90 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--wax)/50">
                Dejar recuerdo
              </button>
            </div>
          </form>
          {notes.length === 0 ? (
            <p className="text-sm text-(--bone-muted)">Nadie ha dejado un recuerdo todavía.</p>
          ) : (
            <ul className="space-y-6">
              {notes.map(n => (
                <li key={n.id} className="space-y-1">
                  <p className="text-base whitespace-pre-line text-pretty">{n.text}</p>
                  <p className="text-xs text-(--bone-muted)">{n.author}, recién</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  )
}

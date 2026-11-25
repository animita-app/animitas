'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Flame, Navigation } from 'lucide-react'
import type { Animita } from '@/types/animita'
import { directionsUrl } from '@/lib/location'
import { cn } from '@/lib/utils'
import { useLocalCandles, useLocalNotes, candlesLabel, sinceYear } from '../use-local-candles'

function coords({ lat, lng }: { lat: number; lng: number }) {
  const f = (n: number) => Math.abs(n).toLocaleString('es-CL', { minimumFractionDigits: 4, maximumFractionDigits: 4 })
  return `${f(lat)}° S  ${f(lng)}° O`
}

export function Plaque({ animita }: { animita: Animita }) {
  const { count, isLit, toggle } = useLocalCandles()
  const { notes, draft, setDraft, add } = useLocalNotes()
  const place = [animita.address, animita.city_region].filter(Boolean).join(', ')

  return (
    <div className="grain grain-night min-h-svh bg-(--night) text-(--bone)">
      <header className="mx-auto flex max-w-2xl items-center justify-between px-6 pt-6">
        <Link href="/map" aria-label="Volver al mapa" className="-ml-2 rounded-full p-2 text-(--bone-muted) hover:text-(--bone) focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--wax)/50">
          <ArrowLeft size={20} className="-translate-x-px" />
        </Link>
        <p className="font-ibm-plex-mono text-xs text-(--bone-muted)">{coords(animita.location)}</p>
      </header>

      <main className="mx-auto max-w-2xl space-y-16 px-6 pt-16">
        <section aria-labelledby="plaque-name" className="space-y-6 text-center">
          <p className="font-ibm-plex-mono text-xs text-(--bone-muted)">aquí se recuerda a</p>
          <h1 id="plaque-name" className="font-(family-name:--font-plaque) text-5xl leading-tight text-balance">
            {animita.title}
          </h1>
          {place && <p className="font-ibm-plex-mono text-xs text-(--bone-muted) text-pretty">{place}</p>}
        </section>

        {animita.images && animita.images.length > 0 && (
          <section aria-label="Fotos" className="grid grid-cols-6 gap-2">
            {animita.images.map((src, i) => (
              <figure
                key={src}
                className={cn(
                  'relative overflow-hidden bg-(--night-2)',
                  i === 0 ? 'col-span-6 aspect-4/3' : animita.images!.length - 1 === 2 ? 'col-span-3 aspect-square' : 'col-span-2 aspect-square'
                )}
              >
                <Image
                  src={src}
                  alt={`Animita de ${animita.title}, foto ${i + 1}`}
                  fill
                  sizes="(max-width: 672px) 100vw, 672px"
                  className="faded object-cover"
                  tabIndex={0}
                />
              </figure>
            ))}
          </section>
        )}

        <section aria-label="Velas" className="flex flex-col items-center gap-4">
          <button
            type="button"
            onClick={toggle}
            aria-pressed={isLit}
            className={cn(
              'group relative flex items-center gap-2 rounded-full border px-6 py-3 text-sm transition-colors duration-300 active:scale-[0.97] motion-reduce:active:scale-100 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--wax)/50',
              isLit ? 'border-(--wax) bg-(--wax-soft) text-(--wax)' : 'border-(--bone-muted)/40 text-(--bone) hover:border-(--bone-muted)'
            )}
          >
            {isLit && <span aria-hidden className="halo pointer-events-none absolute -inset-4 rounded-full bg-(--wax)/20 blur-xl" />}
            <Flame size={16} className={cn(isLit && 'flame fill-current')} />
            <span>{isLit ? 'Tu vela está prendida' : 'Prender una vela'}</span>
          </button>
          <p aria-live="polite" className="font-ibm-plex-mono text-xs text-(--bone-muted)">
            {count === 0 ? 'nadie ha prendido una vela todavía' : candlesLabel(count)}
          </p>
        </section>

        {animita.story && (
          <section aria-label="Su historia">
            <p className="font-(family-name:--font-plaque) text-xl leading-relaxed whitespace-pre-line text-pretty">
              {animita.story}
            </p>
          </section>
        )}

        <section aria-label="Dónde está" className="flex flex-col items-center gap-3 text-center">
          <a
            href={directionsUrl(animita.location)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm underline decoration-1 underline-offset-4 decoration-(--bone-muted) hover:decoration-[3px] hover:decoration-(--wax) focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--wax)/50"
          >
            <Navigation size={14} />
            Cómo llegar
          </a>
          <p className="font-ibm-plex-mono text-xs text-(--bone-muted)">
            en el mapa desde {sinceYear(animita.created_at)}, agregada por {animita.created_by.name}
          </p>
        </section>

        <section aria-labelledby="plaque-notes" className="space-y-6 pb-32">
          <h2 id="plaque-notes" className="font-ibm-plex-mono text-xs text-(--bone-muted)">recuerdos</h2>
          <form
            onSubmit={(e) => { e.preventDefault(); add() }}
            className="flex items-end gap-3"
          >
            <label className="flex-1">
              <span className="sr-only">Deja un recuerdo</span>
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                rows={2}
                placeholder="Deja un recuerdo"
                className="w-full resize-none border-0 border-b border-(--bone-muted)/40 bg-transparent pb-2 font-(family-name:--font-plaque) text-lg placeholder:text-(--bone-muted) focus:border-(--wax) focus:outline-none"
              />
            </label>
            <button type="submit" className="rounded-full px-4 py-2 text-sm text-(--wax) hover:bg-(--wax-soft) focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--wax)/50">
              Dejar
            </button>
          </form>
          {notes.length === 0 ? (
            <p className="font-(family-name:--font-plaque) text-lg text-(--bone-muted)">Nadie ha dejado un recuerdo todavía.</p>
          ) : (
            <ul className="space-y-6">
              {notes.map(n => (
                <li key={n.id} className="space-y-1">
                  <p className="font-(family-name:--font-plaque) text-lg whitespace-pre-line text-pretty">{n.text}</p>
                  <p className="font-ibm-plex-mono text-xs text-(--bone-muted)">{n.author}, recién</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  )
}

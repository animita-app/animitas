'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Flame } from 'lucide-react'
import type { Animita } from '@/types/animita'
import { directionsUrl } from '@/lib/location'
import { cn } from '@/lib/utils'
import { useLocalCandles, useLocalNotes, candlesLabel, sinceYear } from '../use-local-candles'

const MAX_FLAMES = 24
const TILTS = ['-rotate-2', 'rotate-1', '-rotate-1', 'rotate-2', 'rotate-0']
const TAPES = ['-rotate-6 left-6', 'rotate-3 right-8', '-rotate-2 left-1/2 -translate-x-1/2', 'rotate-6 left-10']

export function Altar({ animita }: { animita: Animita }) {
  const { count, isLit, toggle } = useLocalCandles()
  const { notes, draft, setDraft, add } = useLocalNotes()
  const place = [animita.address, animita.city_region].filter(Boolean).join(', ')
  const flames = Math.min(count, MAX_FLAMES)

  return (
    <div className="grain min-h-svh bg-(--paper) text-(--paper-ink)">
      <header className="mx-auto flex max-w-3xl items-center gap-3 px-6 pt-6 text-sm">
        <Link href="/map" aria-label="Volver al mapa" className="-ml-2 rounded-full p-2 text-(--paper-muted) hover:text-(--paper-ink) focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--paper-ink)/30">
          <ArrowLeft size={20} className="-translate-x-px" />
        </Link>
        <span className="text-(--paper-muted)">animitas</span>
      </header>

      <main className="mx-auto max-w-3xl space-y-12 px-6 pt-8">
        <section aria-labelledby="altar-name" className="space-y-2">
          <h1 id="altar-name" className="text-3xl font-medium lowercase text-balance">
            animita de {animita.title}
          </h1>
          <p className="text-sm text-(--paper-muted) text-pretty">
            {place ? `${place.toLowerCase()}, ` : ''}en el mapa desde {sinceYear(animita.created_at)}
          </p>
        </section>

        {animita.images && animita.images.length > 0 && (
          <section aria-label="Fotos" className={cn('grid grid-cols-2 gap-x-6 gap-y-10', animita.images.length % 3 !== 1 && 'sm:grid-cols-3', animita.images.length % 3 === 1 && 'sm:grid-cols-4')}>
            {animita.images.map((src, i) => (
              <figure key={src} className={cn('relative bg-white p-2 pb-8 shadow-md', TILTS[i % TILTS.length])}>
                <span aria-hidden className={cn('absolute -top-3 z-10 h-6 w-16 bg-(--tape) shadow-xs', TAPES[i % TAPES.length])} />
                <div className="relative aspect-square overflow-hidden">
                  <Image src={src} alt={`Animita de ${animita.title}, foto ${i + 1}`} fill sizes="(max-width: 640px) 50vw, 240px" className="faded object-cover" tabIndex={0} />
                </div>
              </figure>
            ))}
          </section>
        )}

        <section aria-label="Velas" className="space-y-4">
          <div aria-hidden className="flex min-h-8 flex-wrap items-end gap-2 text-(--wax)">
            {Array.from({ length: flames }).map((_, i) => (
              <Flame key={i} size={20} className="flame fill-current" />
            ))}
            {count > MAX_FLAMES && <span className="text-sm text-(--paper-muted)">+{(count - MAX_FLAMES).toLocaleString('es-CL')}</span>}
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={toggle}
              aria-pressed={isLit}
              className={cn(
                'inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm active:scale-[0.97] motion-reduce:active:scale-100 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--paper-ink)/30',
                isLit ? 'bg-(--paper-ink) text-(--paper)' : 'bg-(--paper-ink)/5 hover:bg-(--paper-ink)/10'
              )}
            >
              <Flame size={16} className={cn(isLit && 'fill-(--wax) text-(--wax)')} />
              {isLit ? 'tu vela está prendida' : 'prender una vela'}
            </button>
            <p aria-live="polite" className="text-sm text-(--paper-muted)">
              {count === 0 ? 'todavía no hay velas' : candlesLabel(count)}
            </p>
          </div>
        </section>

        {animita.story && (
          <section aria-label="Su historia" className="max-w-prose">
            <p className="text-base leading-relaxed whitespace-pre-line text-pretty">{animita.story}</p>
          </section>
        )}

        <p className="text-sm">
          <a href={directionsUrl(animita.location)} target="_blank" rel="noopener noreferrer" className="underline decoration-1 underline-offset-4 hover:decoration-2 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--paper-ink)/30">
            cómo llegar
          </a>
          <span className="text-(--paper-muted)">, agregada por {animita.created_by.name.toLowerCase()}</span>
        </p>

        <section aria-labelledby="altar-notes" className="space-y-6 pb-32">
          <h2 id="altar-notes" className="text-sm font-medium">recuerdos</h2>
          <form onSubmit={(e) => { e.preventDefault(); add() }} className="max-w-sm -rotate-1 bg-(--tape) p-4 shadow-md">
            <label>
              <span className="sr-only">Deja un recuerdo</span>
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                rows={3}
                placeholder="déjale unas palabras"
                className="w-full resize-none bg-transparent font-(family-name:--font-note) text-2xl leading-tight placeholder:text-(--paper-muted) focus:outline-none"
              />
            </label>
            <div className="flex justify-end">
              <button type="submit" className="rounded-full px-3 py-1 text-sm hover:bg-(--paper-ink)/10 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--paper-ink)/30">
                dejar nota
              </button>
            </div>
          </form>
          {notes.length > 0 && (
            <ul className="grid gap-6 sm:grid-cols-2">
              {notes.map((n, i) => (
                <li key={n.id} className={cn('bg-white p-4 shadow-md', TILTS[(i + 1) % TILTS.length])}>
                  <p className="font-(family-name:--font-note) text-2xl leading-tight whitespace-pre-line text-pretty">{n.text}</p>
                  <p className="mt-2 text-xs text-(--paper-muted)">{n.author.toLowerCase()}, recién</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  )
}

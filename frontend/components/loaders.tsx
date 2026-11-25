'use client'

import Image from 'next/image'
import { cn } from '@/lib/utils'
import { useEffect, useRef, useState } from 'react'
import type React from 'react'
import { CutoutText, preloadCutouts } from '@/components/cutout-text'

// Three real candles, photographed lit. Each animita gets one of them (always the same one), so candles
// differ the way real ones do. `wax` is where the wax starts, as a share of the photo's height: out, the
// photo is cut there, leaving the wick, so an unlit candle is the same real candle without its flame.
const CANDLES = [
  { src: '/cutouts/vela-1.png', w: 129, h: 420, wax: 0.652 },
  { src: '/cutouts/vela-2.png', w: 123, h: 420, wax: 0.695 },
  { src: '/cutouts/vela-3.png', w: 82, h: 258, wax: 0.601 },
]

function candleFor(seed: string) {
  let h = 0
  for (const c of seed) h = (h * 31 + c.charCodeAt(0)) % 997
  return CANDLES[h % CANDLES.length]
}

export function Candle({ lit = true, seed = '', className }: { lit?: boolean; seed?: string; className?: string }) {
  // Only a change to lit plays the halo, not a candle that's already burning when the page loads.
  const [justLit, setJustLit] = useState(false)
  const wasLit = useRef(lit)
  useEffect(() => {
    if (lit && !wasLit.current) {
      setJustLit(true)
      const t = setTimeout(() => setJustLit(false), 1200)
      wasLit.current = lit
      return () => clearTimeout(t)
    }
    wasLit.current = lit
  }, [lit])
  const candle = candleFor(seed)
  const flameTop = `${(candle.wax * 100).toFixed(1)}%`
  return (
    <span
      data-lit={lit}
      data-just-lit={justLit}
      style={{ aspectRatio: `${candle.w} / ${candle.h}`, '--wax': flameTop } as React.CSSProperties}
      className={cn('candle relative inline-flex', className)}
    >
      <span aria-hidden className="flame-glow pointer-events-none absolute -inset-x-full top-0 aspect-square rounded-full bg-[radial-gradient(circle,rgb(255_190_90_/_0.6),transparent_62%)]" />
      <span aria-hidden className="flame-halo pointer-events-none absolute left-1/2 top-1/4 aspect-square w-28 -translate-x-1/2 -translate-y-1/2 rounded-full" />
      <Image src={candle.src} alt="" width={candle.w} height={candle.h} draggable={false} className="candle-body relative size-full drop-shadow-[0_4px_4px_rgb(28_24_20_/_0.3)]" />
      {/* Out: the wick left standing where the flame was. */}
      <span aria-hidden className="candle-wick pointer-events-none absolute left-1/2 h-1.5 w-px -translate-x-1/2 -translate-y-full bg-text-strong/80" style={{ top: flameTop }} />
    </span>
  )
}

// A photo that hasn't developed yet, in place of an image that is still loading.
export function DevelopingPhoto({ className }: { className?: string }) {
  return <span aria-hidden className={cn('developing block aspect-square', className)} />
}

// "cargando" glued on letter by letter while whatever it waits for arrives.
export function GluingWord({ text = 'cargando', className }: { text?: string; className?: string }) {
  // Every cut of these letters is fetched up front, so each new round shows whole.
  useEffect(() => preloadCutouts(text), [text])
  return <CutoutText text={text} height={30} glue className={className} />
}

// Loading: the page's edges darken like an old photo. Only a wait long enough to notice also gets the
// word, so a quick load never flashes it.
const WORD_AFTER_MS = 700

export function LoadingVignette({ text = 'cargando' }: { text?: string }) {
  const [slow, setSlow] = useState(false)
  useEffect(() => {
    const timer = setTimeout(() => setSlow(true), WORD_AFTER_MS)
    return () => clearTimeout(timer)
  }, [])
  return (
    <>
      <span aria-hidden className="vignette vignette-loading pointer-events-none fixed inset-0" />
      {slow && <GluingWord text={text} className="animate-in fade-in duration-300" />}
    </>
  )
}

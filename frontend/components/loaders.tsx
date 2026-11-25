'use client'

import Image from 'next/image'
import { cn } from '@/lib/utils'
import { useEffect, useRef, useState } from 'react'
import { CutoutText, preloadCutouts } from '@/components/cutout-text'

// A real lit candle, photographed. Lit, its light flickers and warms the paper; out, the same photo dims
// and its flame is hidden under a soft cap of shadow, so it never looks drawn. Lighting it blooms a halo.
export function Candle({ lit = true, className }: { lit?: boolean; className?: string }) {
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
  return (
    <span data-lit={lit} data-just-lit={justLit} className={cn('candle relative inline-flex aspect-271/390', className)}>
      <span aria-hidden className="flame-glow pointer-events-none absolute -inset-x-full -top-1/4 aspect-square rounded-full bg-[radial-gradient(circle,rgb(255_190_90_/_0.6),transparent_62%)]" />
      <span aria-hidden className="flame-halo pointer-events-none absolute left-1/2 top-1/8 aspect-square w-28 -translate-x-1/2 -translate-y-1/2 rounded-full" />
      <Image src="/cutouts/vela-prendida.png" alt="" width={271} height={390} draggable={false} className="candle-body relative size-full drop-shadow-[0_4px_4px_rgb(28_24_20_/_0.3)]" />
      {/* Out: the flame area fades into the paper. */}
      <span aria-hidden className="candle-snuff pointer-events-none absolute inset-x-1/4 top-0 h-[30%] bg-[radial-gradient(ellipse_at_50%_40%,var(--color-background)_45%,transparent_75%)]" />
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

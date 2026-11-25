'use client'

import Image from 'next/image'
import { cn } from '@/lib/utils'
import { useEffect, useRef, useState } from 'react'
import { CutoutText, preloadCutouts } from '@/components/cutout-text'

// A real white candle with a real flame, lit or out. Both are photos; the flame is its own cut-out so it
// can flicker. Inside a `.candle-toggle`, an unlit candle catches the flame while you reach for it.
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
    <span data-lit={lit} data-just-lit={justLit} className={cn('candle relative inline-flex aspect-[118/300] flex-col items-center justify-end', className)}>
      <span aria-hidden className="flame-glow pointer-events-none absolute -inset-x-full top-0 aspect-square rounded-full bg-[radial-gradient(circle,rgb(255_190_90_/_0.7),transparent_62%)]" />
      {/* A halo that blooms out when the candle is lit, then settles into the steady glow. */}
      <span aria-hidden className="flame-halo pointer-events-none absolute left-1/2 top-2 aspect-square w-12 -translate-x-1/2 -translate-y-1/2 rounded-full" />
      {/* The flame is cut from a photo of a real one; it flickers as a whole. */}
      <Image src="/cutouts/flame.png" alt="" width={165} height={420} draggable={false} className="flame relative h-1/3 w-auto drop-shadow-[0_0_3px_rgb(255_170_60_/_0.8)]" />
      {/* The wick, which stays when the flame is out. */}
      <span aria-hidden className="relative -mt-0.5 h-1 w-px bg-text-strong/80" />
      <Image
        src="/cutouts/vela.png"
        alt=""
        width={118}
        height={240}
        draggable={false}
        className="candle-body relative -mt-px h-auto w-full drop-shadow-[0_4px_4px_rgb(28_24_20_/_0.3)]"
      />
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

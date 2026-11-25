'use client'

import Image from 'next/image'
import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'
import { CutoutText, preloadCutouts } from '@/components/cutout-text'

// The real candle from the shelf, lit or out. Loading and error states use it instead of spinners.
// Inside a `.candle-toggle`, an unlit candle catches light while you reach for it.
export function Candle({ lit = true, className }: { lit?: boolean; className?: string }) {
  return (
    <span data-lit={lit} className={cn('candle relative inline-flex', className)}>
      <span aria-hidden className="candle-glow candle-light pointer-events-none absolute -inset-1/2 rounded-full bg-[radial-gradient(circle,rgb(240_150_60_/_0.5),transparent_60%)]" />
      <Image
        src="/cutouts/candle.png"
        alt=""
        width={160}
        height={146}
        draggable={false}
        className="candle-body relative h-full w-auto drop-shadow-[0_4px_4px_rgb(28_24_20_/_0.35)]"
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

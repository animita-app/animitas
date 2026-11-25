'use client'

import Image from 'next/image'
import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'
import { CutoutText, preloadCutouts } from '@/components/cutout-text'

// A real white candle with a drawn flame, lit or out. The flame is its own shape so it can flicker; the
// wax is a photo. Inside a `.candle-toggle`, an unlit candle catches the flame while you reach for it.
export function Candle({ lit = true, className }: { lit?: boolean; className?: string }) {
  return (
    <span data-lit={lit} className={cn('candle relative inline-flex aspect-[118/300] flex-col items-center justify-end', className)}>
      <span aria-hidden className="flame-glow pointer-events-none absolute -inset-x-full top-0 aspect-square rounded-full bg-[radial-gradient(circle,rgb(255_190_90_/_0.7),transparent_62%)]" />
      <svg aria-hidden viewBox="0 0 20 40" className="flame relative h-1/3 w-auto overflow-visible">
        <defs>
          <radialGradient id="flame-fill" cx="50%" cy="72%" r="60%">
            <stop offset="0" stopColor="#fffbe8" />
            <stop offset="0.35" stopColor="#ffe08a" />
            <stop offset="0.75" stopColor="#ff9f2e" />
            <stop offset="1" stopColor="#e2541a" stopOpacity="0.9" />
          </radialGradient>
        </defs>
        <path d="M10 1 C13.5 9 17.5 16 17.5 25 C17.5 32.5 14 38 10 38 C6 38 2.5 32.5 2.5 25 C2.5 16 6.5 9 10 1 Z" fill="url(#flame-fill)" />
        <ellipse cx="10" cy="30" rx="3" ry="5" fill="#7fb4ff" opacity="0.55" />
      </svg>
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

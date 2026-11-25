'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

import pack from '@/lib/cutout-letters.json'

// Letters cut from real print, one image each, from a cut-out letter pack. Several variants per
// character so the same word never repeats its look.
type Glyph = [index: number, width: number, height: number]
const PACK = pack as unknown as Record<string, { dir: string; glyphs: Glyph[] }>

function hash(text: string) {
  let h = 7
  for (const c of text) h = (h * 31 + c.charCodeAt(0)) % 9973
  return h
}

function noise(seed: number, i: number) {
  const x = Math.sin(seed * 12.9898 + i * 78.233) * 43758.5453
  return x - Math.floor(x)
}

function pick<T>(list: T[], seed: number, i: number) {
  return list[Math.floor(noise(seed, i) * list.length)]
}

// Warms the browser cache with every cut of these letters, so a label that shows on hover appears whole.
export function preloadCutouts(text: string) {
  const keys = new Set(Array.from(text.toLowerCase().normalize('NFD')).map(c => (c === '\u0301' ? 'dash' : c === '\u0303' ? 'tilde' : c)))
  for (const key of keys) {
    const set = PACK[key]
    set?.glyphs.forEach(([index]) => { new Image().src = `/cutouts/letters/${set.dir}/${index}.webp` })
  }
}

function cut(key: string, seed: number, i: number) {
  const set = PACK[key]
  if (!set?.glyphs.length) return null
  const [index, w, h] = pick(set.glyphs, seed, i)
  return { src: `/cutouts/letters/${set.dir}/${index}.webp`, ratio: w / h }
}

// Accented letters don't exist in the pack: the base letter gets a scrap glued on top, a dash for an
// acute accent and the pack's tilde for the ñ.
function Tile({ char, seed, i, size }: { char: string; seed: number; i: number; size: number }) {
  const [base, mark] = Array.from(char.normalize('NFD'))
  const glyph = cut(base, seed, i + 11)
  if (!glyph) return null
  const scrap = mark === '\u0301' ? cut('dash', seed, i + 29) : mark === '\u0303' ? cut('tilde', seed, i + 31) : null
  return (
    <span className="relative inline-block">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={glyph.src} alt="" draggable={false} width={Math.round(size * glyph.ratio)} height={Math.round(size)} className="block max-w-none" />
      {scrap && (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={scrap.src}
          alt=""
          draggable={false}
          className="absolute left-1/2 block max-w-none"
          style={{
            width: size * (mark === '\u0303' ? 0.7 : 0.42),
            height: 'auto',
            top: -size * 0.22,
            translate: mark === '\u0303' ? '-50% 0' : '-10% 0',
            rotate: mark === '\u0303' ? '-4deg' : '-58deg',
          }}
        />
      )}
    </span>
  )
}

// The loader's rhythm: slap the letters on one by one until the word is whole, let it be read, peel it
// all off together and cut a new set. With reduced motion the word just stays.
const GLUE_STEP = 150
const GLUE_HOLD = 1400
const GLUE_PEEL = 350

function useGluing(active: boolean, n: number, recut: () => void) {
  const [glued, setGlued] = useState(active ? 0 : n)
  const recutRef = useRef(recut)
  recutRef.current = recut
  useEffect(() => {
    if (!active) return
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setGlued(n)
      return
    }
    let timer: ReturnType<typeof setTimeout>
    let count = 0
    const tick = () => {
      if (count < n) {
        count += 1
        setGlued(count)
        timer = setTimeout(tick, count === n ? GLUE_HOLD : GLUE_STEP)
      } else {
        count = 0
        setGlued(0)
        timer = setTimeout(() => { recutRef.current(); tick() }, GLUE_PEEL)
      }
    }
    timer = setTimeout(tick, GLUE_STEP)
    return () => clearTimeout(timer)
  }, [active, n])
  return glued
}

interface CutoutTextProps {
  text: string
  height?: number
  // Flowing text: degrees of arc the word bends through, its ends falling away like a frown.
  arc?: number
  // Orbiting text: letters glued along a circle around the object they name, centered at `angle`
  // (degrees, screen coordinates: 270 is straight up, 135 is down and to the left). Clockwise reads
  // with the letters' tops facing out; counterclockwise with their tops facing the object.
  orbit?: { radius: number; angle: number; clockwise?: boolean }
  // Change it to cut a new set of letters, for example every time the label shows.
  reroll?: number
  // Letters get slapped on one after another and peel off again, over and over: a loader.
  glue?: boolean
  className?: string
}

// Decorative: the control it labels always carries the same text as its accessible name.
export function CutoutText({ text, height = 22, arc = 0, orbit, reroll = 0, glue = false, className }: CutoutTextProps) {
  // The server cuts a stable set so hydration matches; the browser recuts at random right after.
  const [seed, setSeed] = useState(() => hash(text))
  useEffect(() => {
    setSeed(Math.floor(Math.random() * 1e6))
  }, [text, reroll])

  const letters = Array.from(text.toLowerCase())
  const n = letters.length
  const glued = useGluing(glue, n, () => setSeed(Math.floor(Math.random() * 1e6)))
  const sizeOf = (i: number) => height * (0.78 + noise(seed, i + 3) * 0.32)

  if (orbit) {
    const dir = orbit.clockwise === false ? -1 : 1
    const steps = letters.map((c, i) => (c === ' ' ? height * 0.45 : sizeOf(i) * 0.82) / orbit.radius)
    const span = steps.reduce((sum, s) => sum + s, 0) - steps[n - 1] / 2 - steps[0] / 2
    const start = (orbit.angle * Math.PI) / 180 - (dir * span) / 2
    const angles = steps.map((_, i) => start + dir * steps.slice(0, i).reduce((sum, s, k) => sum + (s + steps[k + 1]) / 2, 0))
    return (
      <span aria-hidden className={cn('relative block size-0', className)}>
        {letters.map((char, i) => {
          if (char === ' ') return null
          const at = angles[i]
          const tilt = (at * 180) / Math.PI + (dir > 0 ? 90 : -90) + (noise(seed, i) - 0.5) * 12
          return (
            <span
              key={i}
              className="absolute w-max drop-shadow-[0_1px_1px_rgb(28_24_20_/_0.5)]"
              style={{
                left: Math.cos(at) * orbit.radius,
                top: Math.sin(at) * orbit.radius,
                translate: '-50% -50%',
                rotate: `${tilt.toFixed(1)}deg`,
                zIndex: Math.floor(noise(seed, i + 61) * 3),
              }}
            >
              <Tile char={char} seed={seed} i={i} size={sizeOf(i)} />
            </span>
          )
        })}
      </span>
    )
  }

  const radians = (arc * Math.PI) / 180
  const radius = radians > 0 ? (n * height * 0.72) / radians : 0
  return (
    <span aria-hidden className={cn('inline-flex shrink-0 items-end whitespace-nowrap', className)}>
      {letters.map((char, i) => {
        if (char === ' ') return <span key={i} style={{ width: height * 0.35 }} />
        const t = n > 1 ? i / (n - 1) - 0.5 : 0
        const theta = t * radians
        const drop = radius * (1 - Math.cos(theta)) + (noise(seed, i + 7) - 0.5) * height * 0.15
        const tilt = (theta * 180) / Math.PI + (noise(seed, i) - 0.5) * 12
        return (
          <span
            key={i}
            className={cn('relative shrink-0 drop-shadow-[0_1px_1px_rgb(28_24_20_/_0.5)]', glue && 'cutout-glue')}
            data-glued={glue ? i < glued : undefined}
            style={{
              rotate: `${tilt.toFixed(1)}deg`,
              translate: `0 ${drop.toFixed(1)}px`,
              marginInline: -height * 0.05,
              zIndex: Math.floor(noise(seed, i + 61) * 3),
            }}
          >
            <Tile char={char} seed={seed} i={i} size={sizeOf(i)} />
          </span>
        )
      })}
    </span>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

// Letters clipped from different magazines: each on its own paper, in its own typeface, glued a bit off.
// Typefaces are whatever the device has; the stacks fall back to the generic families.
const FACES: [family: string, weight: number][] = [
  ['"Cooper Black","Cooper Std","Rockwell Extra Bold",Georgia,serif', 900],
  ['"Bodoni 72","Didot","Bodoni MT",serif', 700],
  ['"Arial Black","Helvetica Neue",Arial,sans-serif', 900],
  ['Impact,Haettenschweiler,"Arial Narrow",sans-serif', 400],
  ['"American Typewriter","Courier New",monospace', 700],
  ['Rockwell,"Roboto Slab","Courier New",serif', 700],
  ['Futura,"Century Gothic","Avenir Next",sans-serif', 800],
  ['"Snell Roundhand","Brush Script MT","Segoe Script",cursive', 700],
  ['Baskerville,"Libre Baskerville",Georgia,serif', 700],
  ['"Marker Felt","Chalkboard SE","Comic Sans MS",cursive', 700],
  ['Copperplate,"Copperplate Gothic Light",serif', 700],
  ['Georgia,"Times New Roman",serif', 900],
]

// Faded print colors, like old magazine pages and posters. Object colors, not interface tokens.
const PAPERS = ['#231f20', '#6e2430', '#f1e7d0', '#f2c744', '#e75a8c', '#9fc3e0', '#f4b49a', '#cdb6dc', '#4a3b35', '#e8dcc0', '#2f3b5c', '#b8442f']

function luminance(hex: string) {
  const [r, g, b] = [1, 3, 5].map(i => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

export function contrast(a: string, b: string) {
  const [x, y] = [luminance(a), luminance(b)].sort((m, n) => n - m)
  return (x + 0.05) / (y + 0.05)
}

// For each paper, the inks that stay readable on it (WCAG AA for text, 4.5:1).
// Newspaper black and white join the paper colors as inks, so the mid tones always have something readable.
const INK_POOL = [...PAPERS, '#141112', '#fbf7ec']
export const INKS: Record<string, string[]> = Object.fromEntries(PAPERS.map(p => [p, INK_POOL.filter(q => contrast(p, q) >= 4.5)]))

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

// Scissors never cut square: each corner lands a little off.
function scissorCut(seed: number, i: number) {
  const c = (k: number) => (noise(seed, i * 8 + k) * 10).toFixed(1)
  return `polygon(${c(1)}% ${c(2)}%, ${100 - +c(3)}% ${c(4)}%, ${100 - +c(5)}% ${100 - +c(6)}%, ${c(7)}% ${100 - +c(8)}%)`
}

function Tile({ char, seed, i, size }: { char: string; seed: number; i: number; size: number }) {
  const paper = pick(PAPERS, seed, i + 11)
  const ink = pick(INKS[paper], seed, i + 23)
  const [family, weight] = pick(FACES, seed, i + 37)
  const upper = noise(seed, i + 53) > 0.55
  return (
    <span
      className="inline-flex items-center justify-center leading-none [filter:url(#worn)]"
      style={{
        background: paper,
        color: ink,
        fontFamily: family,
        fontWeight: weight,
        fontSize: size,
        minWidth: size * 0.62,
        padding: `${(size * 0.1).toFixed(1)}px ${(size * 0.16).toFixed(1)}px ${(size * 0.14).toFixed(1)}px`,
        clipPath: scissorCut(seed, i),
      }}
    >
      {upper ? char.toUpperCase() : char}
    </span>
  )
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
  className?: string
}

// Decorative: the control it labels always carries the same text as its accessible name.
export function CutoutText({ text, height = 22, arc = 0, orbit, reroll = 0, className }: CutoutTextProps) {
  // The server cuts a stable set so hydration matches; the browser recuts at random right after.
  const [seed, setSeed] = useState(() => hash(text))
  useEffect(() => {
    setSeed(Math.floor(Math.random() * 1e6))
  }, [text, reroll])

  const letters = Array.from(text.toLowerCase())
  const n = letters.length
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
              className="absolute drop-shadow-[0_1px_1px_rgb(28_24_20_/_0.5)]"
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
            className="relative shrink-0 drop-shadow-[0_1px_1px_rgb(28_24_20_/_0.5)]"
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

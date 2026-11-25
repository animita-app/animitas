import font from '@/lib/cutout-font.json'
import real from '@/lib/cutout-real.json'
import { cn } from '@/lib/utils'

type Glyph = [file: string, width: number, height: number]
const VARIANTS = font.variants as unknown as Record<string, Record<string, Glyph>>
// Letters cut from real print: animita thanks plaques, street signs, old Chilean magazines and posters.
const REAL = real as unknown as Record<string, { dir: string; glyphs: [index: number, width: number, height: number][] }>

// Fallback papers for letters no real print has given us yet.
const FALLBACK = ['newsprint', 'fashion', 'manila', 'slab', 'tabloid', 'magazine', 'gazette', 'classified']

function hash(text: string) {
  let h = 7
  for (const c of text) h = (h * 31 + c.charCodeAt(0)) % 9973
  return h
}

function noise(seed: number, i: number) {
  const x = Math.sin(seed * 12.9898 + i * 78.233) * 43758.5453
  return x - Math.floor(x)
}

// Scissors never cut square: each corner lands a little off.
function scissorCut(seed: number, i: number) {
  const c = (k: number) => (noise(seed, i * 8 + k) * 9).toFixed(1)
  return `polygon(${c(1)}% ${c(2)}%, ${100 - +c(3)}% ${c(4)}%, ${100 - +c(5)}% ${100 - +c(6)}%, ${c(7)}% ${100 - +c(8)}%)`
}

function glyphFor(char: string, seed: number, i: number): { src: string; ratio: number } | null {
  const pool = REAL[char]
  if (pool?.glyphs.length) {
    const [index, w, h] = pool.glyphs[Math.floor(noise(seed, i + 41) * pool.glyphs.length)]
    return { src: `/cutouts/real/${pool.dir}/${index}.jpg`, ratio: w / h }
  }
  const variant = FALLBACK[Math.floor(noise(seed, i + 17) * FALLBACK.length)]
  const glyph = VARIANTS[variant]?.[char]
  if (!glyph) return null
  const [file, w, h] = glyph
  return { src: `/cutouts/letters/${variant}/${file}.png`, ratio: w / h }
}

interface CutoutTextProps {
  text: string
  height?: number
  // Degrees of arc the word bends through, like letters glued around the top of a shrine.
  arc?: number
  className?: string
}

// Decorative: the control it labels always carries the same text as its accessible name.
export function CutoutText({ text, height = 22, arc = 0, className }: CutoutTextProps) {
  const seed = hash(text)
  const letters = Array.from(text.toLowerCase())
  const n = letters.length
  // Letters sit on a circle whose arc length is the word's width, so the ends fall away like a frown
  // hugging the top of the object. Each letter tilts with the curve and overlaps its neighbor a little.
  const radians = (arc * Math.PI) / 180
  const radius = radians > 0 ? (n * height * 0.72) / radians : 0
  return (
    <span aria-hidden className={cn('inline-flex shrink-0 items-end whitespace-nowrap', className)}>
      {letters.map((char, i) => {
        if (char === ' ') return <span key={i} style={{ width: height * 0.35 }} />
        const glyph = glyphFor(char, seed, i)
        if (!glyph) return null
        const t = n > 1 ? i / (n - 1) - 0.5 : 0
        const theta = t * radians
        const drop = radius * (1 - Math.cos(theta))
        const jitter = (noise(seed, i + 7) - 0.5) * height * 0.15
        const angle = (theta * 180) / Math.PI + (noise(seed, i) - 0.5) * 8
        const size = height * (0.9 + noise(seed, i + 3) * 0.35)
        return (
          <span
            key={i}
            className="relative shrink-0 drop-shadow-[0_1px_1px_rgb(28_24_20_/_0.7)]"
            style={{
              rotate: `${angle.toFixed(1)}deg`,
              translate: `0 ${(drop + jitter).toFixed(1)}px`,
              // A sliver like an "i" would vanish under its neighbors, so it sits on top and keeps its room.
              marginInline: glyph.ratio < 0.4 ? 1 : -height * 0.06,
              zIndex: glyph.ratio < 0.4 ? 3 : i % 2 ? 2 : 1,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={glyph.src}
              alt=""
              width={Math.round(size * glyph.ratio)}
              height={Math.round(size)}
              draggable={false}
              className="block contrast-125 saturate-125"
              style={{ clipPath: scissorCut(seed, i) }}
            />
          </span>
        )
      })}
    </span>
  )
}

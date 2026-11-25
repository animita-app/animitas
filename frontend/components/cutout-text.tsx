import font from '@/lib/cutout-font.json'
import { cn } from '@/lib/utils'

type Glyph = [file: string, width: number, height: number]
const VARIANTS = font.variants as unknown as Record<string, Record<string, Glyph>>

// Papers that sit well together on warm paper: newsprint, black and manila, with red as the one loud scrap.
const QUIET = ['newsprint', 'fashion', 'manila', 'slab', 'newsprint', 'fashion']
const LOUD = ['tabloid']

function hash(text: string) {
  let h = 7
  for (const c of text) h = (h * 31 + c.charCodeAt(0)) % 9973
  return h
}

function noise(seed: number, i: number) {
  const x = Math.sin(seed * 12.9898 + i * 78.233) * 43758.5453
  return x - Math.floor(x)
}

export function variantFor(text: string, index: number) {
  const r = noise(hash(text), index + 101)
  return r < 0.18 ? LOUD[0] : QUIET[Math.floor(noise(hash(text), index) * QUIET.length)]
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
  return (
    <span aria-hidden className={cn('inline-flex shrink-0 items-end whitespace-nowrap', className)}>
      {letters.map((char, i) => {
        if (char === ' ') return <span key={i} style={{ width: height * 0.4 }} />
        const variant = variantFor(text, i)
        const glyph = VARIANTS[variant]?.[char]
        if (!glyph) return null
        const [file, w, h] = glyph
        const t = n > 1 ? i / (n - 1) - 0.5 : 0
        const angle = t * arc + (noise(seed, i) - 0.5) * 14
        const lift = Math.cos((t * arc * Math.PI) / 180) * height * (arc / 90) - (noise(seed, i + 7) - 0.5) * height * 0.35
        const size = height * (0.9 + noise(seed, i + 3) * 0.3)
        return (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={i}
            src={`/cutouts/letters/${variant}/${file}.png`}
            alt=""
            width={Math.round((size * w) / h)}
            height={Math.round(size)}
            draggable={false}
            className="-mx-0.5 shrink-0 drop-shadow-[0_1px_1px_rgb(28_24_20_/_0.5)]"
            style={{ rotate: `${angle.toFixed(1)}deg`, translate: `0 ${(-lift).toFixed(1)}px` }}
          />
        )
      })}
    </span>
  )
}

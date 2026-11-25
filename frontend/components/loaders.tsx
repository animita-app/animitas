import Image from 'next/image'
import { cn } from '@/lib/utils'

// The real candle from the shelf, lit or out. Loading and error states use it instead of spinners.
export function Candle({ lit = true, className }: { lit?: boolean; className?: string }) {
  return (
    <span className={cn('relative inline-flex', className)}>
      {lit && <span aria-hidden className="candle-light pointer-events-none absolute -inset-1/2 rounded-full bg-[radial-gradient(circle,rgb(240_150_60_/_0.5),transparent_60%)]" />}
      <Image
        src="/cutouts/candle.png"
        alt=""
        width={160}
        height={146}
        draggable={false}
        className={cn('relative h-full w-auto drop-shadow-[0_4px_4px_rgb(28_24_20_/_0.35)]', lit ? 'candle-burning' : 'candle-out')}
      />
    </span>
  )
}

// A photo that hasn't developed yet, in place of an image that is still loading.
export function DevelopingPhoto({ className }: { className?: string }) {
  return <span aria-hidden className={cn('developing block aspect-square', className)} />
}

// Rolls across the bottom of the screen, Road Runner style, until whatever it waits for arrives.
export function Tumbleweed({ className }: { className?: string }) {
  return (
    <span aria-hidden className={cn('pointer-events-none absolute inset-x-0 bottom-28 block h-24 overflow-hidden', className)}>
      <span className="tumble-track absolute bottom-0 left-0 block w-20">
        <span className="tumble-shadow absolute -bottom-1 left-1/2 block h-2 w-16 -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(28_24_20_/_0.6),transparent)]" />
        <span className="tumble-hop block">
          <Image src="/cutouts/tumbleweed.png" alt="" width={160} height={130} draggable={false} className="tumble-spin h-auto w-20" />
        </span>
      </span>
    </span>
  )
}

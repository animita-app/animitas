import Image from 'next/image'
import { cn } from '@/lib/utils'
import { CutoutText } from '@/components/cutout-text'

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

// "cargando" glued on letter by letter while whatever it waits for arrives.
export function GluingWord({ text = 'cargando', className }: { text?: string; className?: string }) {
  return <CutoutText text={text} height={30} glue className={className} />
}

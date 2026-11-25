import Image from "next/image"
import type { Animita } from "@/types/animita"
import { cn } from "@/lib/utils"
import { animitaName } from "@/lib/animitas"
import { CutoutText } from "@/components/cutout-text"

const SMALL = [
  'top-14 right-4 rotate-3',
  'top-1/3 right-10 -rotate-2',
  'bottom-2 right-2 rotate-1',
]

// Loose prints on the table: the first one large, up to three more fanned along its edge so each still
// shows. The rest are counted, and the full page has every one.
export function LoosePrints({ site, className }: { site: Animita; className?: string }) {
  const images = site.images ?? []
  if (!images.length) return null
  const [first, ...rest] = images
  const shown = rest.slice(0, 3)
  const hidden = rest.length - shown.length
  return (
    <div className={cn('relative px-8 pt-10 pb-6', className)}>
      <div className="print-frame relative aspect-4/3 w-3/4 -rotate-1 p-2"><div className="photo-vignette relative size-full overflow-hidden">
        <Image src={first} alt={animitaName(site.title)} fill sizes="(max-width: 768px) 75vw, 360px" className="object-cover [filter:url(#stipple)]" priority />
      </div></div>
      {shown.map((src, i) => (
        <div key={src} className={cn('photo-vignette print-frame absolute aspect-4/3 w-1/4 overflow-hidden p-1 sm:w-1/3 sm:p-1.5', SMALL[i])}>
          <Image src={src} alt={`Foto ${i + 2} de ${images.length}`} fill sizes="160px" className="object-cover [filter:url(#stipple)]" />
        </div>
      ))}
      {hidden > 0 && (
        <span className="absolute right-4 -bottom-3">
          <span className="sr-only">y {hidden} fotos más</span>
          <CutoutText text={`${hidden} más`} height={20} />
        </span>
      )}
    </div>
  )
}

const WALL_TILTS = ['-rotate-2', 'rotate-1', '-rotate-1', 'rotate-2', 'rotate-[0.5deg]', '-rotate-[1.5deg]']

// Every print laid out on the table for the full page: the first one large, the rest in a loose grid,
// each a little crooked and all of them seen.
export function PrintWall({ site, className }: { site: Animita; className?: string }) {
  const images = site.images ?? []
  if (!images.length) return null
  return (
    <ul className={cn('grid grid-cols-2 gap-6', className)}>
      {images.map((src, i) => (
        // An instant print: a white frame, wider at the bottom where you'd write on it.
        <li
          key={src}
          className={cn('print-frame p-2 pb-10', i === 0 && 'col-span-2 p-3 pb-14', WALL_TILTS[i % WALL_TILTS.length])}
        >
          <div className={cn('photo-vignette relative overflow-hidden', i === 0 ? 'aspect-4/3' : 'aspect-square')}>
            <Image
              src={src}
              alt={i === 0 ? animitaName(site.title) : `Foto ${i + 1} de ${images.length}`}
              fill
              sizes={i === 0 ? '(max-width: 768px) 90vw, 520px' : '(max-width: 768px) 45vw, 260px'}
              className="object-cover [filter:url(#stipple)] hover:[filter:none]"
              priority={i === 0}
            />
          </div>
        </li>
      ))}
    </ul>
  )
}

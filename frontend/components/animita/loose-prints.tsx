import Image from "next/image"
import type { Animita } from "@/types/animita"
import { cn } from "@/lib/utils"
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
      <div className="photo-vignette relative aspect-4/3 w-3/4 -rotate-1 overflow-hidden bg-neutral-light-1 shadow-lg">
        <Image src={first} alt={`Animita de ${site.title}`} fill sizes="(max-width: 768px) 75vw, 360px" className="object-cover [filter:url(#stipple)]" priority />
      </div>
      {shown.map((src, i) => (
        <div key={src} className={cn('photo-vignette absolute aspect-4/3 w-1/3 overflow-hidden border-4 border-neutral-light-1 shadow-md', SMALL[i])}>
          <Image src={src} alt={`Foto ${i + 2} de ${images.length}`} fill sizes="160px" className="object-cover [filter:url(#stipple)]" />
        </div>
      ))}
      {hidden > 0 && (
        <span className="absolute right-3 bottom-0">
          <span className="sr-only">y {hidden} fotos más</span>
          <CutoutText text={`${hidden} más`} height={20} />
        </span>
      )}
    </div>
  )
}

import Image from "next/image"
import type { Animita } from "@/types/animita"
import { cn } from "@/lib/utils"

const TILTS = ['-rotate-2', 'rotate-1', '-rotate-1', 'rotate-2']

// Loose prints instead of a framed carousel: the first one large, the rest tucked behind it.
export function LoosePrints({ site, className }: { site: Animita; className?: string }) {
  if (!site.images?.length) return null
  const [first, ...rest] = site.images
  return (
    <div className={cn('relative px-8 pt-10 pb-4', className)}>
      {rest.slice(0, 3).map((src, i) => (
        <div
          key={src}
          aria-hidden
          className={cn('photo-vignette absolute top-8 aspect-4/3 w-2/5 overflow-hidden shadow-md', TILTS[(i + 1) % TILTS.length], i === 0 ? 'right-6' : i === 1 ? 'right-14 top-12' : 'right-2 top-16')}
        >
          <Image src={src} alt="" fill sizes="180px" className="object-cover [filter:url(#stipple)]" />
        </div>
      ))}
      <div className="photo-vignette relative aspect-4/3 w-4/5 -rotate-1 overflow-hidden shadow-lg">
        <Image src={first} alt={`Animita de ${site.title}`} fill sizes="(max-width: 768px) 80vw, 360px" className="object-cover [filter:url(#stipple)]" priority />
      </div>
    </div>
  )
}


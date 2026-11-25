'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { animitaHref } from '@/lib/routes'
import { CutoutText } from '@/components/cutout-text'
import { cn } from '@/lib/utils'

interface AnimitaCardProps {
  site: { slug: string; title: string; images: string[] | null; city_region?: string | null }
}

// Loose prints never land square on the table.
const TILTS = ['-rotate-1', 'rotate-1', '-rotate-2', 'rotate-[0.5deg]', 'rotate-2', '-rotate-[0.5deg]']

function tiltFor(slug: string) {
  let h = 0
  for (const c of slug) h = (h * 31 + c.charCodeAt(0)) % 997
  return TILTS[h % TILTS.length]
}

// A print with no caption: the name is glued on in cut-out letters when you reach for it.
export function AnimitaCard({ site }: AnimitaCardProps) {
  const imageUrl = site.images?.[0]
  // Letters are only cut while someone reaches for the print, so a long list doesn't carry hundreds of
  // hidden tiles. Touch has no hover, so there the name stays on.
  const [reaching, setReaching] = useState(false)
  const [touch, setTouch] = useState(false)
  useEffect(() => setTouch(window.matchMedia?.('(hover: none)').matches ?? false), [])
  const label = site.city_region ? `${site.title}, ${site.city_region}` : site.title

  return (
    <Link
      href={animitaHref(site.slug)}
      aria-label={label}
      onPointerEnter={() => setReaching(true)}
      onPointerLeave={() => setReaching(false)}
      onFocus={() => setReaching(true)}
      onBlur={() => setReaching(false)}
      className={cn(
        'group relative block bg-neutral-light-1 p-1.5 pb-5 shadow-[0_1px_0_rgb(28_24_20_/_0.12),0_10px_18px_-12px_rgb(28_24_20_/_0.5)] outline-none transition-[rotate,scale] duration-200 ease-out hover:rotate-0 hover:scale-[1.02] focus-visible:rotate-0 focus-visible:ring-[3px] focus-visible:ring-ring/50 motion-reduce:transition-none',
        tiltFor(site.slug)
      )}
    >
      <div className="photo-vignette relative aspect-square overflow-hidden bg-background-weak">
        {imageUrl && (
          <Image
            src={imageUrl}
            alt=""
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover [filter:url(#stipple)] group-hover:[filter:none] group-focus-visible:[filter:none]"
          />
        )}
      </div>
      {(reaching || touch) && (
        <span className="pointer-events-none absolute inset-x-2 bottom-2 flex flex-wrap items-end justify-center gap-x-2 gap-y-1">
          {site.title.split(/\s+/).filter(Boolean).map((word, i) => (
            <CutoutText key={`${word}-${i}`} text={word} height={24} />
          ))}
        </span>
      )}
    </Link>
  )
}

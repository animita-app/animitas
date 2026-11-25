'use client'

import { useEffect, useState } from 'react'
import type React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { animitaHref } from '@/lib/routes'
import { CutoutText } from '@/components/cutout-text'
import { cn } from '@/lib/utils'

interface AnimitaCardProps {
  site: { slug: string; title: string; images: string[] | null; city_region?: string | null }
  // Something pinned to the print's corner (new recuerdos), part of the same object: it tilts and grows with it.
  badge?: React.ReactNode
  // Read after the name, for what the badge says.
  badgeLabel?: string
}

// Loose prints never land square on the table.
const TILTS = ['-rotate-1', 'rotate-1', '-rotate-2', 'rotate-[0.5deg]', 'rotate-2', '-rotate-[0.5deg]']

function tiltFor(slug: string) {
  let h = 0
  for (const c of slug) h = (h * 31 + c.charCodeAt(0)) % 997
  return TILTS[h % TILTS.length]
}

// A print with no caption: the name is glued on in cut-out letters when you reach for it.
export function AnimitaCard({ site, badge, badgeLabel }: AnimitaCardProps) {
  const imageUrl = site.images?.[0]
  // Letters are only cut while someone reaches for the print, so a long list doesn't carry hundreds of
  // hidden tiles. Touch has no hover, so there the name stays on.
  const [reaching, setReaching] = useState(false)
  // Counts each time the name is reached for, so it's glued on with a fresh cut every time.
  const [cuts, setCuts] = useState(0)
  const [touch, setTouch] = useState(false)
  useEffect(() => setTouch(window.matchMedia?.('(hover: none)').matches ?? false), [])
  const label = [site.title, site.city_region, badgeLabel].filter(Boolean).join(', ')

  return (
    <Link
      href={animitaHref(site.slug)}
      aria-label={label}
      onPointerEnter={() => { setReaching(true); setCuts(n => n + 1) }}
      onPointerLeave={() => setReaching(false)}
      onFocus={() => { setReaching(true); setCuts(n => n + 1) }}
      onBlur={() => setReaching(false)}
      className={cn(
        'print-frame group relative block p-1.5 pb-5 outline-none transition-[rotate,scale] duration-200 ease-out hover:rotate-0 hover:scale-[1.02] focus-visible:rotate-0 focus-visible:ring-[3px] focus-visible:ring-ring/50 motion-reduce:transition-none',
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
        // On touch the name is always there, so it stays small and sits on the print's bottom margin
        // instead of covering the photo.
        <span className={cn('pointer-events-none absolute inset-x-2 flex flex-wrap items-end justify-center gap-x-1.5 gap-y-0.5', touch ? 'bottom-1' : 'bottom-2')}>
          {site.title.split(/\s+/).filter(Boolean).map((word, i) => (
            <CutoutText key={`${word}-${i}`} text={word} height={touch ? 15 : 24} reroll={cuts} />
          ))}
        </span>
      )}
      {badge && <span aria-hidden className="pointer-events-none absolute -top-3 -right-3 z-10 rotate-6">{badge}</span>}
    </Link>
  )
}

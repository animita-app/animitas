'use client'

import { useState } from 'react'
import Image from 'next/image'
import { CutoutText } from '@/components/cutout-text'
import { cn } from '@/lib/utils'

type Orbit = { radius: number; angle: number; clockwise?: boolean }

// Over an object standing on the bottom edge, the name arcs across its top like a frown.
const OVER: Orbit = { radius: 84, angle: 270 }

// A real object standing on the page. Its name only shows, in cut-out letters glued around it, when you
// reach for it, and every time it is cut anew. Goes inside a `.shelf-item` link or button, which carries
// the accessible name.
export function ShelfObject({ src, label, size, active, orbit = OVER }: { src: string; label: string; size: string; active?: boolean; orbit?: Orbit }) {
  const [reroll, setReroll] = useState(0)
  const mid = (orbit.angle * Math.PI) / 180
  return (
    <span className="contents" onPointerEnter={() => setReroll(r => r + 1)} onFocus={() => setReroll(r => r + 1)}>
      {/* A patch of paper behind the object and its letters, so the map underneath doesn't show through. */}
      <span aria-hidden className="shelf-label pointer-events-none absolute left-1/2 top-1/2 -z-10 size-0">
        <span className="absolute size-48 rounded-full bg-[radial-gradient(closest-side,var(--color-background)_50%,transparent)]" style={{ left: Math.cos(mid) * orbit.radius, top: Math.sin(mid) * orbit.radius, translate: '-50% -50%' }} />
      </span>
      <span className="shelf-label pointer-events-none absolute left-1/2 top-1/2 z-10 size-0">
        <CutoutText text={label} height={26} orbit={orbit} reroll={reroll} />
      </span>
      <Image
        src={src}
        alt=""
        width={160}
        height={160}
        draggable={false}
        className={cn('w-auto object-contain drop-shadow-[0_4px_4px_rgb(28_24_20_/_0.35)]', size, !active && 'shelf-idle')}
      />
    </span>
  )
}

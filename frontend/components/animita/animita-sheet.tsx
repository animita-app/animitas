"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Animita } from "@/types/animita"
import { useIsMobileOverlay } from "@/hooks/use-mobile"
import { Drawer, DrawerContent, DrawerDescription, DrawerTitle } from "@/components/ui/drawer"
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { AnimitaDetails } from "@/app/animita/[slug]/sections/animita-details"

const SNAP_POINTS = [0.55, 1]

const TILTS = ['-rotate-2', 'rotate-1', '-rotate-1', 'rotate-2']

// Loose prints instead of a framed carousel: the first one large, the rest tucked behind it.
function Photos({ site }: { site: Animita }) {
  if (!site.images?.length) return null
  const [first, ...rest] = site.images
  return (
    <div className="relative px-8 pt-10 pb-4">
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

export function AnimitaSheet({ site }: { site: Animita }) {
  const router = useRouter()
  const isMobile = useIsMobileOverlay()
  const [snap, setSnap] = useState<number | string | null>(SNAP_POINTS[0])

  const close = (open: boolean) => {
    if (!open) router.back()
  }

  if (isMobile === undefined) return null

  if (isMobile) {
    return (
      <Drawer open onOpenChange={close} snapPoints={SNAP_POINTS} activeSnapPoint={snap} setActiveSnapPoint={setSnap}>
        <DrawerContent className="pb-safe border-0 bg-transparent bg-[linear-gradient(to_bottom,transparent,var(--color-background)_12%)]">
          <DrawerTitle className="sr-only">Animita de {site.title}</DrawerTitle>
          <DrawerDescription className="sr-only">Su historia, velas y comentarios</DrawerDescription>
          <div className="overflow-y-auto">
            <Photos site={site} />
            <div className="p-6">
              <AnimitaDetails site={site} />
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Sheet open onOpenChange={close} modal={false}>
      <SheetContent
        side="right"
        className="gap-0 overflow-y-auto border-0 shadow-none sm:max-w-lg bg-transparent bg-[linear-gradient(to_right,transparent,color-mix(in_oklab,var(--color-background)_92%,transparent)_16%,var(--color-background)_30%)]"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <SheetTitle className="sr-only">Animita de {site.title}</SheetTitle>
        <SheetDescription className="sr-only">Su historia, velas y comentarios</SheetDescription>
        <Photos site={site} />
        <div className="py-6 pr-10 pl-16">
          <AnimitaDetails site={site} />
        </div>
      </SheetContent>
    </Sheet>
  )
}

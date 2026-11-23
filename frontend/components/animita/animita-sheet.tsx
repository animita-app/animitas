"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { HeritageSite } from "@/types/heritage"
import { useIsMobileOverlay } from "@/hooks/use-mobile"
import { Drawer, DrawerContent, DrawerDescription, DrawerTitle } from "@/components/ui/drawer"
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet"
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel"
import { AnimitaDetails } from "@/app/animita/[slug]/sections/animita-details"

const SNAP_POINTS = [0.55, 1]

function Photos({ site }: { site: HeritageSite }) {
  if (!site.images?.length) return null
  return (
    <Carousel className="bg-black aspect-video">
      <CarouselContent className="ml-0 h-full">
        {site.images.map((src, i) => (
          <CarouselItem key={src} className="pl-0 relative aspect-video">
            <Image src={src} alt={`${site.title}, foto ${i + 1}`} fill sizes="(max-width: 768px) 100vw, 448px" className="object-contain" />
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  )
}

export function AnimitaSheet({ site }: { site: HeritageSite }) {
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
        <DrawerContent className="pb-safe">
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
      <SheetContent side="right" className="gap-0 overflow-y-auto sm:max-w-md bg-background-weak top-16 bottom-4 right-4 h-auto rounded-lg border" onInteractOutside={(e) => e.preventDefault()}>
        <SheetTitle className="sr-only">Animita de {site.title}</SheetTitle>
        <SheetDescription className="sr-only">Su historia, velas y comentarios</SheetDescription>
        <Photos site={site} />
        <div className="p-8">
          <AnimitaDetails site={site} />
        </div>
      </SheetContent>
    </Sheet>
  )
}

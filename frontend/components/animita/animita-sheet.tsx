"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Animita } from "@/types/animita"
import { animitaName } from "@/lib/animitas"
import { useIsMobileOverlay } from "@/hooks/use-mobile"
import { Drawer, DrawerContent, DrawerDescription, DrawerTitle } from "@/components/ui/drawer"
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet"
import { LoosePrints } from "@/components/animita/loose-prints"
import { AnimitaDetails } from "@/app/animita/[slug]/sections/animita-details"

const SNAP_POINTS = [0.55, 1]

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
        <DrawerContent className="pb-safe border-0 data-[vaul-drawer-direction=bottom]:rounded-none data-[vaul-drawer-direction=bottom]:border-0 bg-transparent bg-[linear-gradient(to_bottom,transparent,var(--color-background)_12%)]">
          <DrawerTitle className="sr-only">{animitaName(site.title)}</DrawerTitle>
          <DrawerDescription className="sr-only">Su historia, velas y recuerdos</DrawerDescription>
          <div className="overflow-y-auto">
            <LoosePrints site={site} />
            <div className="p-6">
              <AnimitaDetails site={site} compact />
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
        <SheetTitle className="sr-only">{animitaName(site.title)}</SheetTitle>
        <SheetDescription className="sr-only">Su historia, velas y recuerdos</SheetDescription>
        <LoosePrints site={site} />
        <div className="py-6 pr-10 pl-16">
          <AnimitaDetails site={site} compact />
        </div>
      </SheetContent>
    </Sheet>
  )
}

"use client"

import { useState } from "react"

import { MemorialIntro } from "@/components/animita/memorial-intro"
import { ResponsiveDialog } from "@/components/ui/responsive-dialog"
import { useMediaQuery } from "@/hooks/use-media-query"

export default function DefaultModal() {
  const isDesktop = useMediaQuery("(min-width: 1024px)")
  const [open, setOpen] = useState(true)

  if (!isDesktop) {
    return null
  }

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={setOpen}
      title="Bienvenido a Ánima"
      description="Explora el mapa de memoriales populares"
    >
      <MemorialIntro />
    </ResponsiveDialog>
  )
}
